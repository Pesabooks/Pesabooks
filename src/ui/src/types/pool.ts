import { Table } from '../supabase';
import { Member } from './Member';
import { Token } from './Token';
import { User } from './User';

export type Pool = Table<'pools'> & {
  token?: Token;
  active: boolean;
  //todo: need some refectoring here
  members?: User[];
  members2?: Member[];
  organizer: User;
};
