import { RepeatIcon } from '@chakra-ui/icons';
import { IconButton, Tooltip } from '@chakra-ui/react';
import { useState } from 'react';
import { refreshTransaction } from '../../../services/transactionsServices';

interface RefreshTransactionButtonProps {
  chainId: number;
  transactionHash: string;
}
export const RefreshTransactionButton = ({
  chainId,
  transactionHash,
}: RefreshTransactionButtonProps) => {
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      await refreshTransaction(chainId, transactionHash);
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
