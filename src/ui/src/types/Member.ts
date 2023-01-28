import { Pool, User } from '.';
import { Table } from '../supabase';

export type Member = Table<'members'> & {
  user?: User;
  pool?: Pool;
  role: 'admin' | 'member';
  last_viewed_at: Date;
  inactive_reason: 'Removed' | 'Left' | 'None';
};
