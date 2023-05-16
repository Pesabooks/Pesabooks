import { Box, BoxProps } from '@chakra-ui/react';
import { useWeb3Auth } from '@pesabooks/hooks';
import { ChainTag } from './ChainTag';

type ConnectedChainProps = BoxProps;

export const ConnectedChain = (props: ConnectedChainProps) => {
  const { chainId } = useWeb3Auth();

  if (!chainId) return null;
  return (
    <Box {...props}>
      <ChainTag size="lg" variant="outline" chainId={chainId} />
    </Box>
  );
};
