import { RealtimeChannel } from '@supabase/supabase-js';
import { useCallback, useEffect, useReducer } from 'react';
import { getAllTransactions, getTransactionById } from '../services/transactionsServices';
import { Filter, supabase } from '../supabase';
import { Transaction } from '../types';

type State = {
  transactions: Transaction[];
  loading: boolean;
  error: any;
};

type Action = {
  type: 'INIT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ERROR';
  data: unknown;
};
const initialState: State = {
  transactions: [],
  loading: true,
  error: null,
};

const reducer = (state: State, action: Action): State => {
  if (action.type === 'INIT') {
    return {
      loading: false,
      error: null,
      transactions: action.data as Transaction[],
    };
  }
  if (action.type === 'UPDATE') {
    const t = action.data as Transaction;
    return {
      ...state,
      transactions: state.transactions.map((item) => {
        return item.id === t.id ? t : item;
      }),
    };
  } else if (action.type === 'INSERT') {
    const payload = action.data as Transaction;
    return {
      ...state,
      transactions: [payload, ...state.transactions],
    };
  } else if ((action.type = 'ERROR')) {
    return {
      ...state,
      loading: false,
      error: action.data,
    };
  }

  return state;
};

export function useTransactions(
  pool_id: string,
  chainId: number,
  safeAddress: string,
  filter?: Filter<'transactions'>,
  config?: { useRealTime?: boolean; includeFailedTx?: boolean },
): { transactions: Transaction[]; loading: boolean; error: any; refresh: () => void } {
  const [{ transactions, loading, error }, dispatch] = useReducer(reducer, initialState);

  const getInitialData = useCallback(async () => {
    try {
      const data = await getAllTransactions(pool_id, chainId, safeAddress, filter);
      dispatch({ type: 'INIT', data: data });
    } catch (error) {
      dispatch({ type: 'ERROR', data: error });
    }
  }, [chainId, filter, pool_id, safeAddress]);

  useEffect(() => {
    getInitialData();
  }, [getInitialData]);

  useEffect(() => {
    const asyncDispatch = (eventType: 'INSERT' | 'UPDATE' | 'DELETE', transactonId: number) => {
      getTransactionById(transactonId).then((transation) => {
        dispatch({ type: eventType, data: transation });
      });
    };

    let sub: RealtimeChannel;
    if (!loading && config?.useRealTime) {
      sub = supabase()
        .channel('any')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'transactions' },
          (payload) => {
            const t = payload.new as Transaction;
            if (t.pool_id === pool_id) {
              asyncDispatch(payload.eventType, t.id);
            }
          },
        )
        .subscribe();
    }
    return () => {
      if (sub) supabase().removeChannel(sub);
    }; // clean up
  }, [config?.useRealTime, loading, pool_id]);

  return {
    transactions,
    loading,
    error,
    refresh: getInitialData,
  };
}
