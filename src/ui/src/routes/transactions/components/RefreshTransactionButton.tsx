import { RepeatIcon } from '@chakra-ui/icons';
import { IconButton, Tooltip } from '@chakra-ui/react';
import { useState } from 'react';
import { refreshTransaction } from '../../../services/transactionsServices';
import { Transaction } from '../../../types';

interface RefreshTransactionButtonProps {
  chainId: number;
  transaction: Transaction;
}
export const RefreshTransactionButton = ({
  chainId,
  transaction,
}: RefreshTransactionButtonProps) => {
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      await refreshTransaction(chainId, transaction);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip label="Refresh">
      <IconButton
        variant="ghost"
        onClick={refresh}
        isLoading={loading}
        aria-label="Search database"
        icon={<RepeatIcon />}
      />
    </Tooltip>
  );
};
