import { Box, BoxProps, Tag, TagLabel, TagLeftIcon, useColorModeValue } from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import React from 'react';
import { BsCircleFill } from 'react-icons/bs';
import { networks } from '../data/networks';

interface ConnectedChainProps extends BoxProps {}

export const ConnectedChain = (props: ConnectedChainProps) => {
  const { chainId } = useWeb3React();
  const textcolor = useColorModeValue('gray.700', 'white');
  if (!chainId) return null;
  return (
    <Box {...props}>
      <Tag size="lg" variant="outline" colorScheme="green">
        <TagLeftIcon boxSize="12px" as={BsCircleFill} />
        <TagLabel color={textcolor}>{networks[chainId]?.chainName}</TagLabel>
      </Tag>
    </Box>
  );
};
