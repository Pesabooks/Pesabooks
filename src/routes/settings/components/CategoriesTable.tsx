import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import {
    chakra,
    Editable,
    EditableInput,
    EditablePreview,
    Flex,
    Stack,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr
} from '@chakra-ui/react';
import { SwitchWithAdmingRights } from '@pesabooks/components/withConnectedWallet';
import React from 'react';
import { Column, useSortBy, useTable } from 'react-table';
import { Category } from '../../../types';

interface CategoriesTableProps {
  categories: Category[];
  onEdit: (categoryId: number, category: Partial<Category>) => void;
}

export const CategoriesTable = ({ categories, onEdit }: CategoriesTableProps) => {
  const columns: Column<Category>[] = React.useMemo(() => {
    const onChangeStatus = (categoryId: number, active: boolean) => {
      onEdit(categoryId, { active });
    };

    const onChangeName = (categoryId: number, name: string) => {
      onEdit(categoryId, { name });
    };

    return [
      {
        Header: 'Name',
        accessor: 'name',
        Cell: ({
          cell: {
            value,
            row: { original: category },
          },
        }) => (
          <Flex>
            <Editable
              defaultValue={value}
              onSubmit={(newName) => onChangeName(category.id, newName)}
            >
              <EditablePreview />
              <EditableInput />
            </Editable>
          </Flex>
        ),
      },
      {
        Header: '',
        accessor: 'active',
        Cell: ({
          cell: {
            value,
            row: { original: category },
          },
        }) => (
          <SwitchWithAdmingRights
            defaultChecked={value}
            onChange={(e) => onChangeStatus(category.id, e.target.checked)}
          />
        ),
      },
    ];
  }, [onEdit]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<Category>(
    { columns, data: categories },
    useSortBy,
  );

  return (
    <Stack w="100%">
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
