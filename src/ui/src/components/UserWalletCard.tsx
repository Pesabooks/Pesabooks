import { Avatar, Flex, Text } from '@chakra-ui/react';
import React from 'react';
import { AddressLookup } from '../types';
import { shortenHash } from '../utils';

export const UserWalletCard = ({ addressLookup }: { addressLookup: AddressLookup | undefined }) => {
  return (
    <Flex align="center">
      <Avatar size={'sm'} name={addressLookup?.name} mr={2} />
      <Flex direction="column">
        <Text fontSize='sm' fontWeight="bold">{addressLookup?.name}</Text>
        <Text fontSize="sm">{addressLookup ? shortenHash(addressLookup?.address) : null}</Text>
      </Flex>
    </Flex>
  );
};
