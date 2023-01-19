import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { Box, chakra, Flex, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from '@chakra-ui/react';
import { useMemo } from 'react';
import { CellProps, Column, useSortBy, useTable } from 'react-table';
import Loading from '../../../components/Loading';
import { Category, Pool, Transaction, TransactionStatus, User } from '../../../types';
import { getTxAmountDescription } from '../../../utils';
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
    const columns: Column[] = [
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
        Cell: ({ cell: { value, row } }: CellProps<Transaction>) => (
          <TransactionCell transaction={row.original} users={users} />
        ),
      },

      {
        Header: 'Category',
        accessor: 'category',
        Cell: ({ cell: { value } }: CellProps<Transaction, Category>) => <span>{value?.name}</span>,
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
        Cell: ({ cell: { value } }: CellProps<Transaction, TransactionStatus>) => (
          <TransactionStatusBadge type={value} hideIcon={true} />
        ),
      },
      {
        Header: '',
        accessor: 'id',
        Cell: ({
          cell: {
            row: { original },
          },
        }: CellProps<Transaction>) => {
          return (
            <Flex>
              {original.status === 'pending' && original.hash && (
                <RefreshTransactionButton chainId={pool.chain_id} transaction={original} />
              )}
            </Flex>
          );
        },
      },
      {
        Header: showNonce ? 'Execution order' : '',
        accessor: 'safe_nonce',
      },
    ];

    return columns;
  }, [showNonce, users, pool.chain_id]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    { columns, data: transactions },
    useSortBy,
  );

  return (
    <Box overflowX="auto" w='100%'>
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
        {loading ? (
          <Loading m={4} />
        ) : (
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
        )}
      </Table>
    </Box>
  );
};
