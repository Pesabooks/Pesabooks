import { accountsTable, handleSupabaseError } from '../supabase';

export const getAccounts = async (pool_id: number) => {
  const { data, error } = await accountsTable().select().eq('pool_id', pool_id);
  handleSupabaseError(error);

  return data;
};
