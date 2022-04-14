import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  chakra,
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
import { Cell, Column, useSortBy, useTable } from 'react-table';
import { updateTransactionCategory } from '../../services/transactionsServices';
import { AddressLookup, Category, Pool } from '../../types';
import { Transaction } from '../../types/transaction';
import { RefreshTransactionButton } from '../Buttons/RefreshTransactionButton';
import Loading from '../Loading';

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

export const TransactionsTable = ({
  pool,
  transactions,
  addressLookups,
  loading,
  categories,
}: TransactionsTableProps) => {
  const columns = useMemo(() => {
    const getAddressName = (address: string) => {
      return (
        addressLookups.find((a) => a.address.toLowerCase() === address.toLowerCase())?.name ??
        address
      );
    };

    const columns: Column<Transaction>[] = [
      {
        Header: 'Date',
        accessor: 'created_at',
        Cell: ({ cell: { value } }) => {
          const date = new Date(value);
          return (
            <span>
              {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </span>
          );
        },
      },
      {
        Header: 'Type',
        accessor: 'type',
      },
      {
        Header: 'From',
        accessor: 'transfer_from',
        Cell: ({ cell: { value } }) => <span>{getAddressName(value)}</span>,
      },
      {
        Header: 'To',
        accessor: 'transfer_to',
        Cell: ({ cell: { value } }) => <span>{getAddressName(value)}</span>,
      },
      {
        Header: 'Category',
        accessor: 'category',
        Cell: ({ cell }) => <CategoryCell categories={categories} {...cell} />,
      },
      {
        Header: 'Description',
        accessor: 'memo',
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        isNumeric: true,
        Cell: ({
          cell: {
            value,
            row: { original },
          },
        }) => {
          switch (original.type) {
            case 'deposit':
              return <Text color="green">{value}</Text>;
            case 'withdrawal':
              return <Text color="red">{value}</Text>;
            default:
              return <Text>{value}</Text>;
          }
        },
      },
      {
        Header: '',
        accessor: 'status',
        Cell: ({ cell: { value } }) => {
          switch (value) {
            case 0:
              return <Badge colorScheme="yellow">Pending</Badge>;
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
        }) => {
          return original.status === 0 ? (
            <RefreshTransactionButton chainId={pool.chain_id} transactionHash={original.hash} />
          ) : null;
        },
      },
    ];
    return columns;
  }, [addressLookups, categories, pool.chain_id]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable<Transaction>({ columns, data: transactions }, useSortBy);

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
      {loading && <Loading m={4}/>}
    </>
  );
};
