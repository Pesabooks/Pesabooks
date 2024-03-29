import { SendInvitationRequest } from '@pesabooks/supabase/functions';
import { Invitation, NewInvitation, Pool } from '@pesabooks/types';
import { handleSupabaseError, invitationsTable, supabase } from '../supabase';

export const getActiveInvitations = async (pool_id: string) => {
  const { data, error } = await invitationsTable()
    .select()
    .filter('status', 'eq', 'pending')
    .filter('pool_id', 'eq', pool_id);

  handleSupabaseError(error);
  return data as Invitation[];
};

export const getActiveInvitationsByEmail = async (email: string) => {
  const { data, error } = await invitationsTable()
    .select()
    .filter('status', 'eq', 'pending')
    .filter('email', 'eq', email);

  handleSupabaseError(error);
  return data as Invitation[] | null;
};

export const getInvitation = async (invitation_id: string) => {
  const { data, error } = await supabase()
    .rpc('get_invitation', { invitation_id })
    .eq('active', true)
    .single();

  handleSupabaseError(error);

  return data as Invitation | null;
};

export const invitationExists = async (pool_id: string, email: string) => {
  const { data, error } = await invitationsTable()
    .select('id')
    .eq('pool_id', pool_id)
    .eq('email', email)
    .eq('active', true);

  handleSupabaseError(error);

  return !!data?.[0];
};

export const createInvitation = async (
  pool: Pool,
  name: string,
  email: string,
  username: string,
) => {
  if (await invitationExists(pool.id, email)) {
    throw new Error('An invitation already exists for this email');
  }

  const invitation: NewInvitation = {
    pool_id: pool.id,
    name,
    email: email,
    active: true,
    role: 'member',
    pool_name: pool.name,
    invited_by: username,
  };
  const { data, error } = await invitationsTable().insert(invitation).select().single();
  handleSupabaseError(error);

  const newIinvitation = data as Invitation;
  sendInvitation(newIinvitation);

  return newIinvitation;
};

export const acceptInvitation = async (inviation_id: string) => {
  const { data, error } = await supabase().rpc('accept_invitation', {
    invitation_id: inviation_id,
  });

  handleSupabaseError(error);

  return data;
};

export const revokeInvitation = async (inviration_id: string) => {
  const { error } = await invitationsTable()
    .update({ active: false, status: 'revoked' })
    .eq('id', inviration_id);
  handleSupabaseError(error);
};

export const sendInvitation = async (invitation: Invitation) => {
  const body: SendInvitationRequest = {
    invitee: invitation.name,
    invitee_email: invitation.email,
    inviter: invitation.invited_by,
    group: invitation.pool_name,
    url: `${window.location.origin}/auth/invitation/${invitation.id}`,
  };
  const { error } = await supabase().functions.invoke('send-invitation', {
    body: JSON.stringify(body),
  });

  if (error) {
    console.error(error.message);
  }
};

export const getPendingInvitationCount = async (pool_id: string) => {
  const { count, error } = await invitationsTable()
    .select('*', { count: 'exact', head: true })
    .filter('status', 'eq', 'pending')
    .filter('pool_id', 'eq', pool_id);

  handleSupabaseError(error);
  return count ?? 0;
};
