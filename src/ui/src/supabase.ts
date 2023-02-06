import { PostgrestFilterBuilder, PostgrestQueryBuilder } from '@supabase/postgrest-js';
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

export const supabase = (forRealtime = false) => {
  if (forRealtime) return _anonSupabaseClient;

  return _supabaseClient ?? _anonSupabaseClient;
};

type Schema = Database['public'];

type TableName = string & keyof Schema['Tables'];

export type Table<T extends TableName> = Schema['Tables'][T]['Row'];

export type QueryBuilder<T extends TableName> = PostgrestFilterBuilder<Schema, Table<T>, any>;

export type Filter<T extends TableName> = (query: QueryBuilder<T>) => QueryBuilder<T>;

const getTable = <T extends TableName>(
  tableName: T,
): PostgrestQueryBuilder<Schema, Schema['Tables'][T]> => supabase().from(tableName);

export const usersTable = () => getTable('users');
export const transationsTable = () => getTable('transactions');
export const poolsTable = () => getTable('pools');
export const tokensTable = () => getTable('tokens');
export const categoriesTable = () => getTable('categories');
export const membersTable = () => getTable('members');
export const invitationsTable = () => getTable('invitations');
export const activitiesTable = () => getTable('activities');

export const handleSupabaseError = (error: PostgrestError | null) => {
  if (error) {
    throw error;
  }
};

initSupabaseClient();
