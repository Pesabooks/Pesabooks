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
  Spacer,
  StackDivider,
  Text,
  useDisclosure,
  useToast,
  VStack
} from '@chakra-ui/react';
import type { Web3Provider } from '@ethersproject/providers';
import { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client';
import { ethers } from 'ethers';
import { forwardRef, Ref, useEffect, useImperativeHandle, useState } from 'react';
import { EditableControls } from '../../../components/Editable/EditableControls';
import { TriggerEditableControls } from '../../../components/Editable/TriggerEditableControls';
import Loading from '../../../components/Loading';
import { UserWalletCard } from '../../../components/UserWalletCard';
import { WalletAddress } from '../../../components/WalletAddress';
import { ButtonWithAdmingRights } from '../../../components/withConnectedWallet';
import { usePool } from '../../../hooks/usePool';
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
import { SwapData, TransferData } from '../../../types/transaction';
import { compareAddress, getTransactionTypeLabel, mathAddress } from '../../../utils';
import { EditableSelect } from './EditableSelect';
import { SubmittingTransactionModal } from './SubmittingTransactionModal';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import { TransactionTimeline } from './TransactionTimeline';
import { TxPropertyBox } from './TxPropertyBox';

export interface TransactionDetailRef {
  open: (id: number) => void;
}

export const TransactionDetail = forwardRef((_props: any, ref: Ref<TransactionDetailRef>) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { pool, safeAdmins } = usePool();
  const { provider, account } = useWeb3Auth();
  const [loading, setLoading] = useState(true);
  const {
    isOpen: isSubmitting,
    onOpen: openSubmitting,
    onClose: closeSubmitting,
  } = useDisclosure();
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

  const confirmations = [
    ...(safeTransaction?.confirmations?.map((c) => ({ ...c, rejected: false })) ?? []),
    ...(safeRejectionTransaction?.confirmations?.map((c) => ({
      ...c,
      rejected: true,
    })) ?? []),
  ];

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
        getMembers(pool.id).then(members=>setUsers(members?.map(m=>m.user!)));
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
      openSubmitting();
      await confirmTransaction(signer, pool, transaction.id, transaction?.safe_tx_hash);
      loadTransaction(transaction.id);
    } finally {
      closeSubmitting();
    }
  };

  const execute = async (isRejection: boolean) => {
    if (!pool || !transaction) return;
    const safeTxHash = isRejection ? transaction?.reject_safe_tx_hash : transaction.safe_tx_hash;

    try {
      openSubmitting();
      await estimateSafeTransactionByHash(pool.chain_id, pool.gnosis_safe_address!, safeTxHash);

      await executeTransaction(signer, pool, transaction.id, safeTxHash, isRejection);
      loadTransaction(transaction.id);
    } catch (e: any) {
      toast({
        title:
          'This transaction will most likely fail. To save gas costs, reject this transaction.',
        status: 'error',
        isClosable: true,
      });
    } finally {
      closeSubmitting();
    }
  };

  const reject = async () => {
    if (!pool || !safeTransaction || !transaction) return;
    try {
      openSubmitting();

      if (transaction.reject_safe_tx_hash) {
        await confirmTransaction(signer, pool, transaction.id, transaction.reject_safe_tx_hash);
      } else {
        await rejectTransaction(signer, pool, transaction.id, safeTransaction?.nonce);
      }
      loadTransaction(transaction.id);
    } finally {
      closeSubmitting();
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

  const format = (amount: string, decimals: number) => ethers.utils.formatUnits(amount, decimals);

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

                      {(transaction?.metadata as TransferData)?.ramp_id &&
                        transaction.user?.name}
                    </TxPropertyBox>
                  )}

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
                    <TxPropertyBox label="Paid" flex="1">
                      <Flex align="center">
                        <Image
                          w="20px"
                          h="20px"
                          src={(transaction?.metadata as SwapData)?.src_token?.img}
                          alt=""
                        />
                        <Text ml="1">
                          {format(
                            (transaction?.metadata as SwapData)?.src_amount,
                            (transaction?.metadata as SwapData)?.src_token?.decimals,
                          )}{' '}
                          {(transaction?.metadata as SwapData)?.src_token?.symbol}
                        </Text>
                      </Flex>
                    </TxPropertyBox>
                  )}

                  {transaction?.type === 'swap' && (
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
                          {format(
                            (transaction?.metadata as SwapData)?.dest_amount,
                            (transaction?.metadata as SwapData)?.dest_token?.decimals,
                          )}{' '}
                          {(transaction?.metadata as SwapData)?.dest_token?.symbol}
                        </Text>
                      </Flex>
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
                          onClick={() => execute(false)}
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
      <SubmittingTransactionModal type="deposit" isOpen={isSubmitting} onClose={closeSubmitting} />
    </>
  );
});
