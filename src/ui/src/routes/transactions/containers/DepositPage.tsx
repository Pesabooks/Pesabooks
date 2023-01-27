import { Button, Container, Heading, useToast } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormProvider, useForm } from 'react-hook-form';
import { Card, CardHeader } from '../../../components/Card';
import { InputAmountField } from '../../../components/Input/InputAmountField';
import { SelectCategoryField } from '../../../components/Input/SelectCategoryField';
import {
  ReviewAndSubmitTransaction,
  ReviewAndSubmitTransactionRef
} from '../../../components/ReviewAndSubmitTransaction';
import { usePool } from '../../../hooks/usePool';
import { useWeb3Auth } from '../../../hooks/useWeb3Auth';
import { getAddressBalance } from '../../../services/blockchainServices';
import { getAllCategories } from '../../../services/categoriesService';
import { deposit } from '../../../services/transactionsServices';
import { Category } from '../../../types';
import { TextAreaMemoField } from '../components/TextAreaMemoField';

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
  const reviewTxRef = useRef<ReviewAndSubmitTransactionRef>(null);
  const toast = useToast();
  const methods = useForm<DepositFormValue>();

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
    reviewTxRef.current?.review(
      `Deposit ${amount} ${pool.token?.symbol}`,
      'deposit',
      formValue,
      onDeposit,
    );
  };

  const onDeposit = async (confirmed: boolean, formValue: DepositFormValue) => {
    if (!provider || !confirmed) return;
    reviewTxRef.current?.openSubmitting('deposit');

    const { amount, memo, category } = formValue;

    try {
      const tx = await deposit(provider, pool, category.id, amount, memo);

      if (tx) reviewTxRef.current?.openTxSubmitted(tx.type, tx.hash, tx.id);

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
      reviewTxRef.current?.closeSubmitting();
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
      <ReviewAndSubmitTransaction ref={reviewTxRef} chainId={pool!.chain_id} />
    </>
  );
};
