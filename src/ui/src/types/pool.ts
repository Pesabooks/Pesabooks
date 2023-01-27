import { BaseEntity } from './Entity';
import { Member } from './Member';
import { User } from './Profile';
import { Token } from './Token';

export interface Pool extends BaseEntity<string> {
  name: string;
  description?: string;
  token_id: number;
  token?: Token;
  chain_id: number;
  active: boolean;
  gnosis_safe_address?: string;
  //todo: need some refectoring here
  members?: User[];
  members2?: Member[];
  organizer: User;
}
