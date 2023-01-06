import { Token as ParaswapToken } from 'paraswap';
import { Category } from './Category';
import { Entity } from './Entity';
import { TokenBase } from './Token';

export type TransactionType =
  | 'createSafe'
  | 'deposit'
  | 'withdrawal'
  | 'addOwner'
  | 'removeOwner'
  | 'swapOwner'
  | 'unlockToken'
  | 'swap'
  | 'transfer_out'
  | 'purchase'
  | 'rejection';

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
  pool_id: string;
  metadata: TransferData | AddOwnerData | SwapData;
}

export interface TransferData {
  transfer_from?: string;
  transfer_to: string;
  token: TokenBase;
  amount: number | string;
  ramp_id?: string;
  ramp_purchase_view_token?: string;
}

export interface AddOwnerData {
  address: string;
  user_id: string;
  treshold: number;
}

export interface SwapData {
  src_token: ParaswapToken;
  src_usd: string;
  src_amount: string;
  dest_token: ParaswapToken;
  dest_amount: string;
  dest_usd: string;
  slippage: number;
  gas_cost: string;
  gas_cost_usd: string;
}

export interface UnlockTokenData {
  token: TokenBase;
  amount: number;
}
