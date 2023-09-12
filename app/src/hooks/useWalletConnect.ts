import { useToast } from '@chakra-ui/react';
import { Pool } from '@pesabooks/types';
import { createWeb3Wallet, pair, web3wallet } from '@pesabooks/utils/wallet-connect';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';
import { Web3WalletTypes } from '@walletconnect/web3wallet';
import { useCallback, useEffect, useState } from 'react';

type connectType = (uri: string) => Promise<void>;
export type WalletConnectTransactionRequest = {
  id: number;
  topic: string;
  method: string;
  payload: any;
  peerMetadata?: SignClientTypes.Metadata;
  functionName?: string;
};
interface useWalletConnectType {
  connect: connectType;
  disconnect: (topic: string) => Promise<void>;
  rejectTransactionRequest: (id: number, topic: string) => Promise<void>;
  txRequest?: WalletConnectTransactionRequest;
  onTxSumitted: () => void;
  functionName?: string;
  connecting: boolean;
  sessions: SessionTypes.Struct[];
}

export const useWalletConnect = (pool: Pool): useWalletConnectType => {
  const [initialized, setInitialized] = useState(false);

  const [txRequest, setTxRequest] = useState<WalletConnectTransactionRequest>();
  const [functionName, setFunctionName] = useState<string>();
  const [connecting, setConnecting] = useState(false);
  const [sessions, setSessions] = useState<SessionTypes.Struct[]>([]);
  const toast = useToast();

  useEffect(() => {
    if (!initialized) {
      createWeb3Wallet().then(() => {
        setInitialized(true);
      });
    }
  }, [initialized]);

  const onSessionApproval = useCallback(async (proposal: Web3WalletTypes.SessionProposal) => {
    setConnecting(true);

    try {
      const { id, params } = proposal;
      const { requiredNamespaces } = params;

      // reject if it is not the right chain
      if (
        !requiredNamespaces.eip155.chains ||
        requiredNamespaces.eip155.chains[0] !== `eip155:${pool.chain_id}`
      ) {
        web3wallet.rejectSession({
          id,
          reason: getSdkError('USER_REJECTED_CHAINS'),
        });
        toast({
          status: 'error',
          title: 'Wrong network',
          description: `Please switch network on the dapps`,
        });
        return;
      }

      const namespaces: SessionTypes.Namespaces = {};
      Object.keys(requiredNamespaces).forEach((key) => {
        const accounts: string[] = [];
        requiredNamespaces[key].chains?.map((chain) => {
          accounts.push(`${chain}:${pool.gnosis_safe_address}`);
        });
        namespaces[key] = {
          accounts,
          methods: requiredNamespaces[key].methods,
          events: requiredNamespaces[key].events,
        };
      });

      const session = await web3wallet.approveSession({
        id: proposal.id,
        namespaces,
      });

      setSessions(Object.values(web3wallet?.getActiveSessions() ?? []));

      toast({
        status: 'success',
        description: `Connected to ${session?.peer.metadata.name ?? 'walletConnect'}`,
      });
    } finally {
      setConnecting(false);
    }
  }, []);

  const onSessionRequest = useCallback(async (args: Web3WalletTypes.SessionRequest) => {
    console.log('onSessionRequest', args);
    const {
      params: { request },
      id,
      topic,
    } = args;

    const requestSession = web3wallet.engine.signClient.session.get(topic);

    if (request.method === 'eth_sendTransaction') {
      setTxRequest({
        id,
        topic,
        method: request.method,
        payload: request.params[0],
        peerMetadata: requestSession?.peer.metadata,
        functionName,
      });
    } else {
      web3wallet?.rejectSession({
        id: id,
        reason: getSdkError('UNSUPPORTED_METHODS'),
      });
    }
  }, []);

  const onSessionDelete = useCallback(async (args: Web3WalletTypes.SessionDelete) => {
    disconnect(args.topic).then(() => {
      setSessions(Object.values(web3wallet?.getActiveSessions() ?? []));
    });
  }, []);

  const disconnect = async (topic: string) => {
    setTxRequest(undefined);

    await web3wallet?.disconnectSession({
      topic,
      reason: getSdkError('USER_DISCONNECTED'),
    });
    const session = web3wallet.engine.signClient.session.get(topic);

    toast({
      status: 'info',
      description: `Disconnected from ${session?.peer.metadata.name ?? 'walletConnect'}`,
    });

    setSessions(Object.values(web3wallet?.getActiveSessions() ?? []));
  };

  useEffect(() => {
    if (initialized) {
      setSessions(Object.values(web3wallet?.getActiveSessions() ?? []));

      web3wallet.on('session_proposal', onSessionApproval);
      web3wallet.on('session_request', onSessionRequest);
      web3wallet.on('session_delete', onSessionDelete);

      // cleanup
      return () => {
        web3wallet.off('session_proposal', onSessionApproval);
        web3wallet.off('session_request', onSessionRequest);
        web3wallet.off('session_delete', onSessionDelete);
      };
    }
  }, [initialized, onSessionApproval, onSessionRequest]);

  const connect: connectType = async (uri) => {
    await pair({ uri });
  };

  const rejectTransactionRequest = async (id: number, topic: string) => {
    const response = {
      id,
      error: {
        code: 5000,
        message: 'User rejected.',
      },
      jsonrpc: '2.0',
    };

    await web3wallet.respondSessionRequest({ topic, response });

    setTxRequest(undefined);
  };

  const onTxSumitted = () => setTxRequest(undefined);

  useEffect(() => {
    const data = txRequest?.payload.data;
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
  }, [txRequest]);

  return {
    connect,
    disconnect,
    rejectTransactionRequest,
    txRequest,
    onTxSumitted,
    functionName,
    connecting,
    sessions,
  };
};
