import { Box, Icon } from '@chakra-ui/react';
import { FiArrowDownLeft, FiArrowUpRight, FiUserPlus, FiUsers, FiUserX } from 'react-icons/fi';
import { TransactionType } from '../types';

export const TransactionIcon = ({ type }: { type: TransactionType }) => {
  const isDeposit = type === 'deposit';
  const isWithdrawal = type === 'withdrawal';

  let logo;
  switch (type) {
    case 'deposit':
      logo = FiArrowDownLeft;
      break;
    case 'withdrawal':
      logo = FiArrowUpRight;
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
    // case 'swap':
    //   logo = BiTransfer;
    //   break;

    default:
      break;
  }

  return (
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
  );
};
