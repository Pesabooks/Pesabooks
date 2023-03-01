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
  onAuthStateChanged,
  signInWithEmailLink,
  signOut as FirebaseSignOut,
  updateProfile as FirebaseUpdateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import React, { useCallback, useEffect, useState } from 'react';
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
  signIn: (email: string, emailLink: string) => Promise<void>;
  isAuthenticated: boolean;
  setChainId: (chainId: number) => void;
  updateProfile: (name: string) => Promise<void>;
  setUser: (user: User) => void;
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
  signOut: async () => {},
  setChainId: async () => {},
  updateProfile: async () => {},
  isAuthenticated: false,
  chainId: defaultChain,
  setUser: () => {},
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
            whiteLabel: {
              name: 'Pesabooks',
              logoLight: 'https://pesabooks.com/assets/img/icon.png',
              logoDark: 'https://pesabooks.com/assets/img/icon.png',
              dark: true,
              theme: { primary: '4FD1C5' },
            },
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

  const signIn = async (email: string, emailLink: string) => {
    // log in firebase
    const { user } = await signInWithEmailLink(firebaseAuth, email, emailLink);
    const fbIdtoken = await user.getIdToken();

    await web3Login(fbIdtoken);
  };

  const web3Login = async (jwtToken: string) => {
    if (!web3Auth) {
      throw new Error('web3auth not initialized yet');
    }
    if (web3Auth.status === 'connected') {
      await web3Auth.logout();
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
      return;
    }

    await FirebaseSignOut(firebaseAuth);
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

  const updateProfile = async (username: string) => {
    const currentUser = firebaseAuth.currentUser;
    if (currentUser) {
      await FirebaseUpdateProfile(currentUser, { displayName: username });
    }
    if (user) setUser({ ...user, username: username });
  };

  const configureUser = useCallback(async (firebaseUser: FirebaseUser | undefined | null) => {
    if (!firebaseUser) {
      Sentry.configureScope((scope) => scope.setUser(null));
      setUser(null);
      return null;
    }

    Sentry.setUser({
      email: firebaseUser.email!,
      username: firebaseUser?.displayName ?? ' ',
      id: firebaseUser.uid,
    });
    let { data } = await usersTable().select(`*`).eq('id', firebaseUser.uid).single();
    if (data) setUser(data);
  }, []);

  useEffect(() => {
    // Listen for changes on auth state (logged in, signed out, etc.)
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      configureUser(user);

      if (user) setTypedStorageItem('user_id', user.uid);
      else {
        clearTypedStorageItem('user_id');
        if (web3Auth?.status === 'connected') {
          web3Auth?.logout().then();
        }

        clearTypedStorageItem('supabase_access_token');
        setProvider(null);
      }
    });

    return unsubscribe;
  }, [configureUser, web3Auth]);

  const contextProvider: IWeb3AuthContext = {
    web3Auth: web3Auth,
    provider,
    signIn,
    signOut: logout,
    setChainId: setChainId,
    chainId,
    isAuthenticated: web3Auth?.status === 'connected',
    user,
    account,
    isInitialised,
    updateProfile,
    setUser: setUser,
  };

  return <Web3AuthContext.Provider value={contextProvider}>{children}</Web3AuthContext.Provider>;
};
