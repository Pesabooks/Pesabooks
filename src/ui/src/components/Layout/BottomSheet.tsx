import { Flex } from '@chakra-ui/react';
import React from 'react';
import { usePool } from '../../hooks/usePool';
import { ConnectWalletButton } from '../Buttons/ConnectWalletButton';
import { DepositButton } from '../Buttons/DepositButton';
import { WithdrawButton } from '../Buttons/WithdrawButton';

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
      <DepositButton />
      <WithdrawButton />
      {pool && <ConnectWalletButton chainId={pool?.chain_id} />}
    </Flex>
  );
};
