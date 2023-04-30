import {
  BoxProps,
  Card,
  CardBody,
  CardHeader,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { TimelineRow } from '@pesabooks/components/TimelineRow';
import { formatDate, formatTimestampSeconds } from '@pesabooks/utils/date-utils';
import { getAddressName } from '@pesabooks/utils/transactions-utils';
import { FaBell } from 'react-icons/fa';
import { User } from '../../../types';

interface TransactionTimelineProps extends BoxProps {
  users: User[];
  isExecuted: boolean;
  executionTimestamp: number | undefined | null;
  submissionDate: string | undefined;
  confirmations: {
    rejected: boolean;
    owner: string;
    submissionDate: string;
  }[];
}
export const TransactionTimeline = ({
  users,
  isExecuted,
  executionTimestamp,
  submissionDate,
  confirmations,
  ...boxProps
}: TransactionTimelineProps) => {
  const textColor = useColorModeValue('gray.700', 'white');

  return (
    <Card p={0} {...boxProps}>
      <CardHeader>
        <Text color={textColor} fontSize="lg" fontWeight="bold">
          Timeline
        </Text>
      </CardHeader>
      <CardBody px="10px">
        <Stack direction="column">
          <TimelineRow
            status="done"
            logo={FaBell}
            title="Submitted"
            date={formatDate(submissionDate)}
          />
          {confirmations.map((confirmation, index) => {
            return (
              <TimelineRow
                status={confirmation.rejected ? 'rejected' : 'approved'}
                key={index}
                logo={FaBell}
                title={`${confirmation.rejected ? 'Rejected' : 'Approved'} by ${getAddressName(
                  confirmation.owner,
                  users,
                )}`}
                date={formatDate(confirmation.submissionDate)}
                // tag={{
                //   titleTag: confirmation.rejected ? 'Transaction rejected' : 'Transaction approved',
                //   bgTag: confirmation.rejected ? 'red' : 'green',
                // }}
              />
            );
          })}
          <TimelineRow
            status={isExecuted ? 'done' : 'pending'}
            logo={FaBell}
            title={isExecuted ? 'Transaction executed' : 'Waiting for execution'}
            description={isExecuted ? '' : 'Can be executed once the threshold is reached'}
            date={isExecuted ? formatTimestampSeconds(executionTimestamp) : ''}
            last={true}
          />
        </Stack>
      </CardBody>
    </Card>
  );
};
