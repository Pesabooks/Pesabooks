import { IconButton, Link, Tooltip } from '@chakra-ui/react';
import { FaReceipt } from 'react-icons/fa';
import { getTxScanLink } from '../../../services/transactionsServices';

interface ViewReceiptButtonProps {
  chainId: number;
  transactionHash: string;
}
export const ViewReceiptButton = ({ chainId, transactionHash }: ViewReceiptButtonProps) => {
  const link = getTxScanLink(transactionHash, chainId);

  return (
    <Tooltip label="View Receipt">
      <Link href={link} isExternal>
        <IconButton variant="ghost" aria-label="View Receipt" icon={<FaReceipt />} />
      </Link>
    </Tooltip>
  );
};
