import { Table } from '../supabase';
import { Member } from './Member';
import { User } from './Profile';
import { Token } from './Token';

export type Pool = Table<'pools'> & {
  token?: Token;
  active: boolean;
  //todo: need some refectoring here
  members?: User[];
  members2?: Member[];
  organizer: User;
};
