import { BoxProps, FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react';
import { Category } from '@pesabooks/types';
import { Select } from 'chakra-react-select';
import { Controller, useFormContext } from 'react-hook-form';

interface Props extends BoxProps {
  categories: Category[];
}

export const SelectCategoryField = ({ categories, ...boxProps }: Props) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name="category"
      rules={{ required: 'Category is required' }}
      render={({
        field: { onChange, onBlur, value, name, ref },
        fieldState: { invalid, error },
      }) => (
        <FormControl {...boxProps} isInvalid={invalid} isRequired>
          <FormLabel htmlFor="category">Category</FormLabel>
          <Select
            name={name}
            ref={ref}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            options={categories}
            getOptionValue={(category: Category) => `${category.id}`}
            getOptionLabel={(category: Category) => category.name}
          />

          <FormErrorMessage>{error && error.message}</FormErrorMessage>
        </FormControl>
      )}
    />
  );
};
