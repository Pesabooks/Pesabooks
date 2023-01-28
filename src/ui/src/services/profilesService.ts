import { handleSupabaseError, supabase, usersTable } from '../supabase';
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

export const getMyProfile = async (user_id: string) => {
  const { data: user } = await usersTable().select('*').eq('id', user_id).single();
  return user;
};

export const checkifUsernameExists = async (username: string) => {
  const { data, error } = await supabase()
    .rpc('check_username', {
      username,
    })
    .single();

  handleSupabaseError(error);

  return data;
};

export const updateUsername = async (user_id: string, username: string) => {
  const { error } = await usersTable().update({ username }).eq('id', user_id);
  handleSupabaseError(error);
};
