import { RealtimeSubscription, SupabaseRealtimePayload } from '@supabase/supabase-js';
import { useEffect, useReducer } from 'react';
import { getAllTransactions, getTransactionById } from '../services/transactionsServices';
import { Filter, supabase, transationsTable } from '../supabase';
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
  pool_id: number,
  filter?: Filter<Transaction>,
  config?: { useRealTime?: boolean; includeFailedTx?: boolean },
): { transactions: Transaction[]; loading: boolean; error: any } {
  const [{ transactions, loading, error }, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const getInitialData = async () => {
      try {
        const data = await getAllTransactions(pool_id, filter);
        dispatch({ type: 'INIT', data: data });
      } catch (error) {
        dispatch({ type: 'ERROR', data: error });
      }
    };
    getInitialData();
  }, [filter, pool_id]);

  useEffect(() => {
    const asyncDispatch = (payload: SupabaseRealtimePayload<Transaction>) => {
      getTransactionById(payload.new.id).then((transation) => {
        dispatch({ type: payload.eventType, data: transation });
      });
    };

    let sub: RealtimeSubscription;
    if (!loading && config?.useRealTime) {
      sub = transationsTable()
        .on('*', (payload) => {
          if (payload.new.pool_id === pool_id) {
            asyncDispatch(payload);
          }
        })
        .subscribe();
    }
    return () => {
      if (sub) supabase.removeSubscription(sub);
    }; // clean up
  }, [config?.useRealTime, loading, pool_id]);

  return { transactions, loading, error };
}
