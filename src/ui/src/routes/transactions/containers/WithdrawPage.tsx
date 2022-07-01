import { Button, Container, Heading, useDisclosure, useToast } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormProvider, useForm } from 'react-hook-form';
import { ConnectWalletButton } from '../../../components/Buttons/ConnectWalletButton';
import { Card, CardHeader } from '../../../components/Card';
import { InputAmountField } from '../../../components/Input/InputAmountField';
import { SelectCategoryField } from '../../../components/Input/SelectCategoryField';
import { SelectUserField } from '../../../components/Input/SelectUserField';
import { usePool } from '../../../hooks/usePool';
import { getAddressBalance } from '../../../services/blockchainServices';
import { getAllCategories } from '../../../services/categoriesService';
import { getAddressLookUp } from '../../../services/poolsService';
import { withdraw } from '../../../services/transactionsServices';
import { AddressLookup, Category } from '../../../types';
import { SubmittingTransactionModal } from '../components/SubmittingTransactionModal';
import { TextAreaMemoField } from '../components/TextAreaMemoField';
import {
  TransactionSubmittedModal,
  TransactionSubmittedModalRef
} from '../components/TransactionSubmittedModal';

interface WithdrawFormValue {
  amount: number;
  memo?: string;
  user: AddressLookup;
  category: Category;
}

export const WithdrawPage = () => {
  const [users, setUsers] = useState<AddressLookup[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { provider, isActive } = useWeb3React();
  const { pool } = usePool();
  const toast = useToast();
  const [balance, setBalance] = useState<number>(0);
  const confirmationRef = useRef<TransactionSubmittedModalRef>(null);

  const signer = (provider as Web3Provider)?.getSigner();
  const methods = useForm<WithdrawFormValue>();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const token = pool?.token;

  if (!token) {
    throw new Error('Argument Exception');
  }

  useEffect(() => {
    getAddressLookUp(pool.id, 'user').then(setUsers);

    getAllCategories(pool.id, { activeOnly: true }).then((categories) =>
      setCategories(categories ?? []),
    );
  }, [methods, pool]);

  useEffect(() => {
    if (pool) {
      getAddressBalance(pool.chain_id, token.address, pool.gnosis_safe_address).then(setBalance);
    }
  }, [token, pool]);

  const submit = async (formValue: WithdrawFormValue) => {
    if (!provider) return;
    onOpen();

    const { amount, memo, user, category } = formValue;

    try {
      const tx = await withdraw(signer, pool, category.id, amount, memo, user);

      confirmationRef.current?.open(tx);

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
      onClose();
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
              <SelectCategoryField mb="4" categories={categories} />

              <SelectUserField label="To User" mb="4" users={users} />

              <InputAmountField mb="4" balance={balance} symbol={token.symbol} />

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
      <TransactionSubmittedModal ref={confirmationRef} chainId={pool?.chain_id} />
      <SubmittingTransactionModal type="deposit" isOpen={isOpen} onClose={onClose} />
    </>
  );
};
