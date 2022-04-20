import { WalletConnect } from '@web3-react/walletconnect';
import React from 'react';
import { walletConnect } from '../../connectors/walletConnect';
import { ConnectButton } from './ConnectButton';

interface WConnectWithWallentConnectProps {
  onConnect: (connector: WalletConnect) => void;
}
export const ConnectWithWallentConnect = ({ onConnect }: WConnectWithWallentConnectProps) => {
  return (
    <ConnectButton
      name="WalletConnect"
      description="Connect by scanning a QR code with any mobile wallet that supports wallet connect (i.e Trust, Argent, Rainbow + more)"
      onClick={() => onConnect(walletConnect)}
    />
  );
};
