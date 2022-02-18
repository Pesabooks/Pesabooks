import { Box, Button, Heading, useDisclosure, useToast } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormProvider, useForm } from 'react-hook-form';
import { ConnectWalletButton } from '../components/Buttons/ConnectWalletButton';
import { InputAmountField } from '../components/Input/InputAmountField';
import { SelectAccountField } from '../components/Input/SelectAccountField';
import { SelectCategoryField } from '../components/Input/SelectCategoryField';
import { TextAreaMemoField } from '../components/Input/TextAreaMemoField';
import { ApproveTokenModal } from '../components/Modals/ApproveTokenModal';
import { useAuth } from '../hooks/useAuth';
import { usePool } from '../hooks/usePool';
import { getAccounts } from '../services/accountsService';
import { approveToken, getAddressBalance, isTokenApproved } from '../services/blockchainServices';
import { getAllCategories } from '../services/categoriesService';
import { deposit } from '../services/transactionsServices';
import { Account, Category } from '../types';

interface DepositFormValue {
  amount: number;
  memo?: string;
  account: Account;
  category: Category;
}

export const DepositPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { library, active, account } = useWeb3React<Web3Provider>();
  const { pool } = usePool();
  const [balance, setBalance] = useState<number>(0);
  const { user } = useAuth();
  const toast = useToast();
  const methods = useForm<DepositFormValue>();
  const selectedAccount = methods.watch('account');

  const {
    isOpen: isOpenApproveToken,
    onOpen: onOpenApproveToken,
    onClose: onCloseApproveToken,
  } = useDisclosure();
  const [isApproving, setIsApproving] = useState(false);

  const token = pool?.token;

  if (!token || !user) {
    throw new Error('Argument Exception');
  }

  useEffect(() => {
    getAccounts(pool.id).then((accounts) => {
      if (accounts) {
        setAccounts(accounts);
        methods.setValue('account', accounts?.[0]);
      }
    });
    getAllCategories(pool.id).then((categories) => setCategories(categories ?? []));
  }, [methods, pool]);

  useEffect(() => {
    const getBalance = async () => {
      if (library) {
        const address = await library.getSigner().getAddress();
        if (pool?.token) {
          const balance = await getAddressBalance(pool.chain_id, pool.token.address, address);
          setBalance(balance);
        }
      }
    };

    getBalance();
  }, [library, pool, account]);

  const approve = async () => {
    if (!library) return;
    try {
      setIsApproving(true);
      await approveToken(library, token.address, selectedAccount);
      onCloseApproveToken();
    } finally {
      setIsApproving(false);
    }
  };

  const submit = async (formValue: DepositFormValue) => {
    if (!library) return;

    const { amount, memo, account, category } = formValue;

    try {
      const tokenApproved = await isTokenApproved(library, token.address, account, amount);
      if (!tokenApproved) {
        onOpenApproveToken();
      } else {
        await deposit(user.id, library, pool, account, category.id, amount, memo, () => {
          toast({
            title: 'Your transaction is completed',
            status: 'success',
            isClosable: true,
          });
        });

        toast({
          title: 'Your transaction is pending',
          status: 'warning',
          isClosable: true,
        });

        methods.reset();
      }
    } catch (e: unknown) {
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
        <title>Deposit | {pool?.name}</title>
      </Helmet>
      <Heading as="h2" mb={20} size="lg">
        Deposit
      </Heading>
      <Box display="flex">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(submit)}>
            <SelectAccountField mb="4" accounts={accounts} />

            <SelectCategoryField mb="4" categories={categories} />

            <InputAmountField mb="4" balance={balance} symbol={token.symbol} />

            <TextAreaMemoField mb="4" />

            {active ? (
              <Button mt={4} isLoading={methods.formState.isSubmitting} type="submit">
                Deposit
              </Button>
            ) : (
              <ConnectWalletButton mt={4} chainId={pool.chain_id} />
            )}
          </form>
        </FormProvider>
      </Box>
      <ApproveTokenModal
        isOpen={isOpenApproveToken}
        onOpen={onOpenApproveToken}
        onClose={onCloseApproveToken}
        onApprove={approve}
        isApproving={isApproving}
      />
    </>
  );
};
