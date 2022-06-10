import { Flex, Icon, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { BsClockHistory } from 'react-icons/bs';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { TransactionStatus } from '../../../types';

export const TransactionStatusBadge = ({
  type,
  iconOnly,
}: {
  type: TransactionStatus;
  iconOnly?: boolean;
}) => {
  let color;
  let text;
  let logo;

  switch (type) {
    case 'pending':
      color = 'yellow';
      text = 'Pending';
      logo = BsClockHistory;
      break;
    case 'failed':
      color = 'red.400';
      text = 'Failed';
      logo = FaTimesCircle;
      break;
    case 'awaitingConfirmations':
      color = 'yellow.400';
      text = 'Awaiting Confirmations';
      logo = BsClockHistory;
      break;
    case 'awaitingExecution':
      color = 'yellow.400';
      text = 'Need Execution';
      logo = BsClockHistory;
      break;
    case 'completed':
      color = 'green.400';
      text = 'Completed';
      logo = FaCheckCircle;
      break;
    case 'rejected':
      color = 'red.400';
      text = 'Rejected';
      logo = FaTimesCircle;
      break;
    default:
      break;
  }

  return (
    <Flex align="center">
      <Tooltip label={text}>
        <span>
          <Icon as={logo} color={color} w="24px" h="24px" me="6px" />
        </span>
      </Tooltip>
      {!iconOnly ? text : null}
    </Flex>
  );
};
