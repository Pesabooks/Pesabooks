import { BoxProps, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { FaBell } from 'react-icons/fa';
import { Card, CardBody, CardHeader } from '../../../components/Card';
import { TimelineRow } from '../../../components/TimelineRow';
import { AddressLookup } from '../../../types';
import { getAddressName } from '../../../utils';
import { formatDate, formatTimestampSeconds } from '../../../utils/date';

interface TransactionTimelineProps extends BoxProps {
  addressLookups: AddressLookup[];
  isExecuted: boolean;
  executionTimestamp: number | undefined;
  submissionDate: string | undefined;
  confirmations: {
    rejected: boolean;
    owner: string;
    submissionDate: string;
  }[];
}
export const TransactionTimeline = ({
  addressLookups,
  isExecuted,
  executionTimestamp,
  submissionDate,
  confirmations,
  ...boxProps
}: TransactionTimelineProps) => {
  const textColor = useColorModeValue('gray.700', 'white');

  return (
    <Card p={0} {...boxProps}>
      <CardHeader mb="10px">
        <Text color={textColor} fontSize="lg" fontWeight="bold">
          Timeline
        </Text>
      </CardHeader>
      <CardBody px="10px">
        <Stack direction="column">
          <TimelineRow status="done" logo={FaBell} title="Submitted" date={formatDate(submissionDate)} />
          {confirmations.map((confirmation, index) => {
            return (
              <TimelineRow
                status={confirmation.rejected ? 'rejected' : 'approved'}
                key={index}
                logo={FaBell}
                title={getAddressName(confirmation.owner, addressLookups) ?? ''}
                date={formatDate(confirmation.submissionDate)}
                tag={{
                  titleTag: confirmation.rejected ? 'Transaction rejected' : 'Transaction approved',
                  bgTag: confirmation.rejected ? 'red' : 'green',
                }}
              />
            );
          })}
          <TimelineRow
            status={isExecuted ? 'done' : 'pending'}
            logo={FaBell}
            title="Transaction executed"
            description={isExecuted ? '' : 'Can be executed once the threshold is reached'}
            date={isExecuted? formatTimestampSeconds(executionTimestamp): ""}
            last={true}
          />
        </Stack>
      </CardBody>
    </Card>
  );
};
