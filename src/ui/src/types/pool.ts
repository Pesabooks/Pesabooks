import { Entity } from './Entity';
import { Profile } from './Profile';
import { Token } from './Token';

export interface Pool extends Entity {
  name: string;
  description?: string;
  token_id: number;
  token?: Token;
  chain_id: number;
  active: boolean;
  gnosis_safe_address: string;
  members?: Profile[];
}
