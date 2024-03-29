import { Card, CardBody, CardHeader, Heading, Skeleton } from '@chakra-ui/react';
import { usePool, useTransactions } from '@pesabooks/hooks';
import { getMembers } from '@pesabooks/services/membersService';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { Filter } from '../../../supabase';
import { Transaction } from '../../../types';
import { TransactionDetail, TransactionDetailRef } from '../components/TransactionDetail';
import { TransactionsTable } from '../components/TransactionsTable';

export const TransactionsPage = () => {
  const { pool } = usePool();
  const [searchParams] = useSearchParams();
  const txDetailRef = useRef<TransactionDetailRef>(null);

  const openTransactionPane = (transactionId: number) => {
    txDetailRef.current?.open(transactionId);
  };
  const transactionIdParam = searchParams.get('id');

  if (!pool) {
    throw new Error();
  }

  const { data: users, isLoading } = useQuery({
    queryKey: [pool.id, 'members'],
    queryFn: () => getMembers(pool.id).then((members) => members.map((m) => m.user!)),
    enabled: !!pool.id,
  });

  useEffect(() => {
    const transactionId = Number(transactionIdParam);
    if (transactionId && !isNaN(transactionId)) {
      openTransactionPane(transactionId);
    }
  }, [transactionIdParam]);

  const filter: Filter<'transactions'> = useCallback((query) => {
    return query.order('timestamp', { ascending: false }).limit(200);
  }, []);

  const { transactions, isLoading: txsLoading } = useTransactions(pool.id, filter, {
    useRealTime: true,
  });

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

      {txQueue.length > 0 && (
        <Card mb={30}>
          <CardHeader>
            <Heading as="h2" mb={4} size="lg">
              Proposals
            </Heading>
          </CardHeader>
          <CardBody>
            <TransactionsTable
              pool={pool}
              transactions={txQueue}
              users={users ?? []}
              loading={txsLoading}
              onSelect={(t) => openTransactionPane(t.id)}
              showNonce={true}
            ></TransactionsTable>
          </CardBody>
        </Card>
      )}

      <Skeleton height="20px" isLoaded={!isLoading}></Skeleton>
      <Card>
        <CardHeader>
          <Heading as="h2" mb={4} size="lg">
            Transations
          </Heading>
        </CardHeader>

        <CardBody>
          <TransactionsTable
            pool={pool}
            transactions={txHistory}
            users={users ?? []}
            loading={txsLoading}
            onSelect={(t) => openTransactionPane(t.id)}
            showNonce={false}
          ></TransactionsTable>
        </CardBody>
      </Card>
      <TransactionDetail ref={txDetailRef} />
    </>
  );
};
