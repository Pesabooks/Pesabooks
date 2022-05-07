import { Category } from './Category';
import { Entity } from './Entity';

export type TransactionType = 'deposit' | 'withdrawal';
export interface Transaction extends Entity {
  from: string;
  to: string;
  transfer_from: string;
  transfer_to: string;
  user_id: string;
  timestamp?: number;
  category_id: number;
  category?: Category;
  amount: number;
  memo?: string;
  hash: string;
  status: number;
  type: TransactionType;
  posting?: boolean;
  pool_id: number;
  metadata: TransferData;
}

interface TransferData {
  transfer_from: string;
  transfer_to: string;
  token: Token;
  amount: number;
}

// interface SwapData {
//   srcToken: Token;
//   destToken: Token;
//   srcAmount: number;
//   destAmount: number;
// }

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}
