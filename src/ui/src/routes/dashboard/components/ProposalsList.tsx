import { Box, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { BsCardList } from 'react-icons/bs';
import { FaUsers } from 'react-icons/fa';
import { IconBox } from '../../../components/Icons';
import Loading from '../../../components/Loading';
import { TransactionIcon } from '../../../components/TransactionIcon';
import { getAllProposalsResponse } from '../../../services/transactionsServices';
import { User } from '../../../types';
import { getTransactionDescription } from '../../../utils';
import { TransactionStatusBadge } from '../../transactions/components/TransactionStatusBadge';

interface TransactionsListProps {
  proposals: getAllProposalsResponse;
  users: User[];
  onSelect: () => void;
  loading: boolean;
}

const EmptyCard = () => (
  <Box textAlign="center">
    <Icon boxSize={'50px'} as={BsCardList} />

    <Text color={'gray.500'} mb={6}>
      There is no proposals
    </Text>
  </Box>
);

export const ProposalsList = ({ proposals, users, onSelect, loading }: TransactionsListProps) => {
  if (loading) {
    return <Loading />;
  } else
    return proposals && proposals.length > 0 ? (
      <Flex direction="column" w="100%">
        {proposals.map((transaction, key) => {
          const { created_at, type } = transaction;

          return (
            <Flex
              key={key}
              my="1rem"
              justifyContent="space-between"
              _hover={{ cursor: 'pointer' }}
              onClick={onSelect}
            >
              <Flex alignItems="center">
                <TransactionIcon type={type} />
                <Flex direction="column">
                  <Text fontSize={{ sm: 'md', md: 'lg', lg: 'md' }} fontWeight="bold">
                    {getTransactionDescription(transaction, users)}
                  </Text>
                  <Flex gap={2} fontSize={{ sm: 'xs', md: 'sm', lg: 'xs' }} fontWeight="semibold">
                    <Text color="gray.400">{dayjs(created_at).fromNow()}</Text>
                    <Text color="gray.400"> - </Text>
                    <TransactionStatusBadge type={transaction.status} hideIcon={true} />
                  </Flex>
                </Flex>
              </Flex>

              <HStack>
                <IconBox py={2} px={4} bg="teal" gap={2}>
                  <Icon as={FaUsers} h={'15px'} w={'15px'} />
                  <Text fontWeight="bold">
                    {transaction.safeTx.confirmations?.length}/
                    {transaction.safeTx.confirmationsRequired}
                  </Text>
                </IconBox>
              </HStack>
            </Flex>
          );
        })}
      </Flex>
    ) : (
      <EmptyCard />
    );
};
