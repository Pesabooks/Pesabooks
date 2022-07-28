import { Box, Icon } from '@chakra-ui/react';
import { BiTransfer } from 'react-icons/bi';
import { BsSafe } from 'react-icons/bs';
import {
  FiArrowDownLeft,
  FiArrowUpRight,
  FiUnlock,
  FiUserPlus,
  FiUsers,
  FiUserX
} from 'react-icons/fi';
import { TransactionType } from '../types';

export const TransactionIcon = ({ type }: { type: TransactionType }) => {
  let logo;
  let color = 'gray.400';
  switch (type) {
    case 'deposit':
      logo = FiArrowDownLeft;
      color = 'green.400';
      break;
    case 'withdrawal':
      logo = FiArrowUpRight;
      color = 'red.400';
      break;
    case 'addOwner':
      logo = FiUserPlus;
      break;
    case 'removeOwner':
      logo = FiUserX;
      break;
    case 'swapOwner':
      logo = FiUsers;
      break;
    case 'unlockToken':
      logo = FiUnlock;
      color = 'green.400';
      break;
    case 'swap':
      logo = BiTransfer;
      break;
      case 'createSafe':
      logo = BsSafe;
      break;

    default:
      break;
  }

  return (
    <Box
      me="12px"
      borderRadius="50%"
      color={color}
      border="1px solid"
      display="flex"
      alignItems="center"
      justifyContent="center"
      w="35px"
      h="35px"
    >
      <Icon as={logo} />
    </Box>
  );
};
