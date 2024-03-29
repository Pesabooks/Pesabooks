import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
  Spacer,
  Text,
  VStack,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { useWeb3Auth } from '@pesabooks/hooks';
import { shortenHash } from '@pesabooks/utils/addresses-utils';
import { FiChevronDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { WalletAddress } from '../WalletAddress';

export const AvatarMenu = () => {
  const { toggleColorMode } = useColorMode();
  const { account, chainId, signOut, user } = useWeb3Auth();
  const navigate = useNavigate();

  const onSignout = () => {
    signOut?.();
  };

  const txtColor = useColorModeValue('black', 'white');

  return (
    <Menu>
      <MenuButton
        p={0}
        as={Button}
        rounded="full"
        variant="ghost"
        cursor={'pointer'}
        minW={0}
        color={txtColor}
      >
        <HStack>
          <Avatar size={'sm'} name={user?.username ?? undefined} />
          <VStack
            display={{ base: 'none', md: 'flex' }}
            alignItems="flex-start"
            spacing="1px"
            ml="2"
          >
            <Text fontSize="sm">{user?.username}</Text>
            <Text fontSize="xs">{user?.wallet && shortenHash(user?.wallet)}</Text>
          </VStack>
          <Box display={{ base: 'none', md: 'flex' }}>
            <FiChevronDown />
          </Box>
        </HStack>
      </MenuButton>
      <Portal>
        <MenuList m={0} alignItems={'center'}>
          <Center flexDirection="column">
            <p>{user?.username}</p>
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
