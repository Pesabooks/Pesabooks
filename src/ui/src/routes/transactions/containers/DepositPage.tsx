import { Button, Container, Heading, useDisclosure, useToast } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormProvider, useForm } from 'react-hook-form';
import { Card, CardHeader } from '../../../components/Card';
import { InputAmountField } from '../../../components/Input/InputAmountField';
import { SelectCategoryField } from '../../../components/Input/SelectCategoryField';
import { usePool } from '../../../hooks/usePool';
import { useWeb3Auth } from '../../../hooks/useWeb3Auth';
import { getAddressBalance } from '../../../services/blockchainServices';
import { getAllCategories } from '../../../services/categoriesService';
import { deposit } from '../../../services/transactionsServices';
import { Category } from '../../../types';
import {
  ConfirmTransactionRef, ReviewTransactionModal
} from '../components/ReviewTransactionModal';
import { SubmittingTransactionModal } from '../components/SubmittingTransactionModal';
import { TextAreaMemoField } from '../components/TextAreaMemoField';
import {
  TransactionSubmittedModal,
  TransactionSubmittedModalRef
} from '../components/TransactionSubmittedModal';

export interface DepositFormValue {
  amount: number;
  memo?: string;
  category: Category;
}

export const DepositPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { provider, account } = useWeb3Auth();
  const { pool } = usePool();
  const [balance, setBalance] = useState<number>(0);
  const confirmTxRef = useRef<ConfirmTransactionRef>(null);
  const toast = useToast();
  const methods = useForm<DepositFormValue>();
  const txSubmittedRef = useRef<TransactionSubmittedModalRef>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const token = pool?.token;

  if (!token) {
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
  }, [pool, account]);

  const confirmTx = (formValue: DepositFormValue) => {
    const { amount } = formValue;
    confirmTxRef.current?.open(`Deposit ${amount} ${pool.token?.symbol}`, 'deposit', formValue, onDeposit);
  };

  const onDeposit = async (confirmed: boolean, formValue: DepositFormValue) => {
    if (!provider || !confirmed) return;
    onOpen();

    const { amount, memo, category } = formValue;

    try {
      const tx = await deposit(provider, pool, category.id, amount, memo);
      txSubmittedRef.current?.open(tx);
      methods.reset();
    } catch (e: any) {
      const message = typeof e === 'string' ? e : e?.data?.message ?? e.message;
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
            <form onSubmit={methods.handleSubmit(confirmTx)}>
              <SelectCategoryField mb="4" categories={categories} />

              <InputAmountField mb="4" balance={balance} symbol={token.symbol} />

              <TextAreaMemoField mb="4" />

              <Button isLoading={methods.formState.isSubmitting} type="submit">
                Review
              </Button>
            </form>
          </FormProvider>
        </Card>
      </Container>
      <TransactionSubmittedModal ref={txSubmittedRef} chainId={pool?.chain_id} />
      <SubmittingTransactionModal type="deposit" isOpen={isOpen} onClose={onClose} />
      <ReviewTransactionModal ref={confirmTxRef}  />
    </>
  );
};
