import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Link } from '@chakra-ui/react';
import React from 'react';
import { networks } from '../data/networks';
import { shortenAddress } from '../utils';

interface WalletAddressProps {
  chainId: number;
  address: string;
}
export const WalletAddress = ({ chainId, address }: WalletAddressProps) => {
  return (
    <Link isExternal href={networks[chainId]?.blockExplorerUrls[0] + 'address/' + address}>
      {shortenAddress(address)}
      <ExternalLinkIcon mx="3px" />
    </Link>
  );
};
