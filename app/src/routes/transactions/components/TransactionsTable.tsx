import { Box, Flex, Icon, Text, Tooltip } from '@chakra-ui/react';
import { DataTable } from '@pesabooks/components/DataTable';
import Loading from '@pesabooks/components/Loading';
import { getTxAmountDescription } from '@pesabooks/utils/transactions-utils';
import { createColumnHelper } from '@tanstack/react-table';
import { BiCheckCircle } from 'react-icons/bi';
import { MdOutlineCancel } from 'react-icons/md';
import { Pool, Transaction, User } from '../../../types';
import { RefreshTransactionButton } from './RefreshTransactionButton';
import { TransactionCell } from './TransactionCell';
import { TransactionStatusBadge } from './TransactionStatusBadge';

interface TransactionsTableProps {
  pool: Pool;
  transactions: Transaction[];
  users: User[];
  loading: boolean;
  showNonce: boolean;
  onSelect: (transaction: Transaction) => void;
}

export const TransactionsTable = ({
  pool,
  transactions,
  users,
  loading,
  onSelect,
  showNonce,
}: TransactionsTableProps) => {
  const columnHelper = createColumnHelper<Transaction>();

  const columns = [
    columnHelper.display({
      id: 'description',
      cell: ({ row: { original } }) => <TransactionCell transaction={original} users={users} />,
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: (info) => info.getValue()?.name,
    }),
    columnHelper.accessor('created_at', {
      header: 'Date',
      cell: (info) => {
        const value = info.getValue();
        if (!value) return null;
        const date = new Date(value);
        return (
          <Tooltip label={`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`}>
            {date.toLocaleDateString()}
          </Tooltip>
        );
      },
    }),
    columnHelper.display({
      id: 'amount',
      header: 'Amount',
      cell: ({ row: { original } }) => (
        <Text>{getTxAmountDescription(original.type, original.metadata)}</Text>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => <TransactionStatusBadge type={info.getValue()} hideIcon={true} />,
    }),
    columnHelper.display({
      id: 'refresh',
      cell: ({ row: { original } }) => (
        <Flex>
          {['pending', 'pending_rejection'].includes(original.status) && original.hash && (
            <RefreshTransactionButton chainId={pool.chain_id} transaction={original} />
          )}
        </Flex>
      ),
    }),
    columnHelper.display({
      id: 'safeTxHash',
      cell: ({ row: { original } }) => (
        <Flex direction="column">
          <Flex gap={2} alignItems="center">
            <Icon as={BiCheckCircle} color="green.500" />
            <Text size="sm">
              {original.confirmations}/{original?.threshold}
            </Text>
          </Flex>

          {original.rejections > 0 && (
            <Flex gap={2} alignItems="center">
              <Icon as={MdOutlineCancel} color="red.500" />
              <Text size="sm">
                {original.rejections}/{original?.threshold}
              </Text>
            </Flex>
          )}
        </Flex>
      ),
    }),
    columnHelper.accessor('safe_nonce', {
      header: showNonce ? 'Execution order' : '',
      cell: (info) => info.getValue(),
      meta: {
        isNumeric: true,
      },
    }),
  ];

  const filteredColumns = showNonce
    ? columns
    : columns.filter((column) => column.id !== 'safeTxHash');

  return (
    <Box overflowX="auto" w="100%">
      {loading && <Loading m={4} />}
      <DataTable columns={filteredColumns} data={transactions} onSelect={onSelect} />
    </Box>
  );
};
