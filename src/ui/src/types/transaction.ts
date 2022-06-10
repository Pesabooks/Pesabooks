import { Category } from './Category';
import { Entity } from './Entity';

export type TransactionType = 'deposit' | 'withdrawal' | 'addOwner' | 'removeOwner' | 'swapOwner';
export type TransactionStatus =
  | 'awaitingConfirmations'
  | 'awaitingExecution'
  | 'pending'
  | 'completed'
  | 'failed'
  | 'rejected';
export interface Transaction extends Entity {
  safeNonce?: number;
  timestamp?: number;
  category_id?: number;
  category?: Category;
  memo?: string;
  hash: string;
  safeTxHash: string;
  rejectSafeTxHash: string;
  status: TransactionStatus;
  type: TransactionType;
  pool_id: number;
  metadata: TransferData | AddOwnerData;
}

export interface TransferData {
  transfer_from: string;
  transfer_to: string;
  token: Token;
  amount: number;
}

export interface AddOwnerData {
  address: string;
  user_id: string;
  treshold: number;
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
  image: string;
}
