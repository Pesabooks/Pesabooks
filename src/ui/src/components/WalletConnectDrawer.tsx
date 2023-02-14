import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  HStack,
  Icon,
  Img,
  Input,
  Spacer,
  Text,
  useDisclosure,
  useToast,
  VStack
} from '@chakra-ui/react';
import { SafeTransaction } from '@safe-global/safe-core-sdk-types';

import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { BiTransfer } from 'react-icons/bi';
import { usePool } from '../hooks/usePool';
import { useWalletConnectV1 } from '../hooks/useWalletConnect';
import { useWeb3Auth } from '../hooks/useWeb3Auth';
import {
  ReviewTransactionModal,
  ReviewTransactionModalRef
} from '../routes/transactions/components/ReviewTransactionModal';
import {
  SubmittingTransactionModal,
  SubmittingTxModalRef
} from '../routes/transactions/components/SubmittingTransactionModal';
import { TextAreaMemoField } from '../routes/transactions/components/TextAreaMemoField';
import {
  TransactionSubmittedModal,
  TransactionSubmittedModalRef
} from '../routes/transactions/components/TransactionSubmittedModal';
import { getAllCategories } from '../services/categoriesService';
import { createSafeTransaction } from '../services/gnosisServices';
import { submitTransaction } from '../services/transactionsServices';
import { Category, NewTransaction } from '../types';
import { checksummed } from '../utils';
import { shortenString } from '../utils/string-utils';
import { Card, CardHeader } from './Card';
import { SelectCategoryField } from './Input/SelectCategoryField';

interface DepositFormValue {
  memo?: string;
  category: Category;
}

export const WalletConnectDrawer = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { pool } = usePool();
  const {
    connector,
    clientData,
    isConnected,
    connect,
    disconnect,
    txRequestPayload,
    onTxSumitted,
    reject,
    functionName,
  } = useWalletConnectV1(pool!);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { provider, user } = useWeb3Auth();
  const reviewTxRef = useRef<ReviewTransactionModalRef>(null);
  const submittingRef = useRef<SubmittingTxModalRef>(null);
  const toast = useToast();
  const txSubmittedRef = useRef<TransactionSubmittedModalRef>(null);

  const methods = useForm<DepositFormValue>();
  const signer = provider?.getSigner();

  useEffect(() => {
    if (pool?.id) {
      getAllCategories(pool.id, { activeOnly: true }).then((categories) =>
        setCategories(categories ?? []),
      );
    }
  }, [pool?.id]);

  const propose = async (formValue: DepositFormValue) => {
    if (!provider || !pool) return;

    const { memo, category } = formValue;

    const {
      id,
      params: [{ data, gas, gasPrice, to, value }],
    } = txRequestPayload;

    const transaction: NewTransaction = {
      type: 'walletConnect',
      pool_id: pool.id,
      timestamp: Math.floor(new Date().valueOf() / 1000),
      category_id: category.id,
      memo: memo ?? null,
      status: 'pending',
      metadata: {
        peer_data: clientData ?? undefined,
        payload: txRequestPayload,
        functionName: functionName,
      },
    };

    const safetransaction: SafeTransaction = await createSafeTransaction(
      signer!,
      pool!.chain_id,
      pool!.gnosis_safe_address!,
      {
        to: checksummed(to),
        data,
        value: parseInt(value).toString(),
        gasPrice: gasPrice ? parseInt(gasPrice) : undefined,
        baseGas: gas ? parseInt(gas) : undefined,
      },
    );

    try {
      const tx = await submitTransaction(user!, signer!, pool, transaction, safetransaction);
      connector?.approveRequest({
        id,
        result: tx?.safe_tx_hash,
      });

      if (tx) txSubmittedRef.current?.open(tx.type, tx.hash, tx.id);

      methods.reset();
      onTxSumitted();
    } catch (e: any) {
      const message = typeof e === 'string' ? e : e?.data?.message ?? e.message;
      toast({
        title: message,
        status: 'error',
        isClosable: true,
      });
      throw e;
    } finally {
      submittingRef.current?.close();
    }
  };

  return (
    <>
      <Button
        pl={0}
        variant="outline"
        onClick={onOpen}
        w={160}
        _after={
          isConnected
            ? {
                content: '""',
                w: 4,
                h: 4,
                bg: 'green.300',
                border: '2px solid white',
                rounded: 'full',
                pos: 'absolute',
                bottom: 3,
                right: 2,
              }
            : {}
        }
      >
        Wallet connect
      </Button>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Wallet Connect </DrawerHeader>

          <DrawerBody>
            {!isConnected && (
              <Input
                placeholder="Paste QR Code here"
                onChange={(e) => connect({ uri: e.target.value })}
              />
            )}

            {!!clientData && (
              <HStack mt={5}>
                <Img src={clientData.icons[0]} />
                <VStack
                  display={{ base: 'none', md: 'flex' }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  <Text fontSize="sm">{clientData.name}</Text>
                  <Text fontSize="xs" color="gray.600">
                    {shortenString(clientData.description, 100)}
                  </Text>
                </VStack>
                <Spacer />
                <Button size="sm" onClick={disconnect}>
                  Disconnect
                </Button>
              </HStack>
            )}

            {isConnected && !txRequestPayload && (
              <Box textAlign="center" mt={20}>
                <Icon boxSize={'50px'} as={BiTransfer} />

                <Text color={'gray.500'} mb={6}>
                  Transaction will appear here
                </Text>
              </Box>
            )}

            {txRequestPayload && (
              <Card p={0} mt={20}>
                <CardHeader p="6px 0px 32px 0px">
                  <Heading size="md">{functionName}</Heading>
                </CardHeader>
                <FormProvider {...methods}>
                  <form onSubmit={methods.handleSubmit(propose)}>
                    <SelectCategoryField mb="4" categories={categories} />

                    <TextAreaMemoField mb="4" />

                    <Flex>
                      <Button variant="outline" onClick={() => reject('')}>
                        Cancel
                      </Button>
                      <Spacer />
                      <Button isLoading={methods.formState.isSubmitting} type="submit">
                        Create proposal
                      </Button>
                    </Flex>
                  </form>
                </FormProvider>
              </Card>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <TransactionSubmittedModal ref={txSubmittedRef} chainId={pool?.chain_id} />
      <SubmittingTransactionModal ref={submittingRef} />
      <ReviewTransactionModal ref={reviewTxRef} />
    </>
  );
};
