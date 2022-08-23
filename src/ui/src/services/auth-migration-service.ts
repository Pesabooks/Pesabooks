import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_OLD_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_OLD_SUPABASE_ANON_KEY;

let supabaseClient: SupabaseClient;

if (process.env.REACT_APP_ENV === 'prod' && supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const isUserExistsInOldDatabase = async (email: string) => {
  const { data } = await supabaseClient
    .from('profiles')
    .select()
    .eq('email', email)
    .eq('migrated', false);

  if (data && data.length > 0) return true;

  return false;
};

export const logInAndReturnUser = async (email: string, password: string) => {
  const { user } = await supabaseClient.auth.signIn({
    email,
    password,
  });

  if (user) {
    const { data } = await supabaseClient.from('profiles').select().eq('id', user.id);
    return data?.[0];
  }

  return null;
};

export const migrateUSer = async (id: string) => {
  await supabaseClient.from('profiles').update({ migrated: true }).eq('id', id);
};
