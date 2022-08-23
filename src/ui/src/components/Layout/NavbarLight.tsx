import { Flex, Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { AvatarMenu } from './AvatarMenu';
import { Logo } from './Logo';

export const NavbarLight = () => {
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
      <Link
        variant="no-decoration"
        as={RouterLink}
        to="/"
        display="flex"
        fontWeight="bold"
        justifyContent="start"
        alignItems="center"
        fontSize="11px"
      >
        <Logo />
      </Link>

      <AvatarMenu />
    </Flex>
  );
};
