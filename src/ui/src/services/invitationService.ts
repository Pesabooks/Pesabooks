import { SendInvitationRequest } from '@pesabooks/supabase/functions';
import { handleSupabaseError, invitationsTable, supabase } from '../supabase';
import { Invitation, Pool, Profile } from '../types';

export const getActiveInvitations = async (pool_id: number) => {
  const { data, error } = await invitationsTable()
    .select()
    .filter('status', 'eq', 'pending')
    .filter('pool_id', 'eq', pool_id);

  handleSupabaseError(error);
  return data;
};

export const getInvitation = async (inviation_id: string) => {
  const { data, error } = await invitationsTable()
    .select('*, pool:pool_id(name), created_by:created_by_id(name)')
    .eq('active', true)
    .eq('id', inviation_id);
  handleSupabaseError(error);

  return data?.[0];
};

export const invitationExists = async (pool_id: number, email: string) => {
  const { data, error } = await invitationsTable()
    .select('id')
    .eq('pool_id', pool_id)
    .eq('email', email)
    .eq('active', true);

  handleSupabaseError(error);

  return !!data?.[0];
};

export const createInvitation = async (pool: Pool, name: string, email: string, user: Profile) => {
  if (await invitationExists(pool.id, email)) {
    throw new Error('An invitation already exists for this email');
  }

  const invitation: Partial<Invitation> = {
    pool_id: pool.id,
    name,
    email,
    active: true,
    role: 'member',
    pool_name: pool.name,
    invited_by: user.name,
  };
  const { data, error } = await invitationsTable().insert(invitation);
  handleSupabaseError(error);

  const newIinvitation = data?.[0];
  sendInvitation(newIinvitation!);

  return newIinvitation;
};

export const acceptInvitation = async (inviation_id: string) => {
  const { data, error } = await supabase.rpc('accept_invitation', {
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
  const { error } = await supabase.functions.invoke('send-invitation', {
    body: JSON.stringify(body),
  });

  if (error) {
    console.error(error.message);
  }
};
