import { Entity } from './Entity';

export interface Account extends Entity {
  name: string;
  description?: string;
  is_default: boolean;
  contract_address: string;
  pool_id: number;
  balance?: number;
}
