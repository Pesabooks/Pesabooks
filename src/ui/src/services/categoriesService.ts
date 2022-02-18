import { categoriesTable, handleSupabaseError } from '../supabase';

export const getAllCategories = async (pool_id: number) => {
  const { data, error } = await categoriesTable().select().eq('pool_id', pool_id);

  handleSupabaseError(error);
  return data ?? [];
};
