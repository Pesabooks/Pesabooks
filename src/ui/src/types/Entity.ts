import { Profile } from './Profile';

export interface Entity {
  id: number;
  created_at: string;
  created_by_id?: string;
  created_by?: Profile;
}
