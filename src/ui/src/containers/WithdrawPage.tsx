import { Box, Button, Heading, useToast } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormProvider, useForm } from 'react-hook-form';
import { ConnectWalletButton } from '../components/Buttons/ConnectWalletButton';
import { InputAmountField } from '../components/Input/InputAmountField';
import { SelectAccountField } from '../components/Input/SelectAccountField';
import { SelectCategoryField } from '../components/Input/SelectCategoryField';
import { SelectUserField } from '../components/Input/SelectUserField';
import { TextAreaMemoField } from '../components/Input/TextAreaMemoField';
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
  const { library, active } = useWeb3React<Web3Provider>();
  const { pool } = usePool();
  const toast = useToast();
  const [selectedAccountBalance, setSelectedAccountBalance] = useState<number>(0);

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
    if (!library) return;

    const { amount, memo, account, user, category } = formValue;

    try {
      await withdraw(
        user.id,
        library,
        pool,
        account,
        category.id,
        amount,
        memo,
        user.address,
        () => {
          toast({
            title: 'Your transaction is confirmed',
            status: 'success',
            isClosable: true,
          });
        },
      );
      toast({
        title: 'Your transaction is pending',
        status: 'warning',
        isClosable: true,
      });

      methods.reset();
    } catch (e) {
      const message = e instanceof Error ? e.message : null;
      toast({
        title: message,
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
      <Heading as="h2" mb={20} size="lg">
        Withdraw
      </Heading>
      <Box display="flex">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(submit)}>
            <SelectAccountField mb="4" accounts={accounts} />

            <SelectCategoryField mb="4" categories={categories} />

            <SelectUserField mb="4" users={users} />

            <InputAmountField mb="4" balance={selectedAccountBalance} symbol={token.symbol} />

            <TextAreaMemoField mb="4" />

            {active ? (
              <Button mt={4} isLoading={methods.formState.isSubmitting} type="submit">
                Withdraw
              </Button>
            ) : (
              <ConnectWalletButton mt={4} chainId={pool.chain_id} />
            )}
          </form>
        </FormProvider>
      </Box>
    </>
  );
};
