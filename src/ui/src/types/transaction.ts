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
  | 'rejection'
  | 'walletConnect'
  | 'changeThreshold';

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
  metadata: TransferData | AddOwnerData | SwapData | WalletConnectData | ChangeThresholdData;
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
