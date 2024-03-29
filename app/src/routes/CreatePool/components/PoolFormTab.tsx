import {
  Button,
  Card,
  CardBody,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Image,
  Input,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { chakraComponents, GroupBase, OptionProps, Select } from 'chakra-react-select';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Token } from '../../../types';

interface PoolFormTabProps {
  chainId: number;
  tokens: Token[];
  onNext: (values: CreatePoolFormValue) => void;
  onPrev: () => void;
}

export interface CreatePoolFormValue {
  name: string;
  description: string;
  token: Token;
}

const IconOption = (props: OptionProps<Token, boolean, GroupBase<Token>>) => {
  return (
    <chakraComponents.Option {...props}>
      <Flex align="center">
        <Image
          w="20px"
          h="20px"
          src={`${process.env.PUBLIC_URL}/${props.data.image}`}
          alt={props.data.name}
        />
        <Text ml="10px">{props.data.name}</Text>
      </Flex>
    </chakraComponents.Option>
  );
};
export const PoolFormTab = ({ chainId, tokens, onNext, onPrev }: PoolFormTabProps) => {
  const submit = (values: CreatePoolFormValue) => {
    onNext(values);
  };

  const {
    control,
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = useForm<CreatePoolFormValue>();

  const filteredTokens = useMemo(
    () => tokens.filter((t) => t.chain_id === chainId),
    [chainId, tokens],
  );

  return (
    <Card>
      <CardBody flexDirection="column">
        <form onSubmit={handleSubmit(submit)}>
          <Flex direction="column" w="100%">
            <Stack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.name}>
                <FormLabel htmlFor="name">Name</FormLabel>
                <Input
                  id="name"
                  placeholder="name"
                  {...register('name', { required: 'Name is required' })}
                />
                <FormErrorMessage> {errors.name && errors.name.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.description}>
                <FormLabel htmlFor="description">Description</FormLabel>
                <Textarea id="description" placeholder="description" {...register('description')} />
                <FormErrorMessage>
                  {errors.description && errors.description.message}
                </FormErrorMessage>
              </FormControl>

              <Controller
                control={control}
                name="token"
                rules={{ required: 'Token is required' }}
                render={({
                  field: { onChange, onBlur, value, name, ref },
                  fieldState: { invalid, error },
                }) => (
                  <FormControl isInvalid={invalid} isRequired>
                    <FormLabel htmlFor="token">Accepts deposits in</FormLabel>
                    <Select
                      name={name}
                      ref={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      options={filteredTokens}
                      getOptionLabel={(t: Token) => t.name}
                      getOptionValue={(t: Token) => `${t.address}`}
                      components={{ Option: IconOption }}
                    />

                    <FormErrorMessage>{error && error.message}</FormErrorMessage>
                  </FormControl>
                )}
              />
            </Stack>

            <Flex justify="space-between" mt="150px">
              <Button
                variant="outline"
                alignSelf="flex-end"
                w={{ sm: '75px', lg: '100px' }}
                h="35px"
                onClick={onPrev}
              >
                Prev
              </Button>
              <Button
                alignSelf="flex-end"
                w={{ sm: '75px', lg: '100px' }}
                h="35px"
                type="submit"
                isDisabled={!isValid}
              >
                Next
              </Button>
            </Flex>
          </Flex>
        </form>
      </CardBody>
    </Card>
  );
};
