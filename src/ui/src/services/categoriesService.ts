import { categoriesTable, handleSupabaseError } from '../supabase';
import { Category } from '../types';
import { TransactionType } from '../types/transaction';

export const getActiveCategories = async (pool_id: number, transactionType: TransactionType) => {
  const { data, error } = await categoriesTable()
    .select()
    .filter(transactionType, 'eq', true)
    .order('id')
    .eq('active', true)
    .eq('pool_id', pool_id);

  handleSupabaseError(error);
  return data ?? [];
};

export const getAllCategories = async (pool_id: number) => {
  const { data, error } = await categoriesTable()
    .select()
    .order('active', { ascending: false })
    .order('id')
    .eq('pool_id', pool_id);

  handleSupabaseError(error);
  return data ?? [];
};

export const editCategory = async (
  id: number,
  { name, description, deposit, withdrawal }: Partial<Category>,
) => {
  const { error } = await categoriesTable()
    .update({ name, description, deposit, withdrawal })
    .eq('id', id);

  handleSupabaseError(error);
};

export const addCategory = async (
  pool_id: number,
  { name, description, deposit, withdrawal }: Partial<Category>,
) => {
  const { error } = await categoriesTable().insert({
    name,
    description,
    deposit,
    withdrawal,
    pool_id,
  });

  handleSupabaseError(error);
};

export const activateCategory = async (id: number, active: boolean) => {
  const { error } = await categoriesTable().update({ active }).eq('id', id);

  handleSupabaseError(error);
};
