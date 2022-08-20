import { Pool, User } from '.';

export interface Member {
  user_id: string;
  user?: User;
  pool_id: string;
  pool?: Pool;
  active: boolean;
  role: 'admin' | 'member';
  last_viewed_at: Date;
}
