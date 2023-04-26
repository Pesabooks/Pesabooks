import { Table } from 'supabase';
import { SwapData, TransactionStatus, TransactionType, TransferData } from './transaction';

export type Activity = Omit<Table<'activities'>, 'metadata'> & {
  status: TransactionStatus;
  type: TransactionType;
  metadata: TransferData | SwapData;
  pool_id?: string;
  pool_name?: string;
};
