import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { AddressLookup, Transaction } from '../../types';

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
      {transactions.map(
        ({ transfer_from, transfer_to, created_at, amount, type, category }, key) => {
          const isDeposit = type === 'deposit';
          const isWithdrawal = type === 'withdrawal';

          let logo;
          if (type === 'deposit') {
            logo = FaArrowUp;
          } else {
            logo = FaArrowDown;
          }
          return (
            <Flex key={key} my="1rem" justifyContent="space-between">
              <Flex alignItems="center">
                <Box
                  me="12px"
                  borderRadius="50%"
                  color={isDeposit ? 'green.400' : isWithdrawal ? 'red.400' : 'gray.400'}
                  border="1px solid"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  w="35px"
                  h="35px"
                >
                  <Icon as={logo} />
                </Box>
                <Flex direction="column">
                  <Text fontSize={{ sm: 'md', md: 'lg', lg: 'md' }} fontWeight="bold">
                    {type === 'deposit'
                      ? getAddressName(transfer_from)
                      : getAddressName(transfer_to)}
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
                  {isWithdrawal && '-'} {amount}
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
        },
      )}
    </Flex>
  );
};
