import { createClient, PostgrestError } from '@supabase/supabase-js';
import { Account, Category, Pool, Profile, Token, Transaction } from './types';
import { Member } from './types/Member';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase configs are missing');
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const profilesTable = () => supabase.from<Profile>('profiles');
export const transationsTable = () => supabase.from<Transaction>('transactions');
export const accountsTable = () => supabase.from<Account>('accounts');
export const poolsTable = () => supabase.from<Pool>('pools');
export const tokensTable = () => supabase.from<Token>('tokens');
export const categoriesTable = () => supabase.from<Category>('categories');
export const membersTable = () => supabase.from<Member>('members');

export const handleSupabaseError = (error: PostgrestError | null) => {
  if (error) {
    throw error;
  }
};
