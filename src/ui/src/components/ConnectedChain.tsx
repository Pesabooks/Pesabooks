import { Box, BoxProps } from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { ChainTag } from './ChainTag';

interface ConnectedChainProps extends BoxProps {}

export const ConnectedChain = (props: ConnectedChainProps) => {
  const { chainId } = useWeb3React();
  if (!chainId) return null;
  return (
    <Box {...props}>
      <ChainTag size="lg" variant="outline" chainId={chainId}/>
    </Box>
  );
};
