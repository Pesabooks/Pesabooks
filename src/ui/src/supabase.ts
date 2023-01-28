import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { createClient, PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types/database';
import { isTokenExpired } from './utils/jwt-utils';
import { getTypedStorageItem } from './utils/storage-utils';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase configs are missing');
}
const _anonSupabaseClient: SupabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
let _supabaseClient: SupabaseClient;

export const initSupabaseClient = (access_token?: string) => {
  if (!access_token) {
    access_token = getTypedStorageItem('supabase_access_token') ?? undefined;
  }
  if (access_token) {
    const isExpired = isTokenExpired(access_token);
    if (!isExpired) {
      _supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        realtime: {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
        global: {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      });
    }
  }
};

export const supabase = () => {
  return _supabaseClient ?? _anonSupabaseClient;
};

type Schema = Database['public'];

export type Table<TableName extends string & keyof Schema['Tables']> =
  Database['public']['Tables'][TableName]['Row'];

export type QueryBuilder<TableName extends string & keyof Schema['Tables']> =
  PostgrestFilterBuilder<Schema, Schema['Tables'][TableName]['Row'], any>;

export type Filter<TableName extends string & keyof Schema['Tables']> = (
  query: QueryBuilder<TableName>,
) => QueryBuilder<TableName>;

export const usersTable = () => supabase().from('users');
export const transationsTable = () => supabase().from('transactions');
export const poolsTable = () => supabase().from('pools');
export const tokensTable = () => supabase().from('tokens');
export const categoriesTable = () => supabase().from('categories');
export const membersTable = () => supabase().from('members');
export const invitationsTable = () => supabase().from('invitations');
export const activitiesTable = () => supabase().from('activities');
export const handleSupabaseError = (error: PostgrestError | null) => {
  if (error) {
    if (error.message === 'JWT expired') {
      window.location.replace('/auth/signin');
    }
    throw error;
  }
};

initSupabaseClient();
