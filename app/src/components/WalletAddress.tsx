import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Link, Text, useClipboard } from '@chakra-ui/react';
import { shortenHash } from '@pesabooks/utils/addresses-utils';
import { MdContentCopy } from 'react-icons/md';
import { networks } from '../data/networks';

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
      <Link isExternal href={networks[chainId]?.blockExplorerUrl + type + '/' + address}>
        <ExternalLinkIcon />
      </Link>
    </Flex>
  );
};
