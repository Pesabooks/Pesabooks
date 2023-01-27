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
import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types';
import { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { formatBigNumber } from '../../../bignumber-utils';
import { EditableControls } from '../../../components/Editable/EditableControls';
import { TriggerEditableControls } from '../../../components/Editable/TriggerEditableControls';
import Loading from '../../../components/Loading';
import { UserWalletCard } from '../../../components/UserWalletCard';
import { WalletAddress } from '../../../components/WalletAddress';
import { ButtonWithAdmingRights } from '../../../components/withConnectedWallet';
import { usePool } from '../../../hooks/usePool';
import { useSafeAdmins } from '../../../hooks/useSafeAdmins';
import { useWeb3Auth } from '../../../hooks/useWeb3Auth';
import { getAllCategories } from '../../../services/categoriesService';
import {
  estimateSafeTransactionByHash,
  getSafeNonce,
  getSafeTransaction,
  getSafeTreshold
} from '../../../services/gnosisServices';
import { getMembers } from '../../../services/membersService';
import {
  confirmTransaction,
  executeTransaction,
  getTransactionById,
  rejectTransaction,
  updateTransactionCategory,
  updateTransactionMemo
} from '../../../services/transactionsServices';
import { Category, Transaction, User } from '../../../types';
import {
  AddOrRemoveOwnerData,
  ChangeThresholdData,
  SwapData,
  TransferData,
  WalletConnectData
} from '../../../types/transaction';
import {
  compareAddress,
  getTransactionDescription,
  getTransactionTypeLabel,
  mathAddress
} from '../../../utils';
import { EditableSelect } from './EditableSelect';
import { ReviewTransactionModal, ReviewTransactionModalRef } from './ReviewTransactionModal';
import { SubmittingTransactionModal, SubmittingTxModalRef } from './SubmittingTransactionModal';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import { TransactionTimeline } from './TransactionTimeline';
import { TxPropertyBox } from './TxPropertyBox';

export interface TransactionDetailRef {
  open: (id: number) => void;
}

export const TransactionDetail = forwardRef((_props: any, ref: Ref<TransactionDetailRef>) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { pool } = usePool();
  const { safeAdmins } = useSafeAdmins();
  const { provider, account } = useWeb3Auth();
  const [loading, setLoading] = useState(true);
  const submittingRef = useRef<SubmittingTxModalRef>(null);
  const reviewTxRef = useRef<ReviewTransactionModalRef>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [treshold, setTreshold] = useState(0);
  const [currentSafeNonce, setCurrentSafeNonce] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<{
    transaction: Transaction | undefined;
    safeTransaction: SafeMultisigTransactionResponse | undefined;
    safeRejectionTransaction: SafeMultisigTransactionResponse | undefined;
  }>({ transaction: undefined, safeTransaction: undefined, safeRejectionTransaction: undefined });
  const [categories, setCategories] = useState<Category[]>([]);
  const toast = useToast();
  const signer = (provider as Web3Provider)?.getSigner();

  const { transaction, safeTransaction, safeRejectionTransaction } = transactions;

  const loadTransaction = async (id: number) => {
    let transaction: Transaction | undefined;
    let safeTransaction: SafeMultisigTransactionResponse | undefined = undefined;
    let safeRejectionTransaction: SafeMultisigTransactionResponse | undefined = undefined;

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
        getMembers(pool.id,true).then((members) => setUsers(members?.map((m) => m.user!)));
        getSafeTreshold(pool.chain_id, pool.gnosis_safe_address!).then(setTreshold);
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

  const isAdmin: boolean = !!safeAdmins?.find((a) => compareAddress(a, account));

  const hasApproved: boolean = !!safeTransaction?.confirmations?.find((c) =>
    compareAddress(c.owner, account),
  );

  const hasRejected: boolean = !!safeRejectionTransaction?.confirmations?.find((c) =>
    compareAddress(c.owner, account),
  );

  const canExecute = safeTransaction?.confirmations?.length === treshold;

  const canExecuteRejection = safeRejectionTransaction?.confirmations?.length === treshold;

  const isNextExecution = currentSafeNonce === transaction?.safe_nonce;

  const approve = async () => {
    if (!pool || !transaction) return;
    try {
      setIsSubmitting(true);

      await confirmTransaction(signer, pool, transaction.id, transaction?.safe_tx_hash);
      loadTransaction(transaction.id);
      toast({ title: 'You approved the transaction', status: 'success' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmTx = (isRejection: boolean) => {
    const message = isRejection ? '' : getTransactionDescription(transaction!, users);
    const safeTxHash = isRejection ? transaction?.reject_safe_tx_hash : transaction?.safe_tx_hash;
    const type = isRejection ? 'rejection' : transaction!.type;

    reviewTxRef.current?.open(message, type, isRejection, execute, safeTxHash);
  };

  const execute = async (confirmed: boolean, isRejection: boolean) => {
    if (!pool || !transaction || !confirmed) return;

    const safeTxHash = isRejection ? transaction?.reject_safe_tx_hash : transaction.safe_tx_hash;

    try {
      setIsSubmitting(true);
      submittingRef.current?.open(transaction.type);
      try {
        await estimateSafeTransactionByHash(pool.chain_id, pool.gnosis_safe_address!, safeTxHash);
      } catch (_) {
        toast({
          title:
            'This transaction will most likely fail. To save gas costs, reject this transaction.',
          status: 'error',
          isClosable: true,
        });
      }

      await executeTransaction(signer, pool, transaction, safeTxHash, isRejection);
      loadTransaction(transaction.id);
    } catch (e: any) {
      toast({
        title: e?.message,
        status: 'error',
        isClosable: true,
      });
    } finally {
      submittingRef.current?.close();
      setIsSubmitting(false);
    }
  };

  const reject = async () => {
    if (!pool || !safeTransaction || !transaction) return;
    try {
      setIsSubmitting(true);
      if (transaction.reject_safe_tx_hash) {
        await confirmTransaction(signer, pool, transaction.id, transaction.reject_safe_tx_hash);
      } else {
        await rejectTransaction(signer, pool, transaction.id, safeTransaction?.nonce);
      }
      loadTransaction(transaction.id);
      toast({ title: 'You rejected the transaction', status: 'success' });
    } finally {
      submittingRef.current?.close();
      setIsSubmitting(false);
    }
  };

  const closeDrawer = () => {
    onClose();
    setTransactions({
      transaction: undefined,
      safeTransaction: undefined,
      safeRejectionTransaction: undefined,
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
                    defaultValue={transaction?.category_id}
                    options={categories.map((c) => ({ value: c.id, name: c.name }))}
                  />
                </TxPropertyBox>

                <TxPropertyBox label="Memo">
                  <Editable
                    defaultValue={transaction?.memo}
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
                  executionTimestamp={transaction?.timestamp}
                  submissionDate={safeTransaction?.submissionDate}
                  users={users}
                  confirmations={confirmations}
                />
              )}
            </DrawerBody>
          )}
          {safeTransaction?.safeTxHash && !isExecuted && transaction?.status !== 'pending' && (
            <DrawerFooter justifyContent="center" pb={10}>
              {isSubmitting ? (
                <Loading />
              ) : (
                <VStack>
                  {!isNextExecution && (
                    <Alert status="warning" mb={30}>
                      <AlertIcon />
                      Transaction with order# {currentSafeNonce} needs to be executed first
                    </Alert>
                  )}
                  <HStack spacing={8} divider={<StackDivider borderColor="gray.200" />}>
                    <VStack spacing={4}>
                      <Text>
                        {safeRejectionTransaction?.confirmations?.length ?? 0}/{treshold} Rejected
                      </Text>

                      {!canExecuteRejection && (
                        <ButtonWithAdmingRights
                          colorScheme="red"
                          mr={8}
                          onClick={reject}
                          disabled={!isAdmin || hasRejected}
                          w={150}
                        >
                          Reject
                        </ButtonWithAdmingRights>
                      )}
                      {canExecuteRejection && (
                        <Button
                          colorScheme="red"
                          onClick={() => confirmTx(true)}
                          w={160}
                          disabled={!isNextExecution}
                        >
                          Execute Rejection
                        </Button>
                      )}
                    </VStack>

                    <VStack spacing={4}>
                      <Text>
                        {safeTransaction?.confirmations?.length ?? 0}/{treshold} Approved
                      </Text>
                      {!canExecute && (
                        <ButtonWithAdmingRights
                          disabled={!isAdmin || hasApproved}
                          onClick={approve}
                          w={150}
                        >
                          Approve
                        </ButtonWithAdmingRights>
                      )}
                      {canExecute && (
                        <Button
                          onClick={() => confirmTx(false)}
                          w={150}
                          disabled={!isNextExecution}
                        >
                          Execute
                        </Button>
                      )}
                    </VStack>
                  </HStack>
                </VStack>
              )}
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
      <SubmittingTransactionModal ref={submittingRef} />
      <ReviewTransactionModal ref={reviewTxRef} />
    </>
  );
});
