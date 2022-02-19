import {
  Avatar,
  BoxProps,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Text,
} from '@chakra-ui/react';
import { chakraComponents, GroupBase, OptionProps, Select } from 'chakra-react-select';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { AddressLookup } from '../../types';
import { shortenAddress } from '../../utils/addresses';

interface Props extends BoxProps {
  users: AddressLookup[];
}

const AvatarOption = (props: OptionProps<AddressLookup, boolean, GroupBase<AddressLookup>>) => {
  return (
    <chakraComponents.Option {...props}>
      <Flex align="center">
        <Avatar size={'sm'} name={props.data?.name} mr={4} />
        <Flex direction="column">
          <Text fontWeight="bold">{props.data.name}</Text>
          <Text fontSize="sm">{shortenAddress(props.data.address)}</Text>
        </Flex>
      </Flex>
    </chakraComponents.Option>
  );
};

export const SelectUserField = ({ users, ...boxProps }: Props) => {
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
          <FormLabel htmlFor="user">User</FormLabel>
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