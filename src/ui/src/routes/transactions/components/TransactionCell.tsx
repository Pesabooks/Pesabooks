import { Flex, Text } from '@chakra-ui/react';
import { TransactionIcon } from '../../../components/TransactionIcon';
import { Transaction, User } from '../../../types';
import { getTransactionDescription } from '../../../utils';

export const TransactionCell = ({
  transaction,
  users,
}: {
  transaction: Transaction;
  users: User[];
}) => {
  const { type } = transaction;

  return (
    <Flex alignItems="center">
      <TransactionIcon type={type} />
      <Flex direction="column">
        <Text fontSize={{ sm: 'md', md: 'lg', lg: 'md' }} fontWeight="bold">
          {getTransactionDescription(transaction, users)}
        </Text>
        {/* <Text fontSize={{ sm: 'xs', md: 'sm', lg: 'xs' }} color="gray.400" fontWeight="semibold">
          {getTransactionTypeLabel(type)}
        </Text> */}
      </Flex>
    </Flex>
  );
};
