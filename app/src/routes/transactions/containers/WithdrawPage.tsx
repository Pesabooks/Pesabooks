import { Button, Card, CardBody, CardHeader, Container, Heading } from '@chakra-ui/react';
import { InputAmountField } from '@pesabooks/components/Input/InputAmountField';
import { SelectCategoryField } from '@pesabooks/components/Input/SelectCategoryField';
import { SelectUserField } from '@pesabooks/components/Input/SelectUserField';
import { formatLongNumber } from '@pesabooks/utils/bignumber-utils';
import { BigNumber } from 'ethers';
import { useRef } from 'react';
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
import { useQuery } from '@tanstack/react-query';
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
  const { pool } = usePool();
  const reviewTxRef = useRef<ReviewAndSendTransactionModalRef>(null);
  const { threshold } = useSafeAdmins();
  const methods = useForm<WithdrawFormValue>();

  const token = pool?.token;
  const signer = (provider as Web3Provider)?.getSigner();

  if (!token) {
    throw new Error('token is not set');
  }
  if (!provider) throw new Error('Provider is not set');

  const { data: users } = useQuery({
    queryKey: [pool.id, 'members'],
    queryFn: () => getMembers(pool.id).then((members) => members.map((m) => m.user!)),
    enabled: !!pool.id,
  });

  const { data: categories } = useQuery({
    queryKey: [pool.id, 'categories', { active: true }],
    queryFn: () =>
      getAllCategories(pool.id, { activeOnly: true }).then((categories) =>
        categories.filter((c) => c.active),
      ),
    enabled: !!pool.id,
  });

  const { data: balance } = useQuery({
    queryKey: ['token_balance', pool.chain_id, token.symbol, pool.gnosis_safe_address],
    queryFn: () => getAddressBalance(pool.chain_id, token.address, pool.gnosis_safe_address!),
  });

  const onWithDraw = async (formValue: WithdrawFormValue) => {
    const { amount, memo, user, category } = formValue;

    const transaction = await buildWithdrawTx(pool, category.id, amount, memo, user);

    reviewTxRef.current?.open(
      `Withdraw ${formatLongNumber(amount)} ${pool.token?.symbol} to ${user.username}`,
      transaction.type,
      () =>
        threshold > 1
          ? Promise.resolve(BigNumber.from(0))
          : estimateTransaction(provider, transaction.transaction_data),
      async () => {
        const tx = await submitTransaction(signer, pool, transaction);
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
                <SelectCategoryField mb="4" categories={categories ?? []} />

                <SelectUserField label="To User" mb="4" users={users ?? []} />

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
