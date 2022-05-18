import { Box, Icon } from '@chakra-ui/react';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { TransactionType } from '../../types';

export const TransactionIcon = ({ type }: { type: TransactionType }) => {
  const isDeposit = type === 'deposit';
  const isWithdrawal = type === 'withdrawal';

  let logo;
  if (isDeposit) {
    logo = FaArrowUp;
  } else {
    logo = FaArrowDown;
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
