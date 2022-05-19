import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { Badge, chakra, Flex, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { useMemo } from 'react';
import { CellProps, Column, useSortBy, useTable } from 'react-table';
import Loading from '../../../components/Loading';
import { AddressLookup, Category, Pool, Transaction, TransactionStatus } from '../../../types';
import { CategoryCell } from './CategoryCell';
import { RefreshTransactionButton } from './RefreshTransactionButton';
import { TransactionCell } from './TransactionCell';
import { ViewReceiptButton } from './ViewReceiptButton';

interface TransactionsTableProps {
  pool: Pool;
  transactions: Transaction[];
  addressLookups: AddressLookup[];
  loading: boolean;
  categories: Category[];
  refresh?: () => void;
}

export const TransactionsTable = ({
  pool,
  transactions,
  addressLookups,
  loading,
  categories,
}: TransactionsTableProps) => {
  const columns = useMemo(() => {
    const columns: Column[] = [
      {
        Header: '',
        accessor: 'icon',
        Cell: ({ cell: { value, row } }: CellProps<Transaction>) => (
          <TransactionCell transaction={row.original} addressLookups={addressLookups} />
        ),
      },
      // {
      //   Header: 'Date',
      //   accessor: 'created_at',
      //   Cell: ({ cell: { value } }) => {
      //     const date = new Date(value);
      //     return (
      //       <span>
      //         {date.toLocaleDateString()} {date.toLocaleTimeString()}
      //       </span>
      //     );
      //   },
      // },

      {
        Header: 'Category',
        accessor: 'category',
        Cell: ({ cell }: CellProps<Transaction>) => (
          <CategoryCell categories={categories} {...cell} />
        ),
      },
      {
        Header: 'Memo',
        accessor: 'memo',
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
        }: CellProps<Transaction>) => {
          switch (original.type) {
            case 'deposit':
              return (
                <Text color="green">
                  {value} {original.metadata?.token?.symbol}
                </Text>
              );
            case 'withdrawal':
              return (
                <Text color="red">
                  - {value} {original.metadata?.token?.symbol}
                </Text>
              );
            default:
              return <Text>{value}</Text>;
          }
        },
      },
      {
        Header: '',
        accessor: 'status',
        Cell: ({ cell: { value } }: CellProps<Transaction, TransactionStatus>) => {
          switch (value) {
            case 'pending':
              return <Badge colorScheme="yellow">Pending</Badge>;
            case 'failed':
              return <Badge colorScheme="red">Failed</Badge>;
            default:
              return null;
          }
        },
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
              {original.status === 'pending' && (
                <RefreshTransactionButton chainId={pool.chain_id} transactionHash={original.hash} />
              )}
              <ViewReceiptButton chainId={pool.chain_id} transactionHash={original.hash} />
            </Flex>
          );
        },
      },
    ];
    return columns;
  }, [addressLookups, categories, pool.chain_id]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    { columns, data: transactions },
    useSortBy,
  );

  return (
    <>
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
              <Tr {...row.getRowProps()}>
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
      {loading && <Loading m={4} />}
    </>
  );
};
