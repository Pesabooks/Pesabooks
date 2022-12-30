import { Entity } from './Entity';
import { SwapData, TransactionStatus, TransactionType, TransferData } from './transaction';

export interface Activity extends Entity {
  timestamp?: number;
  hash: string;
  status: TransactionStatus;
  type: TransactionType;
  user_id: string;
  metadata: TransferData | SwapData;
  chain_id: number;
}
