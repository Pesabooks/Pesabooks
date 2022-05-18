import { getCurrentUserId } from '../contexts/AuthContext';
import { handleSupabaseError, profilesTable, supabase } from '../supabase';
import { Profile } from '../types';

export const getCurrentUserProfile = async () => {
  const currentUserId = getCurrentUserId();

  if (!currentUserId) throw new Error();

  const { data, error } = await profilesTable().select().eq('id', currentUserId);
  handleSupabaseError(error);

  return data?.[0];
};

export const getAllUsers = async (pool_id: number) => {
  const { data, error } = await supabase.rpc<Profile>('get_pool_users', { pool_id });
  handleSupabaseError(error);
  return data;
};

export const updateLastPool = async (user_id: string, pool_id: number) => {
  const { error } = await profilesTable().update({ last_pool_id: pool_id }).eq('id', user_id);
  handleSupabaseError(error);
};

export const insertProfile = async (user_id: string, name: string, email: string) => {
  await profilesTable().insert({ id: user_id, name: name, email: email });
};
