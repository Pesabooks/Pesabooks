export interface Token {
  id: number;
  address: string;
  symbol: string;
  name: string;
  image: string;
  active: boolean;
  chain_id: number;
  decimals: number;
  is_native?: boolean;
}

export interface TokenBase {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  image: string;
  is_native?: boolean;
}
