import { Button, Flex, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { useMatch, useResolvedPath } from 'react-router-dom';
import { IconBox } from '../Icons';
import { RouteInstance } from './Sidebar';

export const NavLinkButton = (prop: RouteInstance) => {
  const activeBg = useColorModeValue('white', 'gray.700');
  const inactiveBg = useColorModeValue('white', 'gray.700');
  const activeColor = useColorModeValue('gray.700', 'white');
  const inactiveColor = useColorModeValue('gray.400', 'gray.400');
  const sidebarActiveShadow = '0px 7px 11px rgba(0, 0, 0, 0.04)';

  const resolved = useResolvedPath(prop.path);
  const match = useMatch({ path: resolved.pathname, end: true });

  const boxShadow = match ? '0px 7px 11px rgba(0, 0, 0, 0.04)' : 'none';

  return (
    <Button
      boxSize="initial"
      justifyContent="flex-start"
      alignItems="center"
      boxShadow={sidebarActiveShadow}
      bg={match ? activeBg : 'transparent'}
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
        boxShadow: { boxShadow },
      }}
    >
      <Flex>
        {typeof prop.icon === 'string' ? (
          <Icon>{prop.icon}</Icon>
        ) : (
          <IconBox
            bg={match ? 'teal.300' : inactiveBg}
            color={match ? 'white' : 'teal.300'}
            h="30px"
            w="30px"
            me="12px"
          >
            {prop.icon}
          </IconBox>
        )}
        <Text color={match ? activeColor : inactiveColor} my="auto" fontSize="sm">
          {prop.name}
        </Text>
      </Flex>
    </Button>
  );
};
