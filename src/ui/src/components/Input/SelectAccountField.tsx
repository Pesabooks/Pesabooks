import { BoxProps, FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react';
import { Select } from 'chakra-react-select';
import { Controller, useFormContext } from 'react-hook-form';
import { Account } from '../../types';

interface Props extends BoxProps {
  accounts: Account[];
}

export const SelectAccountField = ({ accounts, ...boxProps }: Props) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name="account"
      rules={{ required: 'Account is required' }}
      render={({
        field: { onChange, onBlur, value, name, ref },
        fieldState: { invalid, error },
      }) => (
        <FormControl {...boxProps} isInvalid={invalid} isRequired>
          <FormLabel htmlFor="account">Account</FormLabel>
          <Select
            name={name}
            ref={ref}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            options={accounts}
            getOptionValue={(account: Account) => `${account.id}`}
            getOptionLabel={(account: Account) => account.name}
          />

          <FormErrorMessage>{error && error.message}</FormErrorMessage>
        </FormControl>
      )}
    />
  );
};
