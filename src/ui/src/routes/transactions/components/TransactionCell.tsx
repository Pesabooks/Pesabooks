import { Flex, Text } from '@chakra-ui/react';
import { TransactionIcon } from '../../../components/TransactionIcon';
import { AddressLookup, Transaction } from '../../../types';
import { getTransactonDescription } from '../../../utils';

export const TransactionCell = ({
  transaction,
  addressLookups,
}: {
  transaction: Transaction;
  addressLookups: AddressLookup[];
}) => {
  const { type, created_at } = transaction;
  const date = new Date(created_at);

  return (
    <Flex alignItems="center">
      <TransactionIcon type={type} />
      <Flex direction="column">
        <Text fontSize={{ sm: 'md', md: 'lg', lg: 'md' }} fontWeight="bold">
          {getTransactonDescription(transaction, addressLookups)}
        </Text>
        <Text fontSize={{ sm: 'xs', md: 'sm', lg: 'xs' }} color="gray.400" fontWeight="semibold">
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </Text>
      </Flex>
    </Flex>
  );
};
