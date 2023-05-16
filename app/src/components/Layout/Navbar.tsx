import { HamburgerIcon } from '@chakra-ui/icons';
import { Flex, FlexProps, IconButton, Stack } from '@chakra-ui/react';
import { usePool } from '@pesabooks/hooks';
import { getMyPools } from '@pesabooks/services/poolsService';
import { Pool } from '@pesabooks/types';
import { useEffect, useState } from 'react';
import { ConnectedChain } from '../ConnectedChain';
import { NewTransactionMenu } from '../NewTransactionMenu';
import { AvatarMenu } from './AvatarMenu';
import { PoolSelectorMenu } from './PoolSelectorMenu';
interface NavBarProps extends FlexProps {
  onOpen?: () => void;
}

export const Navbar = ({ onOpen, ...flexProps }: NavBarProps) => {
  const { pool } = usePool();
  const [myPools, setMyPools] = useState<Pool[]>([]);

  useEffect(() => {
    getMyPools().then((pools) => setMyPools(pools));
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
      {...flexProps}
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
          {/* <WalletConnectDrawer /> */}
          <NewTransactionMenu />
          <ConnectedChain />
        </Flex>
        <AvatarMenu />
      </Stack>
    </Flex>
  );
};
