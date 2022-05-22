import { DeleteIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Spacer, Text, Tooltip, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { WalletAddress } from '../../../components/WalletAddress';
import { withConnectedWallet } from '../../../components/withConnectedWallet';
import { AddressLookup } from '../../../types';

interface AdminsListProps {
  admins: AddressLookup[];
  remove: (address: AddressLookup) => void;
}
export const AdminsList = ({ admins, remove }: AdminsListProps) => {
  const textColor = useColorModeValue('gray.700', 'white');
  const IconButtonWithConnectedWallet = withConnectedWallet(IconButton, true);

  return (
    <Flex direction="column" w="100%">
      {admins.map((row, index) => {
        return (
          <Flex key={index} my={{ sm: '1rem', xl: '10px' }} alignItems="center">
            <Flex direction="column">
              <Text fontSize="md" color={textColor} fontWeight="bold">
                {row.name}
              </Text>
              <WalletAddress address={row.address} chainId={80001} />
            </Flex>
            <Spacer />

            <Flex alignItems="center" p="12px">
              <Tooltip label="Remove admin">
                <IconButtonWithConnectedWallet
                  variant="ghost"
                  onClick={() => remove(row)}
                  // isLoading={loading}
                  aria-label="Remove admin"
                  icon={<DeleteIcon />}
                />
              </Tooltip>
            </Flex>
          </Flex>
        );
      })}
    </Flex>
  );
};
