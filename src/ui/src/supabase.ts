import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { createClient, PostgrestError } from '@supabase/supabase-js';
import { Category, Invitation, Pool, Profile, Token, Transaction, TransactionQueue } from './types';
import { Member } from './types/Member';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase configs are missing');
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Filter<Data> = (query: PostgrestFilterBuilder<Data>) => PostgrestFilterBuilder<Data>;

export const profilesTable = () => supabase.from<Profile>('profiles');
export const transationsTable = () => supabase.from<Transaction>('transactions');
export const poolsTable = () => supabase.from<Pool>('pools');
export const tokensTable = () => supabase.from<Token>('tokens');
export const categoriesTable = () => supabase.from<Category>('categories');
export const membersTable = () => supabase.from<Member>('members');
export const invitationsTable = () => supabase.from<Invitation>('invitations');
export const transationsQueueTable = () => supabase.from<TransactionQueue>('transactions_queue');

export const handleSupabaseError = (error: PostgrestError | null) => {
  if (error) {
    if (error.message === 'JWT expired') {
      window.location.replace('/auth/signin');
    }
    throw error;
  }
};
