import { Flex, Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { AvatarMenu } from './AvatarMenu';
import { Logo } from './Logo';

export const NavbarLight = ({ theme }: { theme?: 'light' | 'dark' }) => {
  return (
    <Flex h={20} alignItems={'center'} justifyContent={'space-between'} pb="8px" px={30} pt="8px">
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
        <Logo theme={theme} />
      </Link>

      <AvatarMenu />
    </Flex>
  );
};
