import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import {
    Box, chakra, Flex,
    Icon,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tooltip,
    Tr
} from '@chakra-ui/react';
import Loading from '@pesabooks/components/Loading';
import { getTxAmountDescription } from '@pesabooks/utils/transactions-utils';
import { useMemo } from 'react';
import { BiCheckCircle } from 'react-icons/bi';
import { MdOutlineCancel } from 'react-icons/md';
import { CellProps, Column, useSortBy, useTable } from 'react-table';
import { Pool, Transaction, TransactionStatus, User } from '../../../types';
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
  const columns = useMemo(() => {
    let columns: Column[] = [
      // {
      //   Header: 'Type',
      //   accessor: 'type',
      //   Cell: ({ cell: { value, row } }: CellProps<Transaction>) => (
      //     <Text>{getTransactionTypeLabel(value)}</Text>
      //   ),
      // },

      {
        Header: 'Description',
        accessor: 'icon',
        Cell: ({ cell: { row } }) => {
          return <TransactionCell transaction={row.original as Transaction} users={users} />;
        },
      },

      {
        Header: 'Category',
        accessor: 'category',
        Cell: ({ cell: { value } }) => <span>{value?.name}</span>,
      },
      // {
      //   Header: 'Memo',
      //   accessor: 'memo',
      // },
      {
        Header: 'Date',
        accessor: 'created_at',
        Cell: ({ cell: { value } }) => {
          const date = new Date(value);
          return (
            <Tooltip label={`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`}>
              {date.toLocaleDateString()}
            </Tooltip>
          );
        },
      },
      {
        Header: 'Amount',
        accessor: 'metadata.amount',
        isNumeric: true,
        //@ts-ignore
        Cell: ({
          cell: {
            value,
            row: { original },
          },
        }: CellProps<Transaction>) => (
          <Text>{getTxAmountDescription(original.type, original.metadata)}</Text>
        ),
      },
      {
        Header: 'Status',
        accessor: 'status',
         //@ts-ignore
        Cell: ({ cell: { value } }: CellProps<Transaction, TransactionStatus>) => (
          <TransactionStatusBadge type={value} hideIcon={true} />
        ),
      },
      {
        Header: '',
        accessor: 'id',
         //@ts-ignore
        Cell: ({
          cell: {
            row: { original },
          },
        }: CellProps<Transaction>) => {
          return (
            <Flex>
              {['pending', 'pending_rejection'].includes(original.status) && original.hash && (
                <RefreshTransactionButton chainId={pool.chain_id} transaction={original} />
              )}
            </Flex>
          );
        },
      },
      {
        Header: '',
        accessor: 'safeTxHash',
         //@ts-ignore
        Cell: ({
          cell: {
            row: { original },
          },
        }: CellProps<Transaction>) => {
          return (
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
          );
        },
      },
      {
        Header: showNonce ? 'Execution order' : '',
        accessor: 'safe_nonce',
        isNumeric: true,
      },
    ];

    if (!showNonce) columns = columns.filter((column) => column.accessor !== 'safeTxHash');

    return columns;
  }, [showNonce, users, pool.chain_id]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    { columns, data: transactions },
    useSortBy,
  );

  return (
    <Box overflowX="auto" w="100%">
      {loading && <Loading m={4} />}
      <Table {...getTableProps()}>
        <Thead>
          {headerGroups.map((headerGroup) => (
            <Tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <Th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  isNumeric={column.isNumeric}
                >
                  {column.render('Header')}
                  <chakra.span pl="4">
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <TriangleDownIcon aria-label="sorted descending" />
                      ) : (
                        <TriangleUpIcon aria-label="sorted ascending" />
                      )
                    ) : null}
                  </chakra.span>
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>

        <Tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <Tr
                _hover={{ cursor: 'pointer' }}
                {...row.getRowProps()}
                onClick={() => onSelect(row.original as Transaction)}
              >
                {row.cells.map((cell) => (
                  <Td {...cell.getCellProps()} isNumeric={cell.column.isNumeric}>
                    {cell.render('Cell')}
                  </Td>
                ))}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};
