import { ExternalLinkIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  Link,
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
import { useWeb3React } from '@web3-react/core';
import React, { useEffect, useState } from 'react';
import { getConnectorName } from '../../connectors';
import { Network } from '../../data/networks';
import { useAuth } from '../../hooks/useAuth';
import { getNetwork } from '../../services/blockchainServices';
import { shortenAddress } from '../../utils';

export const AvatarMenu = () => {
  const { toggleColorMode } = useColorMode();
  const { user, signOut } = useAuth();
  const { account, connector, chainId } = useWeb3React();
  const [netWork, setNetWork] = useState<Network>();

  useEffect(() => {
    if (chainId) {
      setNetWork(getNetwork(chainId));
    }
  }, [chainId]);

  return (
    <Menu>
      <MenuButton as={Button} rounded={'full'} variant={'link'} cursor={'pointer'} minW={0}>
        <Avatar size={'sm'} name={user?.name} />
      </MenuButton>
      <Portal>
        <MenuList m={0} alignItems={'center'}>
          <Center flexDirection="column">
            <p>{user?.name}</p>
            {account && (
              <Link isExternal href={netWork?.blockExplorerUrls[0] + 'address/' + account}>
                <Avatar bg="white"
                  size="xs"
                  src={`${process.env.PUBLIC_URL}/images/wallet/${getConnectorName(connector)}.png`}
                />{' '}
                {shortenAddress(account)}
                <ExternalLinkIcon mx="3px" />
              </Link>
            )}
          </Center>

          <MenuDivider />
          {account && (
            <MenuItem onClick={() => connector.deactivate()}> Disconnect Wallet</MenuItem>
          )}
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
      </Portal>
    </Menu>
  );
};
