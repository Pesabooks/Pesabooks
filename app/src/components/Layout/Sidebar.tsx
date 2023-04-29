import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  BoxProps,
  CloseButton,
  Flex,
  HStack,
  Icon,
  Link,
  List,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { BsGraphDown } from 'react-icons/bs';
import { FaCircle, FaExchangeAlt, FaHome, FaUsers } from 'react-icons/fa';
import { IoSettingsSharp } from 'react-icons/io5';
import { Link as reactRouterLink, NavLink, useLocation } from 'react-router-dom';
import { IconBox } from '../Icons';
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

  let location = useLocation();
  const activeRoute = (routeName: string) => {
    return location.pathname.includes(routeName);
  };
  let variantChange = '0.2s linear';

  let activeBg = useColorModeValue('teal.300', 'teal.300');
  let activeAccordionBg = useColorModeValue('white', 'gray.700');
  let inactiveBg = useColorModeValue('white', 'gray.700');
  let inactiveColorIcon = useColorModeValue('teal.300', 'teal.300');
  let activeColorIcon = useColorModeValue('white', 'white');
  let activeColor = useColorModeValue('gray.700', 'white');
  let inactiveColor = useColorModeValue('gray.400', 'gray.400');

  const createLinks = (routes: RouteInstance[]) => {
    return routes.map((prop, key) => {
      if (prop.collapse) {
        return (
          <Accordion allowToggle key={key}>
            <AccordionItem border="none">
              <AccordionButton
                display="flex"
                //align="center"
                //justify="center"
                key={key}
                borderRadius="15px"
                _focus={{ boxShadow: 'none' }}
                _hover={{ boxShadow: 'none' }}
                bg={activeRoute(prop.path) && prop.icon ? activeAccordionBg : 'transparent'}
              >
                {activeRoute(prop.path) ? (
                  <Box
                    as="button"
                    boxSize="initial"
                    justifyContent="flex-start"
                    alignItems="center"
                    bg="transparent"
                    transition={variantChange}
                    mx={{
                      xl: 'auto',
                    }}
                    px="0px"
                    borderRadius="15px"
                    _hover={{}}
                    w="100%"
                    _active={{
                      bg: 'inherit',
                      transform: 'none',
                      borderColor: 'transparent',
                    }}
                  >
                    {prop.icon ? (
                      <Flex>
                        <IconBox
                          bg={activeBg}
                          color={activeColorIcon}
                          h="30px"
                          w="30px"
                          me="12px"
                          transition={variantChange}
                        >
                          {prop.icon}
                        </IconBox>
                        <Text color={activeColor} my="auto" fontSize="sm" display={'block'}>
                          {prop.name}
                        </Text>
                      </Flex>
                    ) : (
                      <HStack spacing={'22px'} ps="10px" ms="0px">
                        <Icon as={FaCircle} w="10px" color="teal.300" />
                        <Text color={activeColor} my="auto" fontSize="sm">
                          {prop.name}
                        </Text>
                      </HStack>
                    )}
                  </Box>
                ) : (
                  <Box
                    as="button"
                    boxSize="initial"
                    justifyContent="flex-start"
                    alignItems="center"
                    bg="transparent"
                    mx={{
                      xl: 'auto',
                    }}
                    px="0px"
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
                    {prop.icon ? (
                      <Flex>
                        <IconBox
                          bg={inactiveBg}
                          color={inactiveColorIcon}
                          h="30px"
                          w="30px"
                          me="12px"
                          transition={variantChange}
                        >
                          {prop.icon}
                        </IconBox>
                        <Text color={inactiveColor} my="auto" fontSize="sm">
                          {prop.name}
                        </Text>
                      </Flex>
                    ) : (
                      <HStack spacing={'26px'} ps={'10px'} ms={'0px'}>
                        <Icon as={FaCircle} w="6px" color="teal.300" />
                        <Text color={inactiveColor} my="auto" fontSize="md" fontWeight="normal">
                          {prop.name}
                        </Text>
                      </HStack>
                    )}
                  </Box>
                )}
                <AccordionIcon color="gray.400" />
              </AccordionButton>
              <AccordionPanel pb="8px">
                <List>
                  {
                    createLinks(prop.items!) // for bullet accordion links
                  }
                </List>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        );
      } else {
        return (
          <NavLink key={key} to={prop.path} onClick={onClose}>
            <NavLinkButton {...prop} />
          </NavLink>
        );
      }
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

  var links = <>{createLinks(routes)}</>;
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
        {links}
      </Stack>
      <SidebarHelp></SidebarHelp>
    </Box>
  );
};

export interface RouteInstance {
  path: string;
  name: string;
  icon: any;
  collapse?: boolean;
  items?: RouteInstance[];
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
  {
    path: 'reports',
    name: 'Reports',
    icon: <Icon as={BsGraphDown} color="inherit" />,
    collapse: true,
    items: [
      {
        path: `./reports/total-deposit-per-user`,
        name: 'Deposit per user',
        icon: <Icon as={IoSettingsSharp} color="inherit" />,
      },
    ],
  },
];
