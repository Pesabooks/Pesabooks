import { MetaMask } from '@web3-react/metamask';
import { Connector } from '@web3-react/types';
import { WalletConnect } from '@web3-react/walletconnect';

export const getConnectorName = (connector: Connector) => {
  if (connector instanceof MetaMask) return 'MetaMask';
  if (connector instanceof WalletConnect) return 'WalletConnect';
  return 'Unknown';
};
