import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
  Spacer,
  Text,
  useColorMode
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useWeb3Auth } from '../../hooks/useWeb3Auth';
import { WalletAddress } from '../WalletAddress';

export const AvatarMenu = () => {
  const { toggleColorMode } = useColorMode();
  const { account, chainId,signOut,user } = useWeb3Auth();
  const navigate = useNavigate();
 

  const onSignout = () => {
    signOut?.().finally(() => {
      navigate('/auth/signin');
    });
  };

  return (
    <Menu>
      <MenuButton as={Button} rounded={'full'} variant={'link'} cursor={'pointer'} minW={0}>
        <Avatar size={'sm'} name={user?.name} />
      </MenuButton>
      <Portal>
        <MenuList m={0} alignItems={'center'}>
          <Center flexDirection="column">
            <p>{user?.email}</p>
            {account && <WalletAddress chainId={chainId} address={account} type="address" />}
          </Center>

          <MenuDivider />

          <MenuItem onClick={() => navigate('/wallet')}> My Wallet</MenuItem>
          {/* <MenuItem onClick={() => navigate('/profile')}> My Profile</MenuItem> */}

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
          <MenuItem onClick={onSignout}>Sign Out</MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};
