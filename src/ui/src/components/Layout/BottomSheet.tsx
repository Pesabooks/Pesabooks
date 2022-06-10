import { Flex } from '@chakra-ui/react';
import React from 'react';
import { usePool } from '../../hooks/usePool';
import { ConnectWalletButton } from '../Buttons/ConnectWalletButton';
import { NewTransactionMenu } from '../NewTransactionMenu';

export const BottomSheet = () => {
  const { pool } = usePool();
  return (
    <Flex
      align="center"
      justify="center"
      width="100%"
      position="fixed"
      p="2"
      bg="teal"
      bottom="0px"
      gap={2}
      display={{ sm: 'flex', xl: 'none' }}
    >
      <NewTransactionMenu />
      {pool && <ConnectWalletButton chainId={pool?.chain_id} />}
    </Flex>
  );
};
