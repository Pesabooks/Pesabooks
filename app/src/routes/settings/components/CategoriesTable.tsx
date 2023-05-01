import { Editable, EditableInput, EditablePreview, Flex, Stack } from '@chakra-ui/react';
import { DataTable } from '@pesabooks/components/DataTable';
import { SwitchWithAdmingRights } from '@pesabooks/components/withConnectedWallet';
import { createColumnHelper } from '@tanstack/react-table';
import { Category } from '../../../types';

interface CategoriesTableProps {
  categories: Category[];
  onEdit: (categoryId: number, category: Partial<Category>) => void;
}

export const CategoriesTable = ({ categories, onEdit }: CategoriesTableProps) => {
  const onChangeStatus = (categoryId: number, active: boolean) => {
    onEdit(categoryId, { active });
  };

  const onChangeName = (categoryId: number, name: string) => {
    onEdit(categoryId, { name });
  };

  const columnHelper = createColumnHelper<Category>();

  const columns = [
    columnHelper.display({
      id: 'name',
      header: 'Name',
      cell: ({ row: { original: category } }) => {
        return (
          <Flex>
            <Editable
              defaultValue={category.name}
              onSubmit={(newName) => onChangeName(category.id, newName)}
            >
              <EditablePreview />
              <EditableInput />
            </Editable>
          </Flex>
        );
      },
    }),
    columnHelper.accessor('active', {
      cell: (info) => {
        const value = info.getValue();
        const category = info.row.original;
        return (
          <SwitchWithAdmingRights
            defaultChecked={value}
            onChange={(e) => onChangeStatus(category.id, e.target.checked)}
          />
        );
      },
    }),
  ];

  return (
    <Stack w="100%">
      <DataTable columns={columns} data={categories} />
    </Stack>
  );
};
