import { Table } from '../supabase';

export type Invitation = Table<'invitations'> & {
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'revoked';
};

export type NewInvitation = Omit<Invitation, 'created_at' | 'id' | 'status' | 'user_id'>;
