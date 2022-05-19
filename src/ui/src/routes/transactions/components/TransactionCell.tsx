import { Flex, Text } from '@chakra-ui/react';
import { TransactionIcon } from '../../../components/TransactionIcon';
import { AddressLookup, Transaction } from '../../../types';

export const TransactionCell = ({
  transaction,
  addressLookups,
}: {
  transaction: Transaction;
  addressLookups: AddressLookup[];
}) => {
  const { type, created_at } = transaction;
  const date = new Date(created_at);

  const getAddressName = (address: string) => {
    if (!address) return null;

    return (
      addressLookups.find((a) => a.address.toLowerCase() === address.toLowerCase())?.name ?? address
    );
  };

  const renderLabel = () => {
    switch (type) {
      case 'deposit':
        return `From ${getAddressName(transaction.metadata.transfer_from)}`;
      case 'withdrawal':
        return `To ${getAddressName(transaction.metadata.transfer_to)}`;
    }
  };

  return (
    <Flex alignItems="center">
      <TransactionIcon type={type} />
      <Flex direction="column">
        <Text fontSize={{ sm: 'md', md: 'lg', lg: 'md' }} fontWeight="bold">
          {renderLabel()}
        </Text>
        <Text fontSize={{ sm: 'xs', md: 'sm', lg: 'xs' }} color="gray.400" fontWeight="semibold">
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </Text>
      </Flex>
    </Flex>
  );
};
