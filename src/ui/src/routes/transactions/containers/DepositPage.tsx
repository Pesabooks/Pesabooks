import {
  Button,
  Container,
  Heading,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormProvider, useForm } from 'react-hook-form';
import { ConnectWalletButton } from '../../../components/Buttons/ConnectWalletButton';
import { Card, CardHeader } from '../../../components/Card';
import { InputAmountField } from '../../../components/Input/InputAmountField';
import { SelectCategoryField } from '../../../components/Input/SelectCategoryField';
import { TransactionSubmittedModal } from '../../../components/Modals/TransactionSubmittedModal';
import { useAuth } from '../../../hooks/useAuth';
import { useNotifyTransaction } from '../../../hooks/useNotifyTransaction';
import { usePool } from '../../../hooks/usePool';
import {
  getAddressBalance,
} from '../../../services/blockchainServices';
import { getActiveCategories } from '../../../services/categoriesService';
import { deposit } from '../../../services/transactionsServices';
import { Category } from '../../../types';
import { TextAreaMemoField } from '../components/TextAreaMemoField';

interface DepositFormValue {
  amount: number;
  memo?: string;
  category: Category;
}

export const DepositPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [lastTxHash, setLastTxHash] = useState('');
  const { provider, isActive, account } = useWeb3React();
  const { pool } = usePool();
  const [balance, setBalance] = useState<number>(0);
  const { user } = useAuth();
  const toast = useToast();
  const methods = useForm<DepositFormValue>();
  const { notify } = useNotifyTransaction();

  const signer = (provider as Web3Provider)?.getSigner();

  const {
    isOpen: isOpenTransactionConfirmation,
    onOpen: onOpenTransactionConfirmationn,
    onClose: onCloseTransactionConfirmation,
  } = useDisclosure();

  const token = pool?.token;

  if (!token || !user) {
    throw new Error('Argument Exception');
  }

  useEffect(() => {
    getActiveCategories(pool.id, 'deposit').then((categories) => setCategories(categories ?? []));
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

    const { amount, memo, category } = formValue;

    try {
      const tx = await deposit(signer, pool, category.id, amount, memo);

      notify(tx, `Deposit of ${amount} ${token.symbol}`);

      setLastTxHash(tx.hash);
      onOpenTransactionConfirmationn();

      methods.reset();
    } catch (e: any) {
      toast({
        title: e.message,
        status: 'error',
        isClosable: true,
      });
      throw e;
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

      {isOpenTransactionConfirmation && (
        <TransactionSubmittedModal
          isOpen={isOpenTransactionConfirmation}
          onClose={onCloseTransactionConfirmation}
          description="Your Deposit is submitted"
          chainId={pool.chain_id}
          hash={lastTxHash}
        />
      )}
    </>
  );
};
