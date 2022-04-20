import { HamburgerIcon } from '@chakra-ui/icons';
import { Flex, FlexProps, IconButton, Stack } from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { usePool } from '../../hooks/usePool';
import { getMyPools } from '../../services/poolsService';
import { Pool } from '../../types';
import { ConnectWalletButton } from '../Buttons/ConnectWalletButton';
import { DepositButton } from '../Buttons/DepositButton';
import { WithdrawButton } from '../Buttons/WithdrawButton';
import { ConnectedChain } from '../ConnectedChain';
import { AvatarMenu } from './AvatarMenu';
import { PoolSelectorMenu } from './PoolSelectorMenu';
interface NavBarProps extends FlexProps {
  onOpen?: () => void;
}

export const Navbar = ({ onOpen, ...flexProps }: NavBarProps) => {
  const { pool } = usePool();
  const { isActive, chainId: connectedChainId } = useWeb3React();
  const [myPools, setMyPools] = useState<Pool[]>([]);

  useEffect(() => {
    getMyPools().then((pools) => setMyPools(pools ?? []));
  }, []);

  return (
    <Flex
      h={20}
      alignItems={'center'}
      justifyContent={'space-between'}
      pb="8px"
      right="30px"
      px={{
        sm: '30px',
        md: '30px',
      }}
      ps={{
        xl: '12px',
      }}
      pt="8px"
      w={{ sm: 'calc(100vw - 30px)', xl: 'calc(100vw - 75px - 275px)' }}
    >
      <IconButton
        display={{ sm: 'flex', xl: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<HamburgerIcon />}
      />
      <PoolSelectorMenu pool={pool} pools={myPools} />

      <Stack direction={'row'} spacing={7}>
        <Flex gap={7} display={{ sm: 'none', xl: 'flex' }} alignItems="center">
          <DepositButton />
          <WithdrawButton />
          {pool && <ConnectWalletButton chainId={pool.chain_id} />}
          {isActive && pool?.chain_id === connectedChainId && <ConnectedChain />}
        </Flex>
        <AvatarMenu />
      </Stack>
    </Flex>
  );
};
