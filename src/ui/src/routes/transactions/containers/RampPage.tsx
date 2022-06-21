import { Button, Container, Heading } from '@chakra-ui/react';
import {
    RampInstantEvents,
    RampInstantEventTypes,
    RampInstantSDK
} from '@ramp-network/ramp-instant-sdk';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormProvider, useForm } from 'react-hook-form';
import { Card, CardHeader } from '../../../components/Card';
import { InputAmountField } from '../../../components/Input/InputAmountField';
import { SelectCategoryField } from '../../../components/Input/SelectCategoryField';
import { useAuth } from '../../../hooks/useAuth';
import { usePool } from '../../../hooks/usePool';
import { getAllCategories } from '../../../services/categoriesService';
import { depositWithCard } from '../../../services/transactionsServices';
import { Category } from '../../../types';
import { compareAddress } from '../../../utils';
import { TextAreaMemoField } from '../components/TextAreaMemoField';

interface DepositFormValue {
  amount: number;
  memo?: string;
  category: Category;
}

export const RampPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { user } = useAuth();
  const { pool } = usePool();
  const methods = useForm<DepositFormValue>();

  const token = pool?.token;

  if (!token || !user) {
    throw new Error('Argument Exception');
  }

  useEffect(() => {
    getAllCategories(pool.id, { activeOnly: true }).then((categories) =>
      setCategories(categories ?? []),
    );
  }, [pool]);

  const submit = async (formValue: DepositFormValue) => {
    const { amount, memo, category } = formValue;

    const cryptoAmount = ethers.utils.parseUnits(`${amount}`, token.decimals);

    new RampInstantSDK({
      hostAppName: 'Pesabooks',
      swapAsset: 'MATIC_USDC',
      userAddress: pool?.gnosis_safe_address,
      // userEmailAddress: user?.email,
      hostLogoUrl: 'https://pesabooks.com/assets/img/logo-dark.png',
      //url: 'https://ri-widget-staging.firebaseapp.com/',
      swapAmount: cryptoAmount.toString(),
      webhookStatusUrl: `${process.env.REACT_APP_SUPABASE_FUNCTIONS_URL}/ramp-callback`,
    })
      .on<RampInstantEvents>(RampInstantEventTypes.PURCHASE_CREATED, (event) => {
        const purchase = event.payload?.purchase;
        const purchaseViewToken = event.payload?.purchaseViewToken;
        if (!purchase || !pool) return;
        const { id, finalTxHash, receiverAddress } = purchase;

        // Make sure it is the gnosis safe address
        if (compareAddress(receiverAddress, pool?.gnosis_safe_address)) {
          depositWithCard(pool, id, purchaseViewToken, category.id, memo, amount, finalTxHash);
        }
      })
      .show();
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

              <InputAmountField mb="4" symbol={token.symbol} />

              <TextAreaMemoField mb="4" />

              <Button isLoading={methods.formState.isSubmitting} type="submit">
                Buy with Card
              </Button>
            </form>
          </FormProvider>
        </Card>
      </Container>
    </>
  );
};
