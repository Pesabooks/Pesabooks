import { Heading } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { usePool } from '../../../hooks/usePool';
import { useTransactions } from '../../../hooks/useTransactions';
import { getAllCategories } from '../../../services/categoriesService';
import { getAddressLookUp } from '../../../services/poolsService';
import { AddressLookup, Category } from '../../../types';
import { TransactionsTable } from '../components/TransactionsTable';

export const TransactionsPage = () => {
  const { pool } = usePool();
  const [addressLookups, setAddressLookups] = useState<AddressLookup[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  if (!pool) {
    throw new Error();
  }

  const filter = useCallback((query) => {
    return query.order('timestamp', { ascending: false }).limit(200);
  }, []);

  const { transactions, loading: txsLoading } = useTransactions(pool.id, filter, {
    useRealTime: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      getAddressLookUp(pool.id).then(setAddressLookups);
      getAllCategories(pool.id).then(setCategories);
    };
    fetchData();
  }, [pool, transactions]);

  return (
    <>
      <Helmet>
        <title>Transactions | {pool?.name}</title>
      </Helmet>
      <Heading as="h2" mb={4} size="lg">
        Transations
      </Heading>
      <TransactionsTable
        pool={pool}
        transactions={transactions}
        addressLookups={addressLookups}
        loading={txsLoading}
        categories={categories}
      ></TransactionsTable>
    </>
  );
};
