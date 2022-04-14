import {
  Box,
  BoxProps,
  Button,
  CloseButton,
  Flex,
  Icon,
  Link,
  Stack,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaExchangeAlt, FaHome, FaUsers } from 'react-icons/fa';
import { MdOutlineBubbleChart } from 'react-icons/md';
import { Link as reactRouterLink, NavLink, useLocation } from 'react-router-dom';
import { Network } from '../../data/networks';
import { usePool } from '../../hooks/usePool';
import { getNetwork } from '../../services/blockchainServices';
import { IconBox } from '../Icons';
import { Separator } from './Separator';
import { SidebarHelp } from './SidebarHelp';

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

export const Sidebar = ({ onClose, ...boxProps }: SidebarProps) => {
  // to check for active links and opened collapses
  let location = useLocation();

  // this is for the rest of the collapses
  let sidebarBg = 'none';
  let sidebarRadius = '0px';
  let sidebarMargins = '0px';
  sidebarRadius = '16px';
  sidebarMargins = '16px 0px 16px 16px';
  let activeBg = useColorModeValue('white', 'gray.700');
  let inactiveBg = useColorModeValue('white', 'gray.700');
  let activeColor = useColorModeValue('gray.700', 'white');
  let inactiveColor = useColorModeValue('gray.400', 'gray.400');
  let sidebarActiveShadow = '0px 7px 11px rgba(0, 0, 0, 0.04)';
  let {pool} = usePool();
  const [network, setNetwork] = useState<Network>();

  useEffect(() => {
    if (pool?.chain_id) {
      setNetwork(getNetwork(pool.chain_id));
    }
  }, [pool]);

  const activeRoute = (routeName: string) => {
    return location.pathname === routeName ? 'active' : '';
  };

  const createLinks = (routes: RouteInstance[]) => {
    // Chakra Color Mode

    return routes.map((prop, key) => {
      return (
        <NavLink key={key} to={prop.path} onClick={onClose}>
          {activeRoute(prop.path) === 'active' ? (
            <Button
              boxSize="initial"
              justifyContent="flex-start"
              alignItems="center"
              boxShadow={sidebarActiveShadow}
              bg={activeBg}
              mb={{
                xl: '12px',
              }}
              mx={{
                xl: 'auto',
              }}
              ps={{
                sm: '10px',
                xl: '16px',
              }}
              py="12px"
              borderRadius="15px"
              _hover={{}}
              w="100%"
              _active={{
                bg: 'inherit',
                transform: 'none',
                borderColor: 'transparent',
              }}
              _focus={{
                boxShadow: '0px 7px 11px rgba(0, 0, 0, 0.04)',
              }}
            >
              <Flex>
                {typeof prop.icon === 'string' ? (
                  <Icon>{prop.icon}</Icon>
                ) : (
                  <IconBox bg="teal.300" color="white" h="30px" w="30px" me="12px">
                    {prop.icon}
                  </IconBox>
                )}
                <Text color={activeColor} my="auto" fontSize="sm">
                  {prop.name}
                </Text>
              </Flex>
            </Button>
          ) : (
            <Button
              boxSize="initial"
              justifyContent="flex-start"
              alignItems="center"
              bg="transparent"
              mb={{
                xl: '12px',
              }}
              mx={{
                xl: 'auto',
              }}
              py="12px"
              ps={{
                sm: '10px',
                xl: '16px',
              }}
              borderRadius="15px"
              _hover={{}}
              w="100%"
              _active={{
                bg: 'inherit',
                transform: 'none',
                borderColor: 'transparent',
              }}
              _focus={{
                boxShadow: 'none',
              }}
            >
              <Flex>
                {typeof prop.icon === 'string' ? (
                  <Icon>{prop.icon}</Icon>
                ) : (
                  <IconBox bg={inactiveBg} color="teal.300" h="30px" w="30px" me="12px">
                    {prop.icon}
                  </IconBox>
                )}
                <Text color={inactiveColor} my="auto" fontSize="sm">
                  {prop.name}
                </Text>
              </Flex>
            </Button>
          )}
        </NavLink>
      );
    });
  };

  var brand = (
    <Box pt="10px" ps="16px" mb="8px">
      <Flex justifyContent="space-between">
        <Link
          variant="no-decoration"
          as={reactRouterLink}
          to="/"
          display="flex"
          lineHeight="100%"
          mb="30px"
          fontWeight="bold"
          justifyContent="start"
          alignItems="center"
          fontSize="11px"
        >
          <Icon as={MdOutlineBubbleChart} w="32px" h="32px" me="10px" />

          <Text fontSize="sm" mt="3px" casing="uppercase">
            Pesabooks
          </Text>
        </Link>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      <Separator></Separator>
    </Box>
  );

  return (
    <Box
      bg={sidebarBg}
      w="260px"
      maxW="260px"
      ms={{
        sm: '16px',
      }}
      my={{
        sm: '16px',
      }}
      h="calc(100vh - 32px)"
      ps="20px"
      pe="20px"
      m={sidebarMargins}
      borderRadius={sidebarRadius}
      position="fixed"
      {...boxProps}
    >
      <Box>{brand}</Box>

      <Stack direction="column" mb="40px">
        <Box>
          <>{createLinks(routes(`${pool?.id}`))}</>
        </Box>
      </Stack>
     {network?.isTest && <SidebarHelp></SidebarHelp>}
    </Box>
  );
};

interface RouteInstance {
  path: string;
  name: string;
  icon: any;
}

const routes = (pool_id: string | undefined): RouteInstance[] => [
  {
    path: `/pool/${pool_id}`,
    name: 'Dashboard',
    icon: <Icon as={FaHome} color="inherit" />,
  },
  {
    path: `/pool/${pool_id}/members`,
    name: 'Members',
    icon: <Icon as={FaUsers} color="inherit" />,
  },
  {
    path: `/pool/${pool_id}/transactions`,
    name: 'Transactions',
    icon: <Icon as={FaExchangeAlt} color="inherit" />,
  },
];
