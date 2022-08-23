import { BalanceQuery, BalancesReponse } from '@pesabooks/supabase/functions';
import { supabase } from '../supabase';

export const getBalances = async (chain_id: number, address: string) => {
  if (!address) throw new Error();

  const body: BalanceQuery = { chain_id, address, quote: 'USD' };
  const { data, error } = await supabase().functions.invoke<BalancesReponse[]>('balances', {
    body: JSON.stringify(body),
  });

  if (error) throw error;
  if (!Array.isArray(data)) throw new Error(data ?? '');

  return data;
};
