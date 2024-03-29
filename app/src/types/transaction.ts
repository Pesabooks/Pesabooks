import { SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types';
import { Token as ParaswapToken } from 'paraswap';
import { Table } from '../supabase';
import { Category } from './Category';
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
  | 'rejection'
  | 'walletConnect'
  | 'changeThreshold';

export type TransactionStatus =
  | 'awaitingConfirmations'
  | 'awaitingExecution'
  | 'pending'
  | 'pending_rejection'
  | 'completed'
  | 'failed'
  | 'rejected';

export type Metadata =
  | TransferData
  | AddOrRemoveOwnerData
  | SwapData
  | WalletConnectData
  | ChangeThresholdData
  | UnlockTokenData;

export type Transaction = Omit<Table<'transactions'>, 'metadata'> & {
  category?: Category;
  status: TransactionStatus;
  type: TransactionType;
  metadata?: Metadata;
  transaction_data: TransactionData;
};

export type NewTransaction = Omit<
  Transaction,
  | 'id'
  | 'status'
  | 'created_at'
  | 'updated_at'
  | 'hash'
  | 'safe_tx_hash'
  | 'reject_safe_tx_hash'
  | 'safe_nonce'
  | 'user_id'
  | 'transaction_data'
  | 'threshold'
  | 'confirmations'
  | 'rejections'
> & {
  transaction_data: TransactionData | SafeTransactionDataPartial;
};

export interface TransactionData {
  from?: string;
  to: string;
  value: string;
  data: string;
  nonce?: number;
}

export interface TransferData {
  transfer_from?: string;
  transfer_from_name?: string;
  transfer_to: string;
  transfer_to_name?: string;
  token: TokenBase;
  amount: number | string;
  ramp_id?: string;
  ramp_purchase_view_token?: string;
}

export interface AddOrRemoveOwnerData {
  address: string;
  user_id: string;
  username: string;
  threshold: number;
  current_threshold: number;
}

export interface ChangeThresholdData {
  threshold: number;
  current_threshold: number;
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

export interface WalletConnectData {
  payload: {
    id: number;
    method: string;
    params: Array<{
      to: string;
      gas: string;
      data: string;
      from: string;
      value: string;
      gasPrice: string;
    }>;
    jsonrpc: string;
  };
  peer_data?: {
    url: string;
    name: string;
    icons: string[];
    description: string;
  };
  functionName?: string;
}

export interface UnlockTokenData {
  token: TokenBase;
  amount: number;
}

export interface PurchaseData {
  token: TokenBase;
  amount: string;
  ramp_id: string;
  ramp_purchase_view_token: string;
}
