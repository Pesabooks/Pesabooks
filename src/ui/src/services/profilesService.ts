import { handleSupabaseError, usersTable } from '../supabase';
import { getTypedStorageItem } from '../utils/storage-utils';

export const getCurrentUserProfile = async () => {
  const currentUserId = getTypedStorageItem('user_id');

  if (!currentUserId) throw new Error();

  const { data, error } = await usersTable().select().eq('id', currentUserId);
  handleSupabaseError(error);

  return data?.[0];
};

export const updateLastPool = async (user_id: string, pool_id: string) => {
  const { error } = await usersTable().update({ last_pool_id: pool_id }).eq('id', user_id);
  handleSupabaseError(error);
};

export const insertProfile = async (user_id: string, name: string, email: string) => {
  await usersTable().insert({ id: user_id, name: name, email: email });
};
