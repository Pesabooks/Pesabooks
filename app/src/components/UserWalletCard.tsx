import { Avatar, Flex, Text } from '@chakra-ui/react';
import { shortenHash } from '@pesabooks/utils/addresses-utils';
import { User } from '../types';

export const UserWalletCard = ({ user }: { user: User | undefined }) => {
  return (
    <Flex align="center">
      <Avatar size={'sm'} name={user?.username ?? undefined} mr={2} />
      <Flex direction="column">
        <Text fontSize="sm" fontWeight="bold">
          {user?.username}
        </Text>
        <Text fontSize="sm">{user ? shortenHash(user?.wallet) : null}</Text>
      </Flex>
    </Flex>
  );
};
