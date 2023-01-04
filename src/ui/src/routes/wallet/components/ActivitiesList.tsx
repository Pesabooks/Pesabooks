import { Flex, HStack, Text } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { TransactionIcon } from '../../../components/TransactionIcon';
import { Activity } from '../../../types';
import { SwapData, TransferData } from '../../../types/transaction';
import { getTxAmountDescription, shortenHash } from '../../../utils';
import { TransactionStatusBadge } from '../../transactions/components/TransactionStatusBadge';

interface TransactionsListProps {
  activities: Activity[];
}

const getActivityDescription = (activity: Activity): string => {
  const { type, metadata } = activity;

  switch (type) {
    case 'transfer_out':
      return `Sent To ${shortenHash((metadata as TransferData).transfer_to)}`;
      case 'unlockToken':
        return `unlock token ${(metadata as any).token.symbol}`;
    case 'swap':
      const swapData = metadata as SwapData;
      return `Traded ${swapData.src_token.symbol} for ${swapData.dest_token.symbol}  `;
    case 'purchase':
        const data = metadata as TransferData;
        return `Purchased ${data.token.symbol}`;
    default:
      return type;
  }
};

export const ActivitiesList = ({ activities }: TransactionsListProps) => {
  return (
    <Flex direction="column" w="100%">
      {activities.map((activity, key) => {
        const { created_at, type, metadata } = activity;

        return (
          <Flex key={key} my="1rem" justifyContent="space-between">
            <Flex alignItems="center">
              <TransactionIcon type={type} />
              <Flex direction="column">
                <Text fontSize={{ sm: 'md', md: 'lg', lg: 'md' }} fontWeight="bold">
                  {getActivityDescription(activity)}
                </Text>
                <Flex gap={2} fontSize={{ sm: 'xs', md: 'sm', lg: 'xs' }} fontWeight="semibold">
                  <Text color="gray.400">{dayjs(created_at).fromNow()}</Text>
                  <Text color="gray.400"> - </Text>

                  <Text>
                    <TransactionStatusBadge type={activity.status} hideIcon={true} />
                  </Text>
                </Flex>
              </Flex>
            </Flex>

            <HStack>
              <Flex direction="column" alignItems="end">
                <Text align="end" fontSize={{ sm: 'md', md: 'lg', lg: 'md' }} fontWeight="bold">
                  {getTxAmountDescription(type, metadata)}
                </Text>
              </Flex>
            </HStack>
          </Flex>
        );
      })}
    </Flex>
  );
};
