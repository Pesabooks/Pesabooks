import { Flex, HStack, Text } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { TransactionIcon } from '../../../components/TransactionIcon';
import { Transaction, User } from '../../../types';
import { getTransactionDescription, getTxAmountDescription } from '../../../utils';
import { TransactionStatusBadge } from '../../transactions/components/TransactionStatusBadge';

interface TransactionsListProps {
  transactions: Transaction[];
  users: User[];
}

export const TransactionsList = ({ transactions, users }: TransactionsListProps) => {
  return (
    <Flex direction="column" w="100%">
      {transactions.map((transaction, key) => {
        const { created_at, type } = transaction;

        return (
          <Flex key={key} my="1rem" justifyContent="space-between">
            <Flex alignItems="center">
              <TransactionIcon type={type} />
              <Flex direction="column">
                <Text fontSize={{ sm: 'md', md: 'lg', lg: 'md' }} fontWeight="bold">
                  {getTransactionDescription(transaction, users)}
                </Text>
                <Flex gap={2} fontSize={{ sm: 'xs', md: 'sm', lg: 'xs' }} fontWeight="semibold">
                  <Text color="gray.400">{dayjs(created_at).fromNow()}</Text>
                  <Text color="gray.400"> - </Text>

                  <Text>
                    <TransactionStatusBadge type={transaction.status} hideIcon={true} />
                  </Text>
                </Flex>
              </Flex>
            </Flex>

            <HStack>
              <Flex direction="column" alignItems="end">
                <Text align="end" fontSize={{ sm: 'md', md: 'lg', lg: 'md' }} fontWeight="bold">
                  {getTxAmountDescription(transaction)}
                </Text>
              </Flex>
            </HStack>
          </Flex>
        );
      })}
    </Flex>
  );
};
