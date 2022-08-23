import { Web3Provider } from '@ethersproject/providers';
import * as Sentry from '@sentry/react';
import {
  ADAPTER_EVENTS,
  CHAIN_NAMESPACES,
  CustomChainConfig,
  WALLET_ADAPTERS
} from '@web3auth/base';
import { Web3AuthCore } from '@web3auth/core';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as FirebaseSignOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { networks } from '../data/networks';
import { firebaseAuth } from '../firebase';
import { usersTable } from '../supabase';
import { User } from '../types';
import { clearTypedStorageItem, setTypedStorageItem } from '../utils/storage-utils';

export interface IWeb3AuthContext {
  web3Auth: Web3AuthCore | null;
  account: string | null;
  provider: Web3Provider | null;
  isInitialised: boolean;
  user: User | null | undefined;
  chainId: number;
  signOut: () => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  isAuthenticated: boolean;
  setChainId: (chainId: number) => void;
}

const web3AuthClientId = process.env.REACT_APP_WEB3AUTH_CLIENT_ID ?? '';
const web3AuthVerifier = process.env.REACT_APP_WEB3AUTH_VERIFIER ?? '';
const web3AuthNetwork = process.env.REACT_APP_WEB3AUTH_NETWORk ?? '';

const defaultChain = 137;

export const Web3AuthContext = React.createContext<IWeb3AuthContext>({
  web3Auth: null,
  provider: null,
  isInitialised: false,
  user: null,
  account: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  setChainId: async () => {},
  isAuthenticated: false,
  chainId: defaultChain,
});

export const Web3AuthProvider = ({ children }: any) => {
  const [web3Auth, setWeb3Auth] = useState<Web3AuthCore | null>(null);
  const [provider, setProvider] = useState<Web3Provider | null>(null);
  const [chainId, setChainId] = useState<number>(defaultChain);
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isInitialised, setIsInitialised] = useState(false);

  useEffect(() => {
    const subscribeAuthEvents = (web3auth: Web3AuthCore) => {
      web3auth.on(ADAPTER_EVENTS.CONNECTED, (data: unknown) => {
        setProvider(new Web3Provider(web3auth.provider!));
      });
    };

    const currentNetwork = networks[chainId];

    const currentChainConfig: CustomChainConfig = {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: currentNetwork.chainId,
      rpcTarget: currentNetwork.rpcUrls[0],
      displayName: currentNetwork.chainName,
      blockExplorer: currentNetwork.blockExplorerUrls[0],
      ticker: currentNetwork.nativeCurrency.symbol,
      tickerName: currentNetwork.nativeCurrency.name,
    };

    const init = async () => {
      try {
        const web3AuthInstance = new Web3AuthCore({
          chainConfig: currentChainConfig,
          enableLogging: false,
        });

        const adapter = new OpenloginAdapter({
          loginSettings: { mfaLevel: 'none' },
          adapterSettings: {
            clientId: web3AuthClientId,
            network: web3AuthNetwork === 'testnet' ? 'testnet' : 'mainnet',
            uxMode: 'redirect',
            redirectUrl: `${window.location.origin}/auth/callback`,
            loginConfig: {
              jwt: {
                name: 'pesabooks firebase',
                verifier: web3AuthVerifier,
                typeOfLogin: 'jwt',
                clientId: web3AuthClientId,
              },
            },
          },
        });
        web3AuthInstance.configureAdapter(adapter);
        subscribeAuthEvents(web3AuthInstance);

        await web3AuthInstance.init();

        setWeb3Auth(web3AuthInstance);
        if (web3AuthInstance.provider) {
          setProvider(new Web3Provider(web3AuthInstance.provider));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsInitialised(true);
      }
    };

    init();
  }, [chainId]);

  const signIn = async (email: string, password: string) => {
    // log in firebase
    const { user } = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const fbIdtoken = await user.getIdToken();

    await web3Login(fbIdtoken);
  };

  const signUp = async (name: string, email: string, password: string) => {
    const { user } = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    await updateProfile(user, { displayName: name });
    await usersTable().insert({ id: user.uid, name, email: user.email! });

    const fbIdtoken = await user.getIdToken();
    await web3Login(fbIdtoken);
  };

  const web3Login = async (jwtToken: string) => {
    if (!web3Auth) {
      throw new Error('web3auth not initialized yet');
    }

    await web3Auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
      relogin: false,
      loginProvider: 'jwt',
      extraLoginOptions: {
        id_token: jwtToken,
        domain: window.location.origin,
        verifierIdField: 'email',
      },
    });
  };

  const logout = async () => {
    if (!web3Auth) {
      console.log('web3auth not initialized yet');
      return;
    }

    clearTypedStorageItem('supabase_access_token');
    await FirebaseSignOut(firebaseAuth);
    await web3Auth.logout();
    setProvider(null);
  };

  useEffect(() => {
    const getAccount = async () => {
      if (!isInitialised || !provider) {
        return;
      }
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      setAccount(address);
    };
    getAccount();
  }, [provider, isInitialised]);

  useEffect(() => {
    let getUserWithProfile = async (firebaseUser: FirebaseUser | undefined | null) => {
      if (!firebaseUser) {
        Sentry.configureScope((scope) => scope.setUser(null));

        return null;
      }
      let { data } = await usersTable()
        .select(`name, last_pool_id`)
        .eq('id', firebaseUser.uid)
        .single();

      const profile: User = {
        id: firebaseUser.uid,
        name: data?.name ?? firebaseUser.displayName ?? '',
        last_pool_id: data?.last_pool_id,
        email: firebaseUser.email || '',
        wallet: '',
      };

      Sentry.setUser({ email: profile.email, username: profile.name, id: profile.id });

      return profile;
    };

    // Listen for changes on auth state (logged in, signed out, etc.)
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) setTypedStorageItem('user_id', user.uid);
      else clearTypedStorageItem('user_id');

      getUserWithProfile(user).then((user) => {
        setUser(user);
      });
    });

    return unsubscribe;
  }, []);

  const contextProvider: IWeb3AuthContext = {
    web3Auth: web3Auth,
    provider,
    signUp,
    signIn,
    signOut: logout,
    setChainId: setChainId,
    chainId,
    isAuthenticated: !!user,
    user,
    account,
    isInitialised,
  };

  return <Web3AuthContext.Provider value={contextProvider}>{children}</Web3AuthContext.Provider>;
};
