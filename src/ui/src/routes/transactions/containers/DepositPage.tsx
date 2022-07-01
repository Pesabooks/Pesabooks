import { Button, Container, Heading, useDisclosure, useToast } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormProvider, useForm } from 'react-hook-form';
import { ConnectWalletButton } from '../../../components/Buttons/ConnectWalletButton';
import { Card, CardHeader } from '../../../components/Card';
import { InputAmountField } from '../../../components/Input/InputAmountField';
import { SelectCategoryField } from '../../../components/Input/SelectCategoryField';
import { useAuth } from '../../../hooks/useAuth';
import { usePool } from '../../../hooks/usePool';
import { getAddressBalance } from '../../../services/blockchainServices';
import { getAllCategories } from '../../../services/categoriesService';
import { deposit } from '../../../services/transactionsServices';
import { Category } from '../../../types';
import { SubmittingTransactionModal } from '../components/SubmittingTransactionModal';
import { TextAreaMemoField } from '../components/TextAreaMemoField';
import {
  TransactionSubmittedModal,
  TransactionSubmittedModalRef
} from '../components/TransactionSubmittedModal';

interface DepositFormValue {
  amount: number;
  memo?: string;
  category: Category;
}

export const DepositPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { provider, isActive, account } = useWeb3React();
  const { pool } = usePool();
  const [balance, setBalance] = useState<number>(0);
  const { user } = useAuth();
  const toast = useToast();
  const methods = useForm<DepositFormValue>();
  const confirmationRef = useRef<TransactionSubmittedModalRef>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const signer = (provider as Web3Provider)?.getSigner();

  const token = pool?.token;

  if (!token || !user) {
    throw new Error('Argument Exception');
  }

  useEffect(() => {
    getAllCategories(pool.id, { activeOnly: true }).then((categories) =>
      setCategories(categories ?? []),
    );
  }, [pool]);

  useEffect(() => {
    const getBalance = async () => {
      if (account) {
        if (pool?.token) {
          const balance = await getAddressBalance(pool.chain_id, pool.token.address, account);
          setBalance(balance);
        }
      }
    };

    getBalance();
  }, [provider, pool, account]);

  const submit = async (formValue: DepositFormValue) => {
    if (!provider) return;
    onOpen();

    const { amount, memo, category } = formValue;

    try {
      const tx = await deposit(signer, pool, category.id, amount, memo);
      confirmationRef.current?.open(tx);
      methods.reset();
    } catch (e: any) {
      const message = typeof e === 'string' ? e : e.message;
      toast({
        title: message,
        status: 'error',
        isClosable: true,
      });
      throw e;
    } finally {
      onClose();
    }
  };

  return (
    <>
      <Helmet>
        <title>Deposit | {pool?.name}</title>
      </Helmet>
      <Container mt={20}>
        <Card>
          <CardHeader p="6px 0px 32px 0px">
            <Heading size="lg">Deposit</Heading>
          </CardHeader>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(submit)}>
              <SelectCategoryField mb="4" categories={categories} />

              <InputAmountField mb="4" balance={balance} symbol={token.symbol} />

              <TextAreaMemoField mb="4" />

              {isActive ? (
                <Button isLoading={methods.formState.isSubmitting} type="submit">
                  Deposit
                </Button>
              ) : (
                <ConnectWalletButton mt={4} chainId={pool.chain_id} />
              )}
            </form>
          </FormProvider>
        </Card>
      </Container>
      <TransactionSubmittedModal ref={confirmationRef} chainId={pool?.chain_id} />
      <SubmittingTransactionModal type="deposit" isOpen={isOpen} onClose={onClose} />
    </>
  );
};
