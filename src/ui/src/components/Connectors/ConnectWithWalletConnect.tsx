import { WalletConnect } from '@web3-react/walletconnect';
import React from 'react';
import { walletConnect } from '../../connectors/walletConnect';
import { ConnectButton } from './ConnectButton';

interface WConnectWithWalletConnectProps {
  onConnect: (connector: WalletConnect) => void;
}
export const ConnectWithWalletConnect = ({ onConnect }: WConnectWithWalletConnectProps) => {
  return (
    <ConnectButton
      name="WalletConnect"
      description="Connect by scanning a QR code with any mobile wallet that supports wallet connect (i.e Trust, Argent, Rainbow + more)"
      onClick={() => onConnect(walletConnect)}
    />
  );
};
