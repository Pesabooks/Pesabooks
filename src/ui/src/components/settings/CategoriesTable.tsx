import { CheckIcon, TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import {
  Badge,
  chakra,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import React, { useMemo, useState } from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import { IoSettingsSharp } from 'react-icons/io5';
import { Column, useSortBy, useTable } from 'react-table';
import { Category } from '../../types';

const ActionCell = ({
  category,
  onEdit,
  onActivate,
  onDeactivate,
}: {
  category: Category;
  onEdit: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
}) => {
  const onActivatateOrDeactivate = () => {
    if (category.active) onDeactivate();
    else onActivate();
  };
  return (
    <Menu>
      <MenuButton as={IconButton} aria-label="Options" icon={<FiMoreVertical />} variant="ghost" />
      <MenuList>
        <MenuItem onClick={onEdit}>Edit</MenuItem>
        <MenuItem onClick={onActivatateOrDeactivate}>
          {category.active ? 'Make inactive' : 'Make active'}
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

interface CategoriesTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onActivate: (categoryId: number) => void;
  onDeactivate: (categoryId: number) => void;
}

export const CategoriesTable = ({
  categories,
  onEdit,
  onDeactivate,
  onActivate,
}: CategoriesTableProps) => {
  const [config, setConfig] = useState({ includeInactive: false });

  const filteredCategories = useMemo(
    () => categories?.filter((c) => (config.includeInactive ? true : c.active)),
    [categories, config.includeInactive],
  );

  const columns: Column<Category>[] = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
        Cell: ({
          cell: {
            value,
            row: { original },
          },
        }) => (
          <>
            {value}
            {!original.active && (
              <Badge ml={2} colorScheme="yellow">
                Inactive
              </Badge>
            )}
          </>
        ),
      },
      {
        Header: 'Deposit',
        accessor: 'deposit',
        Cell: ({ cell: { value } }) => (value ? <CheckIcon /> : null),
      },
      {
        Header: 'Withdrawal',
        accessor: 'withdrawal',
        Cell: ({ cell: { value } }) => (value ? <CheckIcon /> : null),
      },
      {
        Header: '',
        accessor: 'id',
        Cell: ({
          cell: {
            row: { original: category },
          },
        }) => (
          <ActionCell
            onEdit={() => onEdit(category)}
            onActivate={() => onActivate(category.id)}
            onDeactivate={() => onDeactivate(category.id)}
            category={category}
          />
        ),
      },
    ],
    [onActivate, onDeactivate, onEdit],
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<Category>(
    { columns, data: filteredCategories },
    useSortBy,
  );

  return (
    <Stack w="100%">
      <Flex>
        <Spacer />
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<IoSettingsSharp />}
            variant="ghost"
          />
          <MenuList>
            <MenuItem
              onClick={() =>
                setConfig((state) => ({ ...state, includeInactive: !state.includeInactive }))
              }
            >
              {config.includeInactive && <CheckIcon mr={4} />}
              Include inactive
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
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
    </Stack>
  );
};
