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
  safe_nonce?: number;
  timestamp?: number;
  category_id?: number;
  category?: Category;
  memo?: string;
  hash: string;
  safe_tx_hash: string;
  reject_safe_tx_hash: string;
  status: TransactionStatus;
  type: TransactionType;
  pool_id: number;
  metadata: TransferData | AddOwnerData;
}

export interface TransferData {
  transfer_from?: string;
  transfer_to: string;
  token: Token;
  amount: number;
  ramp_id?: string;
  ramp_purchase_view_token?: string;
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
