import { Button, Container, Heading, useDisclosure, useToast } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormProvider, useForm } from 'react-hook-form';
import { ConnectWalletButton } from '../components/Buttons/ConnectWalletButton';
import { Card, CardHeader } from '../components/Card';
import { InputAmountField } from '../components/Input/InputAmountField';
import { SelectAccountField } from '../components/Input/SelectAccountField';
import { SelectCategoryField } from '../components/Input/SelectCategoryField';
import { SelectUserField } from '../components/Input/SelectUserField';
import { TextAreaMemoField } from '../components/Input/TextAreaMemoField';
import { TransactionSubmittedModal } from '../components/Modals/TransactionSubmittedModal';
import { usePool } from '../hooks/usePool';
import { getAccounts } from '../services/accountsService';
import { getAddressBalance } from '../services/blockchainServices';
import { getAllCategories } from '../services/categoriesService';
import { getAddressLookUp } from '../services/poolsService';
import { withdraw } from '../services/transactionsServices';
import { Account, AddressLookup, Category } from '../types';

interface WithdrawFormValue {
  amount: number;
  memo?: string;
  account: Account;
  user: AddressLookup;
  category: Category;
}

export const WithdrawPage = () => {
  const [users, setUsers] = useState<AddressLookup[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { provider, isActive } = useWeb3React();
  const { pool } = usePool();
  const toast = useToast();
  const [selectedAccountBalance, setSelectedAccountBalance] = useState<number>(0);
  const [lastTxHash, setLastTxHash] = useState('');
  const {
    isOpen: isOpenTransactionConfirmation,
    onOpen: onOpenTransactionConfirmationn,
    onClose: onCloseTransactionConfirmation,
  } = useDisclosure();

  const methods = useForm<WithdrawFormValue>();
  const selectedAccount = methods.watch('account');

  const token = pool?.token;

  if (!token) {
    throw new Error('Argument Exception');
  }

  useEffect(() => {
    getAddressLookUp(pool.id, 'user').then(setUsers);
    getAccounts(pool.id).then((accounts) => {
      if (accounts) {
        setAccounts(accounts);
        methods.setValue('account', accounts[0]);
      }
    });
    getAllCategories(pool.id).then((categories) => setCategories(categories ?? []));
  }, [methods, pool]);

  useEffect(() => {
    if (selectedAccount) {
      getAddressBalance(pool.chain_id, token.address, selectedAccount.contract_address).then(
        setSelectedAccountBalance,
      );
    }
  }, [accounts, token, selectedAccount, pool.chain_id]);

  const submit = async (formValue: WithdrawFormValue) => {
    if (!provider) return;

    const { amount, memo, account, user, category } = formValue;

    try {
      const tx = await withdraw(
        user,
        provider as Web3Provider,
        pool,
        account,
        category.id,
        amount,
        memo,
        user.address,
        (success) => {
          if (success)
            toast.update(tx.hash, {
              title: 'Transaction Completed',
              description: `Your withdrawal of ${amount} ${token.symbol} to ${user.name} is completed`,
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
          else
            toast.update(tx.hash, {
              title: 'Transaction Failed',
              description: `Your withdrawal of ${amount} ${token.symbol} to ${user.name} failed`,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
        },
      );

      toast({
        id: tx.hash,
        title: 'Withdrawal Submitted',
        description: `Your Withdrawal of ${amount} ${token.symbol} to ${user.name} is pending`,
        status: 'info',
        duration: null,
        isClosable: false,
        position: 'bottom-right',
      });

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
        <title>Withdraw | {pool?.name}</title>
      </Helmet>

      <Container mt={20}>
        <Card>
          <CardHeader p="6px 0px 32px 0px">
            <Heading size="lg">Withdraw</Heading>
          </CardHeader>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(submit)}>
              <SelectAccountField mb="4" accounts={accounts} />

              <SelectCategoryField mb="4" categories={categories} />

              <SelectUserField label="To User" mb="4" users={users} />

              <InputAmountField mb="4" balance={selectedAccountBalance} symbol={token.symbol} />

              <TextAreaMemoField mb="4" />

              {isActive ? (
                <Button mt={4} isLoading={methods.formState.isSubmitting} type="submit">
                  Withdraw
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
          description="Your Withdrawal is submitted"
          chainId={pool.chain_id}
          hash={lastTxHash}
        />
      )}
    </>
  );
};
