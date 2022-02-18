import { Entity } from './Entity';

export interface Category extends Entity {
  name: string;
  description?: string;
  active?: boolean;
  pool_id: number;
}
