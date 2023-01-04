import { BalanceQuery, BalancesReponse } from '@pesabooks/supabase/functions';
import { supabase } from '../supabase';
import { TokenBase } from '../types/Token';

export const getBalances = async (chain_id: number, address: string) => {
  if (!address) throw new Error();

  const body: BalanceQuery = { chain_id, address, quote: 'USD' };
  const { data, error } = await supabase().functions.invoke<BalancesReponse[]>('balances', {
    body: JSON.stringify(body),
  });

  if (error) throw error;
  if (!Array.isArray(data)) throw new Error(data ?? '');

  return data
    .filter((b) => b.type !== 'dust')
    .map(
      (b) =>
        ({
          balance: b.balance,
          quote: b.quote,
          token: {
            address: b.contract_address,
            symbol: b.contract_ticker_symbol,
            decimals: b.contract_decimals,
            name: b.contract_name,
            image: b.logo_url,
            is_native: b.native_token,
          },
        } as TokenBalance),
    );
};

export interface TokenBalance {
  balance: string;
  quote: number;
  type: string;
  token: TokenBase;
}
