import { Box, Select } from '@chakra-ui/react';
import { ChangeEvent, useEffect, useState } from 'react';
import { Cell } from 'react-table';
import { updateTransactionCategory } from '../../../services/transactionsServices';
import { Category, Transaction } from '../../../types';

interface CategoryCellProps extends Cell<Transaction, Category | undefined> {
  categories: Category[];
}

export const CategoryCell = ({
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
