import { Flex, Text } from '@chakra-ui/react';
import { AddressLookup, Transaction } from '../../types';
import { TransactionIcon } from './TransactionIcon';

interface TransactionsListProps {
  transactions: Transaction[];
  addressLookups: AddressLookup[];
}

export const TransactionsList = ({ transactions, addressLookups }: TransactionsListProps) => {
  const getAddressName = (address: string) => {
    return (
      addressLookups.find((a) => a.address.toLowerCase() === address.toLowerCase())?.name ?? address
    );
  };

  return (
    // <Card my="24px" ms={{ lg: '24px' }}>

    <Flex direction="column" w="100%">
      {transactions.map(({ created_at, type, category, metadata }, key) => {
        const isDeposit = type === 'deposit';
        const isWithdrawal = type === 'withdrawal';

       
        return (
          <Flex key={key} my="1rem" justifyContent="space-between">
            <Flex alignItems="center">
              <TransactionIcon type={type} />
              <Flex direction="column">
                <Text fontSize={{ sm: 'md', md: 'lg', lg: 'md' }} fontWeight="bold">
                  {type === 'deposit'
                    ? getAddressName(metadata.transfer_from)
                    : getAddressName(metadata.transfer_to)}
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

            <Flex
              direction="column"
              color={isDeposit ? 'green.400' : isWithdrawal ? 'red.400' : ''}
            >
              <Text align="end" fontSize={{ sm: 'md', md: 'lg', lg: 'md' }} fontWeight="bold">
                {isWithdrawal && '-'} {metadata.amount} {metadata?.token?.symbol}
              </Text>

              <Text
                fontSize={{ sm: 'xs', md: 'sm', lg: 'xs' }}
                color="gray.400"
                fontWeight="semibold"
              >
                {created_at ? new Date(created_at).toLocaleDateString() : ''}
              </Text>
            </Flex>
          </Flex>
        );
      })}
    </Flex>
  );
};
