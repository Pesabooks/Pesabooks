export interface Invitation {
  id: string;
  name: string;
  email: string;
  pool_id: number;
  pool_name: string;
  role: 'admin' | 'member';
  active: boolean;
  status: 'pending' | 'accepted' | 'revoked';
  created_by_id: string;
  invited_by: string;
}
