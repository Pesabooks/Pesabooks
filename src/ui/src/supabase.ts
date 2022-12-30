import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { createClient, PostgrestError } from '@supabase/supabase-js';
import { Activity, Category, Invitation, Pool, Token, Transaction, User } from './types';
import { Member } from './types/Member';
import { isTokenExpired } from './utils/jwt-utils';
import { getTypedStorageItem } from './utils/storage-utils';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase configs are missing');
}
const _supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const supabase = () => {
  const access_token = getTypedStorageItem('supabase_access_token');
  if (access_token) {
    const isExpired = isTokenExpired(access_token);
    if (!isExpired) {
      _supabaseClient.auth.setAuth(access_token);
    }
  }

  return _supabaseClient;
};

export type Filter<Data> = (query: PostgrestFilterBuilder<Data>) => PostgrestFilterBuilder<Data>;

export const usersTable = () => supabase().from<User>('users');
export const transationsTable = () => supabase().from<Transaction>('transactions');
export const poolsTable = () => supabase().from<Pool>('pools');
export const tokensTable = () => supabase().from<Token>('tokens');
export const categoriesTable = () => supabase().from<Category>('categories');
export const membersTable = () => supabase().from<Member>('members');
export const invitationsTable = () => supabase().from<Invitation>('invitations');
export const activitiesTable = () => supabase().from<Activity>('activities');
export const handleSupabaseError = (error: PostgrestError | null) => {
  if (error) {
    if (error.message === 'JWT expired') {
      window.location.replace('/auth/signin');
    }
    throw error;
  }
};
