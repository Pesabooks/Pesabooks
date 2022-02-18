import { handleSupabaseError, membersTable } from '../supabase';

export const getMembers = async (pool_id: number) => {
  const { data, error } = await membersTable()
    .select(
      `*, 
    user:profiles(email,name)
    `,
    )
    .eq('pool_id', pool_id);

  handleSupabaseError(error);
  return data;
};
