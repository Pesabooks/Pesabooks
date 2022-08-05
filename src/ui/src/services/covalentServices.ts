import { BalancesReponse } from '@pesabooks/supabase/functions';
import { supabase } from '../supabase';

export const getTotalBalance = async (poolId: number) => {
  const { data } = await supabase.functions.invoke<BalancesReponse[]>('balances', {
    body: JSON.stringify({ poolId }),
  });

  return data?.reduce((balance, resp) => balance + resp.quote, 0);
};

export const getBalances = async (poolId: number) => {
  const { data } = await supabase.functions.invoke<BalancesReponse[]>('balances', {
    body: JSON.stringify({ poolId }),
  });

  return data;
};
