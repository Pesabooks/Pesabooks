import { BaseEntity } from './Entity';
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
  members?: User[];
  organizer: User;
}
