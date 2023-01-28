import { categoriesTable, handleSupabaseError } from '../supabase';
import { Category } from '../types';

export const getAllCategories = async (pool_id: string, options?: { activeOnly: boolean }) => {
  let query = categoriesTable().select().order('id').eq('pool_id', pool_id);

  if (options?.activeOnly) {
    query = query.order('active', { ascending: false });
  }

  const { data, error } = await query;

  handleSupabaseError(error);

  return (data as Category[] | null) ?? [];
};

export const editCategory = async (id: number, category: Partial<Category>) => {
  const { error } = await categoriesTable().update(category).eq('id', id);

  handleSupabaseError(error);
};

export const addCategory = async (pool_id: string, { name, description }: Partial<Category>) => {
  const { error } = await categoriesTable().insert({
    name,
    description,
    pool_id,
  });

  handleSupabaseError(error);
};

export const activateCategory = async (id: number, active: boolean) => {
  const { error } = await categoriesTable().update({ active }).eq('id', id);

  handleSupabaseError(error);
};
