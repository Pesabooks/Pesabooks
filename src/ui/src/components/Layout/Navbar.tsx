import { HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  FlexProps,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spacer,
  Stack,
  Text,
  useColorMode
} from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePool } from '../../hooks/usePool';
import { getMyPools } from '../../services/poolsService';
import { Pool } from '../../types';
import { ConnectWalletButton } from '../Buttons/ConnectWalletButton';
import { DepositButton } from '../Buttons/DepositButton';
import { WithdrawButton } from '../Buttons/WithdrawButton';
import { ConnectedChain } from '../ConnectedChain';
import { PoolSelectorMenu } from './PoolSelectorMenu';
interface NavBarProps extends FlexProps {
  onOpen?: () => void;
}

export const Navbar = ({ onOpen, ...flexProps }: NavBarProps) => {
  const { toggleColorMode } = useColorMode();
  const { pool } = usePool();
  const { user, signOut } = useAuth();
  const web3 = useWeb3React();
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
          {!web3.active && pool && <ConnectWalletButton chainId={pool.chain_id} />}
          {web3.active && pool && <ConnectedChain />}
        </Flex>
        <Menu>
          <MenuButton as={Button} rounded={'full'} variant={'link'} cursor={'pointer'} minW={0}>
            <Avatar size={'sm'} name={user?.name} />
          </MenuButton>
          <MenuList alignItems={'center'}>
            <br />
            <Center flexDirection="column">
              <p>{user?.name}</p>
              {web3.account && (
                <p>
                  {web3.account.substring(0, 4)}...
                  {web3.account.substring(web3.account.length - 4)}
                </p>
              )}
            </Center>
            <br />
            <MenuDivider />
            <MenuItem onClick={toggleColorMode} w="100%">
              <Flex w="100%">
                <Box>
                  <Text>Color Mode</Text>
                </Box>
                <Spacer></Spacer>
                <Box>
                  {' '}
                  <MoonIcon /> | <SunIcon />
                </Box>
              </Flex>
            </MenuItem>
            <MenuItem onClick={signOut}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </Stack>
    </Flex>
  );
};
