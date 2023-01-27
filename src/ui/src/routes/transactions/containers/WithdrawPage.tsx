import { Button, Container, Heading, useToast } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormProvider, useForm } from 'react-hook-form';
import { Card, CardHeader } from '../../../components/Card';
import { InputAmountField } from '../../../components/Input/InputAmountField';
import { SelectCategoryField } from '../../../components/Input/SelectCategoryField';
import { SelectUserField } from '../../../components/Input/SelectUserField';
import { ReviewAndSubmitTransaction, ReviewAndSubmitTransactionRef } from '../../../components/ReviewAndSubmitTransaction';
import { usePool } from '../../../hooks/usePool';
import { useWeb3Auth } from '../../../hooks/useWeb3Auth';
import { getAddressBalance } from '../../../services/blockchainServices';
import { getAllCategories } from '../../../services/categoriesService';
import { getMembers } from '../../../services/membersService';
import { withdraw } from '../../../services/transactionsServices';
import { Category, User } from '../../../types';
import { TextAreaMemoField } from '../components/TextAreaMemoField';

export interface WithdrawFormValue {
  amount: number;
  memo?: string;
  user: User;
  category: Category;
}

export const WithdrawPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { provider } = useWeb3Auth();
  const { pool } = usePool();
  const toast = useToast();
  const [balance, setBalance] = useState<number>(0);
  const reviewTxRef = useRef<ReviewAndSubmitTransactionRef>(null);

  const signer = (provider as Web3Provider)?.getSigner();
  const methods = useForm<WithdrawFormValue>();

  const token = pool?.token;

  if (!token) {
    throw new Error('Argument Exception');
  }

  useEffect(() => {
    getMembers(pool.id).then((members) => setUsers(members?.map((m) => m.user!)));

    getAllCategories(pool.id, { activeOnly: true }).then((categories) =>
      setCategories(categories ?? []),
    );
  }, [methods, pool]);

  useEffect(() => {
    if (pool) {
      getAddressBalance(pool.chain_id, token.address, pool.gnosis_safe_address!).then(setBalance);
    }
  }, [token, pool]);

  const confirmTx = (formValue: WithdrawFormValue) => {
    const { amount, user } = formValue;
    reviewTxRef.current?.review(
      `Withdraw ${amount} ${pool.token?.symbol} to ${user.wallet}`,
      'withdrawal',
      formValue,
      onWithDraw,
    );
  };

  const onWithDraw = async (confirmed: boolean, formValue: WithdrawFormValue) => {
    if (!provider || !confirmed) return;

    reviewTxRef.current?.openSubmitting('withdrawal');

    const { amount, memo, user, category } = formValue;

    try {
      const tx = await withdraw(signer, pool, category.id, amount, memo, user);

      if (tx) reviewTxRef.current?.openTxSubmitted(tx.type, tx.hash, tx.id);

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
      reviewTxRef.current?.closeSubmitting();
    }
  };

  return (
    <>
      <Helmet>
        <title>Withdraw | {pool?.name}</title>
      </Helmet>

      <Container mt={20}>
        <Card>
          <CardHeader p="6px 0px 32px 0px">
            <Heading size="lg">Withdraw</Heading>
          </CardHeader>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(confirmTx)}>
              <SelectCategoryField mb="4" categories={categories} />

              <SelectUserField label="To User" mb="4" users={users} />

              <InputAmountField mb="4" balance={balance} symbol={token.symbol} />

              <TextAreaMemoField mb="4" />

              <Button mt={4} isLoading={methods.formState.isSubmitting} type="submit">
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
