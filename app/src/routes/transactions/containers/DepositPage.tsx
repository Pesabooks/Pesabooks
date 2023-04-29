import { Button, Card, CardBody, CardHeader, Container, Heading } from '@chakra-ui/react';
import { InputAmountField } from '@pesabooks/components/Input/InputAmountField';
import { SelectCategoryField } from '@pesabooks/components/Input/SelectCategoryField';
import { usePool, useWeb3Auth } from '@pesabooks/hooks';
import { getAddressBalance } from '@pesabooks/services/blockchainServices';
import { getAllCategories } from '@pesabooks/services/categoriesService';
import { estimateTransaction } from '@pesabooks/services/estimationService';
import { buildDepositTx } from '@pesabooks/services/transaction-builder';
import { submitDepositTx } from '@pesabooks/services/transactionsServices';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormProvider, useForm } from 'react-hook-form';
import { Category, NewTransaction } from '../../../types';

import {
  ReviewAndSendTransactionModal,
  ReviewAndSendTransactionModalRef,
} from '@pesabooks/components/ReviewAndSendTransactionModal';
import { TextAreaMemoField } from '../components/TextAreaMemoField';

export interface DepositFormValue {
  amount: number;
  memo: string | null;
  category: Category;
}

export const DepositPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { provider, account, user } = useWeb3Auth();
  const { pool } = usePool();
  const [balance, setBalance] = useState<number>(0);
  const reviewTxRef = useRef<ReviewAndSendTransactionModalRef>(null);

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

  const deposit = async (transaction: NewTransaction) => {
    const tx = await submitDepositTx(provider!, pool, user!, transaction);

    methods.reset();

    return {
      hash: tx?.hash,
      internalTxId: tx?.id,
    };
  };

  const review = async (formValue: DepositFormValue) => {
    const { amount, memo, category } = formValue;

    const transaction = await buildDepositTx(provider!, pool, user!, category.id, amount, memo);
    reviewTxRef.current?.open(
      `Deposit ${amount} ${pool.token?.symbol}`,
      transaction.type,
      () => estimateTransaction(provider!, transaction.transaction_data),
      () => deposit(transaction),
    );
  };

  return (
    <>
      <Helmet>
        <title>Deposit | {pool?.name}</title>
      </Helmet>
      <Container mt={20}>
        <Card>
          <CardHeader>
            <Heading size="lg">Deposit</Heading>
          </CardHeader>
          <CardBody>
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(review)}>
                <SelectCategoryField mb="4" categories={categories} />

                <InputAmountField mb="4" balance={balance} symbol={token.symbol} />

                <TextAreaMemoField mb="4" />

                <Button isLoading={methods.formState.isSubmitting} type="submit">
                  Review
                </Button>
              </form>
            </FormProvider>
          </CardBody>
        </Card>
      </Container>

      <ReviewAndSendTransactionModal ref={reviewTxRef} />
    </>
  );
};
