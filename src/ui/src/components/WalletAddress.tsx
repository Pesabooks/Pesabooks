import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Link, Text, useClipboard } from '@chakra-ui/react';
import React from 'react';
import { MdContentCopy } from 'react-icons/md';
import { networks } from '../data/networks';
import { shortenHash } from '../utils';

interface WalletAddressProps {
  chainId: number;
  address: string;
  type: 'address' | 'tx';
}
export const WalletAddress = ({ chainId, address, type }: WalletAddressProps) => {
  const { onCopy } = useClipboard(address);

  return (
    <Flex direction="row" alignItems="center">
      <Text>{shortenHash(address)}</Text>
      <IconButton
        onClick={onCopy}
        variant="ghost"
        aria-label="Call Sage"
        size="sm"
        icon={<MdContentCopy />}
      />
      <Link isExternal href={networks[chainId]?.blockExplorerUrls[0] + type + '/' + address}>
        <ExternalLinkIcon />
      </Link>
    </Flex>
  );
};
