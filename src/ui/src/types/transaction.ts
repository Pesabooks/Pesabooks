import { Category } from './Category';
import { Entity } from './Entity';

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
  type: 'deposit' | 'withdrawal' | 'transfer';
  posting?: boolean;
  pool_id: number;
}
