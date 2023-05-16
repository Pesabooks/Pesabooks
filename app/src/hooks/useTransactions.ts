import { Transaction } from '@pesabooks/types';
import { getTypedStorageItem } from '@pesabooks/utils/storage-utils';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getAllTransactions, getTransactionById } from '../services/transactionsServices';
import { Filter, supabase } from '../supabase';

export function useTransactions(
  pool_id: string,
  filter?: Filter<'transactions'>,
  config?: { useRealTime?: boolean; includeFailedTx?: boolean },
): { transactions: Transaction[]; isLoading: boolean; error: unknown; refresh: () => void } {
  const queryClient = useQueryClient();
  const queryKey = [pool_id, 'transactions'];

  const {
    data: transactions,
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: () => getAllTransactions(pool_id, filter),
  });

  useEffect(() => {
    const asyncDispatch = async (
      eventType: 'INSERT' | 'UPDATE' | 'DELETE',
      transactonId: number,
    ) => {
      const transaction = await getTransactionById(transactonId);

      if (eventType === 'INSERT') {
        queryClient.setQueryData<Transaction[]>(queryKey, (oldData) => [
          transaction!,
          ...(oldData ?? []),
        ]);
      } else if (eventType === 'UPDATE') {
        queryClient.setQueryData<Transaction[]>(queryKey, (oldData) => {
          return (oldData ?? []).map((item) => {
            return item.id === transaction!.id ? { ...item, ...transaction } : item;
          });
        });
      }
    };

    const client = supabase(true);
    let sub: RealtimeChannel;
    if (!isLoading && config?.useRealTime) {
      sub = client
        .channel('any')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'transactions', filter: `pool_id=eq.${pool_id}` },
          (payload) => {
            const t = payload.new as Transaction;
            if (t.pool_id === pool_id) {
              asyncDispatch(payload.eventType, t.id);
            }
          },
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            const access_token = getTypedStorageItem('supabase_access_token');
            client.realtime.setAuth(access_token);
          }
        });
    }
    return () => {
      if (sub) client.removeChannel(sub);
    };
  }, [config?.useRealTime, isLoading, pool_id]);

  return {
    transactions: transactions ?? [],
    isLoading,
    error,
    refresh: () => queryClient.invalidateQueries(queryKey),
  };
}
