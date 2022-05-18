import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  chakra,
  Flex,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Cell, CellProps, Column, useSortBy, useTable } from 'react-table';
import { updateTransactionCategory } from '../../services/transactionsServices';
import { AddressLookup, Category, Pool, Transaction, TransactionStatus } from '../../types';
import { RefreshTransactionButton } from '../Buttons/RefreshTransactionButton';
import { ViewReceiptButton } from '../Buttons/ViewReceiptButton';
import Loading from '../Loading';
import { TransactionIcon } from './TransactionIcon';

interface TransactionsTableProps {
  pool: Pool;
  transactions: Transaction[];
  addressLookups: AddressLookup[];
  loading: boolean;
  categories: Category[];
  refresh?: () => void;
}

interface CategoryCellProps extends Cell<Transaction, Category | undefined> {
  categories: Category[];
}
const CategoryCell = ({
  value: initialValue,
  row: { original: transaction },
  categories,
}: CategoryCellProps) => {
  const [editable, setEditable] = useState(false);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const onChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const cat = categories.find((c) => c.id === +e.target.value);
    setValue(cat);
    await updateTransactionCategory(transaction.id, +e.target.value);
  };

  const onBlur = () => {
    setEditable(false);
  };

  if (!editable)
    return (
      <Box w="100%" h="100%" onClick={() => setEditable(true)}>
        {/* Keep the space to make empty category clickable */}
        <span>{value?.name}&nbsp;</span>
      </Box>
    );

  return (
    <Select id="category_id" defaultValue={value?.id} onChange={onChange} onBlur={onBlur}>
      <option />
      {categories.map((category, index) => {
        return (
          <option value={category.id} key={index}>
            {category.name}
          </option>
        );
      })}
    </Select>
  );
};

const TransactionCell = ({
  transaction,
  addressLookups,
}: {
  transaction: Transaction;
  addressLookups: AddressLookup[];
}) => {
  const { type, created_at } = transaction;
  const date = new Date(created_at);

  const getAddressName = (address: string) => {
    if (!address) return null;

    return (
      addressLookups.find((a) => a.address.toLowerCase() === address.toLowerCase())?.name ?? address
    );
  };

  const renderLabel = () => {
    switch (type) {
      case 'deposit':
        return `From ${getAddressName(transaction.metadata.transfer_from)}`;
      case 'withdrawal':
        return `To ${getAddressName(transaction.metadata.transfer_to)}`;
    }
  };

  return (
    <Flex alignItems="center">
      <TransactionIcon type={type} />
      <Flex direction="column">
        <Text fontSize={{ sm: 'md', md: 'lg', lg: 'md' }} fontWeight="bold">
          {renderLabel()}
        </Text>
        <Text fontSize={{ sm: 'xs', md: 'sm', lg: 'xs' }} color="gray.400" fontWeight="semibold">
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </Text>
      </Flex>
    </Flex>
  );
};

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
