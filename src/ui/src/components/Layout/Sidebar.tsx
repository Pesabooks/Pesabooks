import { Box, BoxProps, CloseButton, Flex, Icon, Link, Stack } from '@chakra-ui/react';
import { FaExchangeAlt, FaHome, FaUsers } from 'react-icons/fa';
import { IoSettingsSharp } from 'react-icons/io5';
import { Link as reactRouterLink, NavLink } from 'react-router-dom';
import { Logo } from './Logo';
import { NavLinkButton } from './NavLinkButton';
import { Separator } from './Separator';
import { SidebarHelp } from './SidebarHelp';

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

export const Sidebar = ({ onClose, ...boxProps }: SidebarProps) => {
  // this is for the rest of the collapses
  let sidebarBg = 'none';
  let sidebarRadius = '0px';
  let sidebarMargins = '0px';
  sidebarRadius = '16px';
  sidebarMargins = '16px 0px 16px 16px';

  const createLinks = (routes: RouteInstance[]) => {
    return routes.map((prop, key) => {
      return (
        <NavLink key={key} to={prop.path} onClick={onClose}>
          <NavLinkButton {...prop} />
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
          <Logo />
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
        {createLinks(routes)}
      </Stack>
      <SidebarHelp></SidebarHelp>
    </Box>
  );
};

export interface RouteInstance {
  path: string;
  name: string;
  icon: any;
}

const routes = [
  {
    path: `./`,
    name: 'Dashboard',
    icon: <Icon as={FaHome} color="inherit" />,
  },
  {
    path: `./members`,
    name: 'Members',
    icon: <Icon as={FaUsers} color="inherit" />,
  },
  {
    path: `./transactions`,
    name: 'Transactions',
    icon: <Icon as={FaExchangeAlt} color="inherit" />,
  },
  {
    path: `./settings`,
    name: 'Settings',
    icon: <Icon as={IoSettingsSharp} color="inherit" />,
  },
];
