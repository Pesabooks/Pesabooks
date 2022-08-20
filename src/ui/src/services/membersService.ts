import { handleSupabaseError, membersTable } from '../supabase';

export const getMembers = async (pool_id: string) => {
  const { data, error } = await membersTable()
    .select(
      `*, 
    user:users(*)
    `,
    )
    .eq('pool_id', pool_id);

  handleSupabaseError(error);
  return data ?? [];
};

export const isMemberAdmin = async (userId: string, pool_id: string) => {
  const { data, error } = await membersTable()
    .select()
    .eq('user_id', userId)
    .eq('pool_id', pool_id);

  handleSupabaseError(error);
  return data?.[0].role === 'admin';
};
