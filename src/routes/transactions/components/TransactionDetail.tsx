import {
    Alert,
    AlertIcon,
    Button,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    Editable,
    EditablePreview,
    EditableTextarea,
    Flex,
    HStack,
    Image,
    Img,
    Spacer,
    StackDivider,
    Text,
    useDisclosure,
    useToast,
    VStack
} from '@chakra-ui/react';
import type { Web3Provider } from '@ethersproject/providers';
import { EditableControls } from '@pesabooks/components/Editable/EditableControls';
import { TriggerEditableControls } from '@pesabooks/components/Editable/TriggerEditableControls';
import Loading from '@pesabooks/components/Loading';
import { formatBigNumber } from '@pesabooks/utils/bignumber-utils';
import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types';
import { BigNumber } from 'ethers';
import { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { getAllCategories } from '@pesabooks/services/categoriesService';
import {
    estimateTransaction
} from '@pesabooks/services/estimationService';
import { getSafeNonce, getSafeTransaction } from '@pesabooks/services/gnosisServices';
import { getMembers } from '@pesabooks/services/membersService';
import {
    confirmTransaction,
    createRejectTransaction,
    executeTransaction,
    getTransactionById,
    updateTransactionCategory,
    updateTransactionMemo
} from '@pesabooks/services/transactionsServices';

import {
    ReviewAndSendTransactionModal,
    ReviewAndSendTransactionModalRef
} from '@pesabooks/components/ReviewAndSendTransactionModal';
import { UserWalletCard } from '@pesabooks/components/UserWalletCard';
import { WalletAddress } from '@pesabooks/components/WalletAddress';
import { usePool, useWeb3Auth } from '@pesabooks/hooks';
import { compareAddress, mathAddress } from '@pesabooks/utils/addresses-utils';
import {
    getTransactionDescription,
    getTransactionTypeLabel
} from '@pesabooks/utils/transactions-utils';
import { Category, Transaction, User } from '../../../types';
import {
    AddOrRemoveOwnerData,
    ChangeThresholdData,
    SwapData,
    TransferData,
    WalletConnectData
} from '../../../types/transaction';
import { EditableSelect } from './EditableSelect';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import { TransactionTimeline } from './TransactionTimeline';
import { TxPropertyBox } from './TxPropertyBox';

export interface TransactionDetailRef {
  open: (id: number) => void;
}

export const TransactionDetail = forwardRef((_props: any, ref: Ref<TransactionDetailRef>) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { pool } = usePool();
  const { provider, account, user } = useWeb3Auth();
  const [loading, setLoading] = useState(true);
  const reviewTxRef = useRef<ReviewAndSendTransactionModalRef>(null);
  const [currentSafeNonce, setCurrentSafeNonce] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<{
    transaction: Transaction | null;
    safeTransaction: SafeMultisigTransactionResponse | null;
    safeRejectionTransaction: SafeMultisigTransactionResponse | null;
  }>({ transaction: null, safeTransaction: null, safeRejectionTransaction: null });
  const [categories, setCategories] = useState<Category[]>([]);
  const toast = useToast();
  const signer = (provider as Web3Provider)?.getSigner();

  const { transaction, safeTransaction, safeRejectionTransaction } = transactions;
  const threshold = transaction?.threshold;

  const loadTransaction = async (id: number) => {
    let transaction: Transaction | null;
    let safeTransaction: SafeMultisigTransactionResponse | null = null;
    let safeRejectionTransaction: SafeMultisigTransactionResponse | null = null;

    transaction = await getTransactionById(id);
    if (pool && transaction?.safe_tx_hash)
      safeTransaction = await getSafeTransaction(pool.chain_id, transaction.safe_tx_hash);
    if (pool && transaction?.reject_safe_tx_hash)
      safeRejectionTransaction = await getSafeTransaction(
        pool.chain_id,
        transaction.reject_safe_tx_hash,
      );

    setTransactions({ transaction, safeTransaction, safeRejectionTransaction });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (pool) {
        getMembers(pool.id, true).then((members) => setUsers(members?.map((m) => m.user!)));
        getSafeNonce(pool.chain_id, pool.gnosis_safe_address!).then(setCurrentSafeNonce);
        getAllCategories(pool.id, { activeOnly: true }).then(setCategories);
      }
    };
    fetchData();
  }, [pool, transaction]);

  useImperativeHandle(ref, () => ({
    open: async (transactionId: number) => {
      onOpen();
      await loadTransaction(transactionId);
      setLoading(false);
    },
  }));

  const confirmations = [
    ...(safeTransaction?.confirmations?.map((c) => ({ ...c, rejected: false })) ?? []),
    ...(safeRejectionTransaction?.confirmations?.map((c) => ({
      ...c,
      rejected: true,
    })) ?? []),
  ];

  const hasApproved: boolean = !!safeTransaction?.confirmations?.find((c) =>
    compareAddress(c.owner, account),
  );

  const hasRejected: boolean = !!safeRejectionTransaction?.confirmations?.find((c) =>
    compareAddress(c.owner, account),
  );

  const canExecute = safeTransaction?.confirmations?.length === threshold;

  const canExecuteRejection = safeRejectionTransaction?.confirmations?.length === threshold;

  const canExecuteOne = canExecute || canExecuteRejection;

  const isNextExecution = currentSafeNonce === transaction?.safe_nonce;

  const approve = async () => {
    if (!pool || !transaction) return;

    reviewTxRef.current?.open(
      'Approve: ' + getTransactionDescription(transaction, users),
      transaction.type,
      () => Promise.resolve(BigNumber.from(0)),
      async () => {
        await confirmTransaction(
          user!,
          signer,
          pool,
          transaction,
          transaction?.safe_tx_hash!,
          false,
        );
        loadTransaction(transaction.id);
        toast({ title: 'You approved the transaction', status: 'success' });
      },
      { labelSubmit: 'Approve', closeOnSuccess: true },
    );
  };

  const execute = (isRejection: boolean) => {
    const { type, safe_tx_hash, reject_safe_tx_hash } = transaction!;
    const safeTxHash = isRejection ? reject_safe_tx_hash! : safe_tx_hash!;

    const message = isRejection
      ? `Execute rejection`
      : getTransactionDescription(transaction!, users);

    reviewTxRef.current?.open(
      message,
      isRejection ? 'rejection' : type,
      () => estimateTransaction(provider!, transaction!.transaction_data),
      async () => {
        const tx = await executeTransaction(
          user!,
          signer,
          pool!,
          transaction as Transaction,
          safeTxHash!,
          isRejection!,
        );
        loadTransaction(transaction!.id);
        return {
          hash: tx?.hash,
        };
      },
    );
  };

  const reject = async () => {
    if (!pool || !safeTransaction || !transaction) return;

    reviewTxRef.current?.open(
      'Reject: ' + getTransactionDescription(transaction, users),
      transaction.type,
      () => Promise.resolve(BigNumber.from(0)),
      async () => {
        if (transaction.reject_safe_tx_hash) {
          await confirmTransaction(
            user!,
            signer,
            pool,
            transaction,
            transaction.reject_safe_tx_hash,
            true,
          );
        } else {
          await createRejectTransaction(
            user!,
            signer,
            pool,
            transaction.id,
            safeTransaction?.nonce,
          );
        }
        loadTransaction(transaction.id);
        toast({ title: 'You rejected the transaction', status: 'success' });
      },
      { labelSubmit: 'Reject', closeOnSuccess: true },
    );
  };

  const closeDrawer = () => {
    onClose();
    setTransactions({
      transaction: null,
      safeTransaction: null,
      safeRejectionTransaction: null,
    });
    setLoading(true);
  };

  const isExecuted = !!transaction?.hash;

  return (
    <>
      <Drawer isOpen={isOpen} placement="right" onClose={closeDrawer} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <HStack gap={4}>
              <Text>Transactions #{transaction?.id}</Text>
              {transaction && <TransactionStatusBadge type={transaction?.status} />}
            </HStack>
          </DrawerHeader>

          {loading ? (
            <Loading />
          ) : (
            <DrawerBody>
              <Flex direction="column" gap={4}>
                <TxPropertyBox label="Type" value={getTransactionTypeLabel(transaction?.type)} />
                <TxPropertyBox
                  label="Description"
                  value={getTransactionDescription(transaction!, users)}
                />
                {transaction?.type === 'unlockToken' && (
                  <TxPropertyBox label="Token" flex="1">
                    <Flex align="center">
                      <Image
                        w="20px"
                        h="20px"
                        src={(transaction?.metadata as any)?.token?.img}
                        alt=""
                      />
                      <Text ml="10px">{(transaction?.metadata as any)?.token.symbol}</Text>
                    </Flex>
                  </TxPropertyBox>
                )}

                {transaction?.type === 'swap' && (
                  <Flex gap={4}>
                    <TxPropertyBox label="Paid" flex="1">
                      <Flex align="center">
                        <Image
                          w="20px"
                          h="20px"
                          src={(transaction?.metadata as SwapData)?.src_token?.img}
                          alt=""
                        />
                        <Text ml="1">
                          {formatBigNumber(
                            (transaction?.metadata as SwapData)?.src_amount,
                            (transaction?.metadata as SwapData)?.src_token?.decimals,
                          )}{' '}
                          {(transaction?.metadata as SwapData)?.src_token?.symbol}
                        </Text>
                      </Flex>
                    </TxPropertyBox>

                    <TxPropertyBox label="Received" flex="1">
                      <Flex align="center">
                        <Text mr={2}>~</Text>
                        <Image
                          w="20px"
                          h="20px"
                          src={(transaction?.metadata as SwapData)?.dest_token?.img}
                          alt=""
                        />
                        <Text ml="1">
                          {formatBigNumber(
                            (transaction?.metadata as SwapData)?.dest_amount,
                            (transaction?.metadata as SwapData)?.dest_token?.decimals,
                          )}{' '}
                          {(transaction?.metadata as SwapData)?.dest_token?.symbol}
                        </Text>
                      </Flex>
                    </TxPropertyBox>
                  </Flex>
                )}
                <Flex gap={4}>
                  {transaction?.type === 'deposit' && (
                    <TxPropertyBox label="From" flex="1">
                      {!!(transaction?.metadata as TransferData)?.transfer_from && (
                        <UserWalletCard
                          user={mathAddress(
                            users,
                            (transaction?.metadata as TransferData)?.transfer_from,
                          )}
                        />
                      )}
                    </TxPropertyBox>
                  )}

                  {transaction?.type === 'withdrawal' && (
                    <TxPropertyBox label="To" flex="1">
                      <UserWalletCard
                        user={mathAddress(
                          users,
                          (transaction?.metadata as TransferData)?.transfer_to,
                        )}
                      />
                    </TxPropertyBox>
                  )}

                  {(transaction?.type === 'deposit' || transaction?.type === 'withdrawal') && (
                    <TxPropertyBox label="Amount" flex="1">
                      <Flex align="center">
                        <Image
                          w="20px"
                          h="20px"
                          src={(transaction?.metadata as TransferData)?.token?.image}
                          alt=""
                        />
                        <Text ml="10px">
                          {(transaction?.metadata as TransferData)?.amount}{' '}
                          {(transaction?.metadata as TransferData)?.token.symbol}
                        </Text>
                      </Flex>
                    </TxPropertyBox>
                  )}
                </Flex>
                {transaction?.type === 'walletConnect' && (
                  <Flex gap={4}>
                    <TxPropertyBox flex="1">
                      <HStack>
                        <Img
                          src={(transaction?.metadata as WalletConnectData)?.peer_data?.icons[0]}
                        />
                        <VStack
                          display={{ base: 'none', md: 'flex' }}
                          alignItems="flex-start"
                          spacing="1px"
                          ml="2"
                        >
                          <Text fontSize="sm">
                            {(transaction?.metadata as WalletConnectData).peer_data?.name}
                          </Text>
                        </VStack>
                      </HStack>
                    </TxPropertyBox>

                    <TxPropertyBox
                      flex="1"
                      label="Function"
                      value={`${(transaction?.metadata as WalletConnectData).functionName}`}
                    />
                  </Flex>
                )}

                {transaction?.type === 'changeThreshold' && (
                  <TxPropertyBox
                    label="Threshold"
                    value={`${(transaction?.metadata as ChangeThresholdData).threshold}`}
                  />
                )}

                {transaction?.type === 'removeOwner' && (
                  <Flex gap={4}>
                    <TxPropertyBox
                      flex="1"
                      label="Current Threshold"
                      value={`${(transaction?.metadata as AddOrRemoveOwnerData).current_threshold}`}
                    />

                    <TxPropertyBox
                      flex="1"
                      label="New Threshold"
                      value={`${(transaction?.metadata as AddOrRemoveOwnerData).threshold}`}
                    />
                  </Flex>
                )}

                <TxPropertyBox label="Category">
                  <EditableSelect
                    onSelect={(categoryId) =>
                      updateTransactionCategory(transaction?.id ?? 0, +categoryId)
                    }
                    defaultValue={transaction?.category_id ?? undefined}
                    options={categories.map((c) => ({ value: c.id, name: c.name }))}
                  />
                </TxPropertyBox>

                <TxPropertyBox label="Memo">
                  <Editable
                    defaultValue={transaction?.memo ?? undefined}
                    isPreviewFocusable={false}
                    submitOnBlur={false}
                    onSubmit={(val) => updateTransactionMemo(transaction?.id ?? 0, val)}
                  >
                    <Flex>
                      <EditablePreview />
                      <Spacer />
                      <TriggerEditableControls />
                    </Flex>
                    <EditableTextarea />
                    <EditableControls />
                  </Editable>
                </TxPropertyBox>

                {transaction?.hash && pool?.chain_id && (
                  <TxPropertyBox label="Transaction Hash">
                    <WalletAddress chainId={pool.chain_id} address={transaction.hash} type="tx" />
                  </TxPropertyBox>
                )}
              </Flex>

              {safeTransaction && (
                <TransactionTimeline
                  mt={10}
                  isExecuted={isExecuted}
                  executionTimestamp={transaction?.timestamp!}
                  submissionDate={safeTransaction?.submissionDate}
                  users={users}
                  confirmations={confirmations}
                />
              )}
            </DrawerBody>
          )}
          {safeTransaction?.safeTxHash && !isExecuted && transaction?.status !== 'pending' && (
            <DrawerFooter justifyContent="center" pb={10}>
              <VStack>
                {!isNextExecution && canExecuteOne && (
                  <Alert status="warning" mb={30}>
                    <AlertIcon />
                    Transaction with order# {currentSafeNonce} needs to be executed first
                  </Alert>
                )}
                <HStack spacing={8} divider={<StackDivider borderColor="gray.200" />}>
                  <VStack spacing={4}>
                    <Text>
                      {safeRejectionTransaction?.confirmations?.length ?? 0}/{threshold} Rejected
                    </Text>

                    {!canExecuteRejection && (
                      <Button
                        colorScheme="red"
                        mr={8}
                        onClick={reject}
                        disabled={hasRejected}
                        w={150}
                      >
                        Reject
                      </Button>
                    )}
                    {canExecuteRejection && (
                      <Button
                        colorScheme="red"
                        onClick={() => execute(true)}
                        w={160}
                        disabled={!isNextExecution}
                      >
                        Execute Rejection
                      </Button>
                    )}
                  </VStack>

                  <VStack spacing={4}>
                    <Text>
                      {safeTransaction?.confirmations?.length ?? 0}/{threshold} Approved
                    </Text>
                    {!canExecute && (
                      <Button disabled={hasApproved} onClick={approve} w={150}>
                        Approve
                      </Button>
                    )}
                    {canExecute && (
                      <Button onClick={() => execute(false)} w={150} disabled={!isNextExecution}>
                        Execute
                      </Button>
                    )}
                  </VStack>
                </HStack>
              </VStack>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
      <ReviewAndSendTransactionModal ref={reviewTxRef} />
    </>
  );
});
