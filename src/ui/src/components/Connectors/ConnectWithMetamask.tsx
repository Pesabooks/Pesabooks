import { MetaMask } from '@web3-react/metamask';
import React from 'react';
import { metaMask } from '../../connectors/metaMask';
import { ConnectButton } from './ConnectButton';

interface ConnectWithMetamaskProps {
  onConnect: (connector: MetaMask) => void;
}
export const ConnectWithMetamask = ({ onConnect }: ConnectWithMetamaskProps) => {
  return (
    <ConnectButton
      name="Metamask"
      description="Connect using a browser plugin or mobile app. Best supported on Chrome or Firefox."
      onClick={() => onConnect(metaMask)}
    />
  );
};
