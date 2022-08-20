import { User } from './Profile';

export interface BaseEntity<T> {
  id: T;
  created_at: string;
  user_id?: string;
  user?: User;
}

export interface Entity extends BaseEntity<number> {}
