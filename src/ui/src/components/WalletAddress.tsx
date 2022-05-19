import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Link, Text, useClipboard } from '@chakra-ui/react';
import React from 'react';
import { MdContentCopy } from 'react-icons/md';
import { networks } from '../data/networks';
import { shortenAddress } from '../utils';

interface WalletAddressProps {
  chainId: number;
  address: string;
}
export const WalletAddress = ({ chainId, address }: WalletAddressProps) => {
  const { onCopy } = useClipboard(address);

  return (
    <Flex direction="row" alignItems="center">
      <Text>{shortenAddress(address)}</Text>
      <IconButton
        onClick={onCopy}
        variant="ghost"
        aria-label="Call Sage"
        size="sm"
        icon={<MdContentCopy />}
      />
      <Link isExternal href={networks[chainId]?.blockExplorerUrls[0] + 'address/' + address}>
        <ExternalLinkIcon />
      </Link>
    </Flex>
  );
};
