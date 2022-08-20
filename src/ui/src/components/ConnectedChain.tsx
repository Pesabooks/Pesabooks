import { Box, BoxProps } from '@chakra-ui/react';
import { useWeb3Auth } from '../hooks/useWeb3Auth';
import { ChainTag } from './ChainTag';

interface ConnectedChainProps extends BoxProps {}

export const ConnectedChain = (props: ConnectedChainProps) => {
  const { chainId } = useWeb3Auth();
  
  if (!chainId) return null;
  return (
    <Box {...props}>
      <ChainTag size="lg" variant="outline" chainId={chainId} />
    </Box> 
  );
};
