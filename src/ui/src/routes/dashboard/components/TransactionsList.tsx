import { Flex, HStack, Text } from '@chakra-ui/react';
import { TransactionIcon } from '../../../components/TransactionIcon';
import { AddressLookup, Transaction } from '../../../types';
import { getTransactonDescription, getTxAmountDescription } from '../../../utils';
import { formatDate } from '../../../utils/date';
import { TransactionStatusBadge } from '../../transactions/components/TransactionStatusBadge';

interface TransactionsListProps {
  transactions: Transaction[];
  addressLookups: AddressLookup[];
}

export const TransactionsList = ({ transactions, addressLookups }: TransactionsListProps) => {
  return (
    <Flex direction="column" w="100%">
      {transactions.map((transaction, key) => {
        const { created_at, type, category } = transaction;
        const isDeposit = type === 'deposit';
        const isWithdrawal = type === 'withdrawal';

        return (
          <Flex key={key} my="1rem" justifyContent="space-between">
            <Flex alignItems="center">
              <TransactionIcon type={type} />
              <Flex direction="column">
                <Text fontSize={{ sm: 'md', md: 'lg', lg: 'md' }} fontWeight="bold">
                  {getTransactonDescription(transaction, addressLookups)}
                </Text>
                <Text
                  fontSize={{ sm: 'xs', md: 'sm', lg: 'xs' }}
                  color="gray.400"
                  fontWeight="semibold"
                >
                  {category?.name}
                </Text>
              </Flex>
            </Flex>

            <HStack>
              <Flex
                direction="column"
                alignItems="end"
                color={isDeposit ? 'green.400' : isWithdrawal ? 'red.400' : ''}
              >
                <Text align="end" fontSize={{ sm: 'md', md: 'lg', lg: 'md' }} fontWeight="bold">
                  {isWithdrawal && '-'} {getTxAmountDescription(transaction)}
                </Text>

                <Text
                  fontSize={{ sm: 'xs', md: 'sm', lg: 'xs' }}
                  color="gray.400"
                  fontWeight="semibold"
                >
                  {formatDate(created_at)}
                </Text>
              </Flex>
              <TransactionStatusBadge type={transaction.status} iconOnly={true}/>
            </HStack>
          </Flex>
        );
      })}
    </Flex>
  );
};
