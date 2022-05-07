import { Entity } from './Entity';

export interface Category extends Entity {
  name: string;
  description?: string;
  active: boolean;
  deposit?: boolean;
  withdrawal?: boolean;
  pool_id: number;
}
