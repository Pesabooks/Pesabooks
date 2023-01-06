import { Heading, Skeleton, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '../../../components/Card';
import { usePool } from '../../../hooks/usePool';
import { useTransactions } from '../../../hooks/useTransactions';
import { getAllCategories } from '../../../services/categoriesService';
import { getMembers } from '../../../services/membersService';
import { Filter } from '../../../supabase';
import { Category, Transaction, User } from '../../../types';
import { TransactionDetail, TransactionDetailRef } from '../components/TransactionDetail';
import { TransactionsTable } from '../components/TransactionsTable';

export const TransactionsPage = () => {
  const { pool } = usePool();
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  let [searchParams] = useSearchParams();
  const txDetailRef = useRef<TransactionDetailRef>(null);
  const [isLoading, setIsLoading] = useState(true);

  const openTransactionPane = (transactionId: number) => {
    txDetailRef.current?.open(transactionId);
  };
  const transactionIdParam = searchParams.get('id');

  if (!pool) {
    throw new Error();
  }

  useEffect(() => {
    const transactionId = Number(transactionIdParam);
    if (transactionId && !isNaN(transactionId)) {
      openTransactionPane(transactionId);
    }
  }, [transactionIdParam]);

  const filter: Filter<Transaction> = useCallback((query) => {
    return query.order('timestamp', { ascending: false }).limit(200);
  }, []);

  const { transactions, loading: txsLoading } = useTransactions(pool.id, filter, {
    useRealTime: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      const members = await getMembers(pool.id);
      setUsers(members?.map((m) => m.user!));
      setIsLoading(false);
      getAllCategories(pool.id).then(setCategories);
    };
    fetchData();
  }, [pool, transactions]);

  const isPending = (t: Transaction) =>
    t.status === 'awaitingConfirmations' || t.status === 'awaitingExecution';

  const compare = (t1: Transaction, t2: Transaction) => {
    if (!t1.safe_nonce || !t2.safe_nonce) return 0;
    if (t1.safe_nonce < t2.safe_nonce) {
      return -1;
    }
    if (t1.safe_nonce > t2.safe_nonce) {
      return 1;
    }
    return 0;
  };

  const txQueue = useMemo(
    () => [...transactions.filter((t) => isPending(t))].sort(compare),
    [transactions],
  );
  const txHistory = useMemo(() => transactions.filter((t) => !isPending(t)), [transactions]);

  return (
    <>
      <Helmet>
        <title>Transactions | {pool?.name}</title>
      </Helmet>
      <Heading as="h2" mb={4} size="lg">
        Transations
      </Heading>
      {txQueue.length > 0 && (
        <Card mb={30}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold">
              Queue
            </Text>
          </CardHeader>
          <CardBody>
            <TransactionsTable
              pool={pool}
              transactions={txQueue}
              users={users}
              loading={txsLoading}
              categories={categories}
              onSelect={(t) => openTransactionPane(t.id)}
              showNonce={true}
            ></TransactionsTable>
          </CardBody>
        </Card>
      )}

      <Skeleton height="20px" isLoaded={!isLoading}></Skeleton>
      <Card>
        <CardHeader>
          <Text fontSize="lg" fontWeight="bold">
            History
          </Text>
        </CardHeader>

        <CardBody>
          <TransactionsTable
            pool={pool}
            transactions={txHistory}
            users={users}
            loading={txsLoading}
            categories={categories}
            onSelect={(t) => openTransactionPane(t.id)}
            showNonce={false}
          ></TransactionsTable>
        </CardBody>
      </Card>
      <TransactionDetail ref={txDetailRef} />
    </>
  );
};
