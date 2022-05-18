import { Entity } from './Entity';
import { Transaction } from './transaction';

export interface TransactionQueue extends Entity {
  pool_id: number;
  transaction: Partial<Transaction>;
}
