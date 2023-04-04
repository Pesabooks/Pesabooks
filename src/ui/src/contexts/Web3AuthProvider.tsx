import { Web3Provider } from '@ethersproject/providers';
import * as Sentry from '@sentry/react';
import {
  ADAPTER_EVENTS,
  CHAIN_NAMESPACES,
  CONNECTED_EVENT_DATA,
  CustomChainConfig,
  UserInfo,
  WALLET_ADAPTERS
} from '@web3auth/base';
import { Web3AuthNoModal } from '@web3auth/no-modal';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import React, { useCallback, useEffect, useState } from 'react';
import { networks } from '../data/networks';
import { usersTable } from '../supabase';
import { User } from '../types';
import { clearTypedStorageItem, setTypedStorageItem } from '../utils/storage-utils';

export interface IWeb3AuthContext {
  web3Auth: Web3AuthNoModal | null;
  account: string | null;
  provider: Web3Provider | null;
  isInitialised: boolean;
  user: User | null | undefined;
  chainId: number;
  signOut: () => Promise<void>;
  signIn: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  setChainId: (chainId: number) => void;
  updateProfile: (name: string) => Promise<void>;
  setUser: (user: User) => void;
}

const web3AuthClientId = process.env.REACT_APP_WEB3AUTH_CLIENT_ID ?? '';
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

const getIdFromUser = (user: UserInfo) => `${user.verifier}:${user.verifierId}`;

export const Web3AuthProvider = ({ children }: any) => {
  const [web3Auth, setWeb3Auth] = useState<Web3AuthNoModal | null>(null);
  const [provider, setProvider] = useState<Web3Provider | null>(null);
  const [chainId, setChainId] = useState<number>(defaultChain);
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isInitialised, setIsInitialised] = useState(false);

  const configureUser = useCallback(async (user: UserInfo | null) => {
    if (!user) {
      Sentry.configureScope((scope) => scope.setUser(null));
      setUser(null);
      return null;
    }
    const id = getIdFromUser(user);

    Sentry.setUser({
      email: user.email!,
      id,
    });
    let { data } = await usersTable().select(`*`).eq('id', id).single();
    if (data) setUser(data);
  }, []);

  useEffect(() => {
    const subscribeAuthEvents = (web3auth: Web3AuthNoModal) => {
      web3auth.on(ADAPTER_EVENTS.CONNECTED, async (data: CONNECTED_EVENT_DATA) => {
        console.log('connected');
        setProvider(new Web3Provider(web3auth.provider!));

        const user = await web3auth.getUserInfo();
        configureUser(user as UserInfo);
        setTypedStorageItem('user_id', getIdFromUser(user as UserInfo));
      });

      web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
        console.log('disconnected');
        clearTypedStorageItem('supabase_access_token');
        setProvider(null);
        configureUser(null);
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
        const web3AuthInstance: Web3AuthNoModal = new Web3AuthNoModal({
          clientId: web3AuthClientId,
          chainConfig: currentChainConfig,
          enableLogging: web3AuthNetwork === 'testnet',
        });

        subscribeAuthEvents(web3AuthInstance);

        const adapter = new OpenloginAdapter({
          //loginSettings: { mfaLevel: 'none' },
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
              // theme: { primary: '4FD1C5' },
              // defaultLanguage: 'en',
            },
          },
        });
        web3AuthInstance.configureAdapter(adapter);

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
  }, [chainId, configureUser]);

  const signIn = async (email: string) => {
    if (!web3Auth) {
      throw new Error('web3auth not initialized yet');
    }
    if (web3Auth.status === 'connected') {
      await web3Auth.logout();
    }

    //await web3Auth.connect();

    await web3Auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
      loginProvider: 'email_passwordless',
      login_hint: email,
    });
  };

  const logout = async () => {
    if (!web3Auth) {
      return;
    }
    await web3Auth.logout();
    clearTypedStorageItem('supabase_access_token');
    setProvider(null);
    configureUser(null);
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
    if (user) setUser({ ...user, username: username });
  };

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
