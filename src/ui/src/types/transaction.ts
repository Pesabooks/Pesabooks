import { Category } from './Category';
import { Entity } from './Entity';

export type TransactionType = 'deposit' | 'withdrawal';
export type TransactionStatus = 'completed' | 'failed' | 'pending';
export interface Transaction extends Entity {
  timestamp?: number;
  category_id: number;
  category?: Category;
  memo?: string;
  hash: string;
  status: TransactionStatus;
  type: TransactionType;
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
