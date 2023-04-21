//@ts-nocheck
import WalletConnect from '@walletconnect/client';
import { IClientMeta, IWalletConnectSession } from '@walletconnect/legacy-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pool } from '../types';

type connectType = ({ uri, session }: { uri?: string; session?: IWalletConnectSession }) => void;

interface useWalletConnectV1Type {
  connector?: WalletConnect;
  clientData: IClientMeta | null;
  isConnected: boolean;
  connect: connectType;
  disconnect: () => Promise<void>;
  reject: (message: string) => void;
  txRequestPayload: any;
  onTxSumitted: () => void;
  functionName?: string;
}

export const useWalletConnectV1 = (pool: Pool): useWalletConnectV1Type => {
  const [connector, setConnector] = useState<WalletConnect | undefined>();
  const [clientData, setClientData] = useState<IClientMeta | null>(null);
  const [txRequestPayload, setTxRequestPayload] = useState<any>();
  const [functionName, setFunctionName] = useState<string>();

  const isConnected = connector?.connected === true;
  const localStorageSessionKey = useRef(`session_${pool.gnosis_safe_address}`);

  const onSessionRequest = useCallback(
    async (connector: WalletConnect, error, payload) => {
      if (error) {
        throw error;
      }
      console.log(payload);

      connector.approveSession({
        accounts: [pool!.gnosis_safe_address!],
        chainId: pool!.chain_id,
      });

      setClientData(payload.params[0].peerMeta);
      localStorage.setItem(localStorageSessionKey.current, JSON.stringify(connector.session));
    },
    [pool],
  );

  const onCallRequest = useCallback(async (connector: WalletConnect, error, payload) => {
    if (error) {
      throw error;
    }
    console.log(payload);

    if (payload.method === 'eth_sendTransaction') {
      setTxRequestPayload(payload);
    } else {
      connector.rejectRequest({
        id: payload.id,
        error: {
          message: 'Method not supported',
        },
      });
    }
  }, []);

  const connect: connectType = useCallback(async ({ uri, session }) => {
    const connector = new WalletConnect({
      // Required
      uri: uri,
      session: session,
      // Required
      clientMeta: {
        description: 'Pesabooks',
        url: 'www.pesabook.com',
        icons: ['https://walletconnect.org/walletconnect-logo.png'],
        name: 'Pesabooks App',
      },
    });
    setConnector(connector);
    if (connector.session?.connected) setClientData(connector.session.peerMeta);
  }, []);

  const disconnect = useCallback(async () => {
    setConnector(undefined);
    setClientData(null);
    setTxRequestPayload(undefined);
    localStorage.removeItem(localStorageSessionKey.current);
    try {
      await connector?.killSession();
    } catch (error) {
      console.log('Error trying to close WC session: ', error);
    }
  }, [connector]);

  useEffect(() => {
    if (connector) {
      connector.on('session_request', (error, payload) =>
        onSessionRequest(connector, error, payload),
      );
      connector.on('call_request', (error, payload) => onCallRequest(connector, error, payload));
      connector.on('disconnect', (error, payload) => {
        disconnect();
      });
    }
  }, [connector, onCallRequest, onSessionRequest, disconnect]);

  const reject = (message: string) => {
    connector?.rejectRequest({
      id: txRequestPayload.id,
      error: {
        message: message ?? 'Rejected by user',
      },
    });
    setTxRequestPayload(undefined);
  };

  const onTxSumitted = () => setTxRequestPayload(undefined);

  useEffect(() => {
    if (!connector) {
      const session = localStorage.getItem(localStorageSessionKey.current);
      if (session) {
        connect({ session: JSON.parse(session) });
      }
    }
  }, [connector, connect]);

  // useEffect(() => {
  //   if (!connector && uri) {
  //     connect({ uri });
  //   }
  // }, [connector, connect, uri]);

  useEffect(() => {
    const data: string = txRequestPayload?.params?.[0]?.data;
    if (data)
      fetch(`https://api.etherface.io/v1/signatures/hash/all/${data.substring(2, 10)}/1`, {
        method: 'GET',
      })
        .then((response) => response.text())
        .then((result) => {
          const resp = JSON.parse(result);
          const func = resp.items[0].text.split('(')[0];
          setFunctionName(func);
        })
        .catch((error) => {
          console.log('error', error);
          setFunctionName(undefined);
        });
    else setFunctionName(undefined);
  }, [txRequestPayload]);

  return {
    connector,
    clientData,
    isConnected,
    connect,
    disconnect,
    reject,
    txRequestPayload,
    onTxSumitted,
    functionName,
  };
};
