export interface Token {
  address: string;
  symbol: string;
  name: string;
  image: string;
  active: boolean;
  chain_id: number;
  decimals: number;
  is_native?: boolean;
}

export type TokenBase = Omit<Token, 'active' | 'chain_id'>;
