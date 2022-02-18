import * as Sentry from '@sentry/react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { profilesTable, supabase } from '../supabase';
import { Profile } from '../types';

export type SignInType = {
  email: string;
  password: string;
};

type AuthContextType = {
  user: Profile | null | undefined;
  authenticated: boolean;
  signOut: () => void;
  signUp: (SignIn: SignInType) => Promise<string>;
  signIn: (SignIn: SignInType) => void;
  signInWithMetamask: (signer: ethers.providers.JsonRpcSigner) => Promise<boolean>;
  loading: boolean;
};

export const AuthContext = React.createContext<Partial<AuthContextType>>({});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<Profile | null>();
  const [loading, setLoading] = useState(true);

  let getUserWithProfile = async (supbaseUser: SupabaseUser | undefined | null) => {
    if (!supbaseUser) {
      Sentry.configureScope((scope) => scope.setUser(null));

      return null;
    }
    let { data } = await profilesTable()
      .select(`name, last_pool_id`)
      .eq('id', supbaseUser.id)
      .single();

    const profile: Profile = {
      id: supbaseUser.id,
      name: data?.name ?? '',
      last_pool_id: data?.last_pool_id,
      email: supbaseUser.email || '',
    };

    Sentry.setUser({ email: profile.email, username: profile.name, id: profile.id });

    return profile;
  };

  let signIn = async ({ email, password }: SignInType) => {
    const result = await supabase.auth.signIn({ email, password });

    if (result.error) throw result.error;
    setLoading(true);
  };

  useEffect(() => {
    // Check active sessions and sets the user
    const session = supabase.auth.session();

    getUserWithProfile(session?.user).then((user) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      getUserWithProfile(session?.user).then((user) => {
        setUser(user);
        setLoading(false);
      });
    });

    return listener?.unsubscribe;
  }, []);

  const value = {
    user,
    authenticated: user !== null,
    loading,
    signUp: async (data: SignInType) => {
      const result = await supabase.auth.signUp(data);
      setLoading(true);
      return result.user?.id ?? '';
    },
    signIn,
    signOut: () => supabase.auth.signOut(),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function getCurrentUserId() {
  return supabase.auth.session()?.user?.id;
}
