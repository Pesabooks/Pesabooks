import { supabase } from '../supabase';

export const getBalances = async (poolId: number) => {
  const { data, error } = await supabase.functions.invoke<BalancesReponse[]>('balances', {
    body: JSON.stringify({ poolId }),
  });

  console.log(data, error);

  return data;
};

export interface BalancesReponse {
  contract_decimals: number;
  contract_name: string;
  contract_ticker_symbol: string;
  contract_address: string;
  supports_erc: string[];
  logo_url: string;
  last_transferred_at: Date;
  type: string;
  balance: string;
  balance_24h: string;
  quote_rate?: any;
  quote_rate_24h?: any;
  quote: number;
  quote_24h?: any;
  nft_data?: any;
}
