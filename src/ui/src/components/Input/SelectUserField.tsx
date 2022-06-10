import {
  BoxProps, FormControl,
  FormErrorMessage,
  FormLabel
} from '@chakra-ui/react';
import { chakraComponents, GroupBase, OptionProps, Select } from 'chakra-react-select';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { AddressLookup } from '../../types';
import { UserWalletCard } from '../UserWalletCard';

interface Props extends BoxProps {
  users: AddressLookup[];
  label?: string;
}

const AvatarOption = (props: OptionProps<AddressLookup, boolean, GroupBase<AddressLookup>>) => {
  return (
    <chakraComponents.Option {...props}>
      <UserWalletCard addressLookup={props.data} />
    </chakraComponents.Option>
  );
};

export const SelectUserField = ({ users, label, ...boxProps }: Props) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name="user"
      rules={{ required: 'User is required' }}
      render={({
        field: { onChange, onBlur, value, name, ref },
        fieldState: { invalid, error },
      }) => (
        <FormControl {...boxProps} isInvalid={invalid} isRequired>
          <FormLabel htmlFor="user">{label ?? 'User'}</FormLabel>
          <Select
            name={name}
            ref={ref}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            options={users}
            getOptionValue={(profile: AddressLookup) => profile.address}
            getOptionLabel={(profile: AddressLookup) => profile.name}
            components={{ Option: AvatarOption }}
          />

          <FormErrorMessage>{error && error.message}</FormErrorMessage>
        </FormControl>
      )}
    />
  );
};
