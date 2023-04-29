import { Button, Card, CardBody, CardHeader, Container, Heading } from '@chakra-ui/react';
import { InputAmountField } from '@pesabooks/components/Input/InputAmountField';
import { SelectCategoryField } from '@pesabooks/components/Input/SelectCategoryField';
import { SelectUserField } from '@pesabooks/components/Input/SelectUserField';
import { formatLongNumber } from '@pesabooks/utils/bignumber-utils';
import { BigNumber } from 'ethers';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormProvider, useForm } from 'react-hook-form';

import { Web3Provider } from '@ethersproject/providers';
import {
  ReviewAndSendTransactionModal,
  ReviewAndSendTransactionModalRef,
} from '@pesabooks/components/ReviewAndSendTransactionModal';
import { usePool, useSafeAdmins, useWeb3Auth } from '@pesabooks/hooks';
import { getAddressBalance } from '@pesabooks/services/blockchainServices';
import { getAllCategories } from '@pesabooks/services/categoriesService';
import { estimateTransaction } from '@pesabooks/services/estimationService';
import { getMembers } from '@pesabooks/services/membersService';
import { buildWithdrawTx } from '@pesabooks/services/transaction-builder';
import { submitTransaction } from '@pesabooks/services/transactionsServices';
import { Category, User } from '../../../types';
import { TextAreaMemoField } from '../components/TextAreaMemoField';
export interface WithdrawFormValue {
  amount: number;
  memo: string | null;
  user: User;
  category: Category;
}

export const WithdrawPage = () => {
  const { provider } = useWeb3Auth();
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { pool } = usePool();
  const [balance, setBalance] = useState<number>(0);
  const reviewTxRef = useRef<ReviewAndSendTransactionModalRef>(null);
  const { threshold } = useSafeAdmins();
  const methods = useForm<WithdrawFormValue>();

  const token = pool?.token;
  const signer = (provider as Web3Provider)?.getSigner();

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

  const onWithDraw = async (formValue: WithdrawFormValue) => {
    const { amount, memo, user, category } = formValue;

    const transaction = await buildWithdrawTx(pool, category.id, amount, memo, user);

    reviewTxRef.current?.open(
      `Withdraw ${formatLongNumber(amount)} ${pool.token?.symbol} to ${user.username}`,
      transaction.type,
      () =>
        threshold > 1
          ? Promise.resolve(BigNumber.from(0))
          : estimateTransaction(provider!, transaction.transaction_data),
      async () => {
        const tx = await submitTransaction(user!, signer, pool!, transaction!);
        methods.reset();
        return { hash: tx?.hash, internalTxId: tx?.id };
      },
    );
  };

  return (
    <>
      <Helmet>
        <title>Withdraw | {pool?.name}</title>
      </Helmet>

      <Container mt={20}>
        <Card>
          <CardHeader>
            <Heading size="lg">Withdraw</Heading>
          </CardHeader>
          <CardBody>
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onWithDraw)}>
                <SelectCategoryField mb="4" categories={categories} />

                <SelectUserField label="To User" mb="4" users={users} />

                <InputAmountField mb="4" balance={balance} symbol={token.symbol} />

                <TextAreaMemoField mb="4" />

                <Button mt={4} isLoading={methods.formState.isSubmitting} type="submit">
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
