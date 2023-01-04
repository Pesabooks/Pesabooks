import { Avatar, Flex, Text } from '@chakra-ui/react';
import { User } from '../types';
import { shortenHash } from '../utils';

export const UserWalletCard = ({ user }: { user: User | undefined }) => {
  return (
    <Flex align="center">
      <Avatar size={'sm'} name={user?.username} mr={2} />
      <Flex direction="column">
        <Text fontSize="sm" fontWeight="bold">
          {user?.username}
        </Text>
        <Text fontSize="sm">{user ? shortenHash(user?.wallet) : null}</Text>
      </Flex>
    </Flex>
  );
};
