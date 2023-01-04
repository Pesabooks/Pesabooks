import { BoxProps, FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react';
import { chakraComponents, GroupBase, OptionProps, Select } from 'chakra-react-select';
import { Controller, useFormContext } from 'react-hook-form';
import { User } from '../../types';
import { shortenHash } from '../../utils';
import { UserWalletCard } from '../UserWalletCard';

interface Props extends BoxProps {
  users: User[];
  label?: string;
}

const AvatarOption = (props: OptionProps<User, boolean, GroupBase<User>>) => {
  return (
    <chakraComponents.Option {...props}>
      <UserWalletCard user={props.data} />
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
            getOptionValue={(user: User) => user.wallet}
            getOptionLabel={(user: User) => user.username ?? shortenHash(user.wallet)}
            components={{ Option: AvatarOption }}
          />

          <FormErrorMessage>{error && error.message}</FormErrorMessage>
        </FormControl>
      )}
    />
  );
};
