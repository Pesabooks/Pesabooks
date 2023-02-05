import { handleSupabaseError, membersTable } from '../supabase';
import { Member } from '../types';

export const getMembers = async (pool_id: string, includeInactive = false) => {
  const query = membersTable()
    .select(
      `*, 
    user:users(*)
    `,
    )
    .eq('pool_id', pool_id);

  if (!includeInactive) {
    query.eq('active', true);
  }

  const { data, error } = await query;
  handleSupabaseError(error);
  return (data as Member[] | null) ?? [];
};

export const isMemberAdmin = async (userId: string, pool_id: string) => {
  const { data, error } = await membersTable()
    .select()
    .eq('user_id', userId)
    .eq('pool_id', pool_id)
    .eq('active', true);

  handleSupabaseError(error);
  return data?.[0].role === 'admin';
};

//deactivate member
export const deactivateMember = async (pool_id: string, user_id: string) => {
  const { error } = await membersTable()
    .update({ active: false, inactive_reason: 'Removed' })
    .eq('pool_id', pool_id)
    .eq('user_id', user_id);
  handleSupabaseError(error);
};
