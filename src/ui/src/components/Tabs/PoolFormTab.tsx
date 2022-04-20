import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Image,
  Input,
  Stack,
  Text,
  Textarea,
  useColorModeValue
} from '@chakra-ui/react';
import { chakraComponents, GroupBase, OptionProps, Select } from 'chakra-react-select';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Token } from '../../types';
import { Card, CardBody, CardHeader } from '../Card';

interface PoolFormTabProps {
  chainId: number;
  tokens: Token[];
  onCreate: (values: CreatePoolFormValue) => void;
  loading: boolean;
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
export const PoolFormTab = ({ chainId, tokens, onCreate, loading, onPrev }: PoolFormTabProps) => {
  const bgPrevButton = useColorModeValue('gray.100', 'gray.100');

  const submit = (values: CreatePoolFormValue) => {
    onCreate(values);
  };

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CreatePoolFormValue>();

  const filteredTokens = useMemo(
    () => tokens.filter((t) => t.chain_id === chainId),
    [chainId, tokens],
  );

  return (
    <Card p="4">
      <CardHeader mb="40px">
        <Flex
          direction="column"
          align="center"
          justify="center"
          textAlign="center"
          w="80%"
          mx="auto"
        >
          <Text fontSize="lg" fontWeight="bold" mb="4px">
            Group info
          </Text>
        </Flex>
      </CardHeader>
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
                <FormErrorMessage>{errors.name}</FormErrorMessage>
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
                    <FormLabel htmlFor="token">token</FormLabel>
                    <Select
                      name={name}
                      ref={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      options={filteredTokens}
                      getOptionLabel={(t) => t.name}
                      getOptionValue={(t) => `${t.id}`}
                      components={{ Option: IconOption }}
                    />

                    <FormErrorMessage>{error && error.message}</FormErrorMessage>
                  </FormControl>
                )}
              />
            </Stack>

            <Flex justify="space-between" mt={4}>
              <Button
                variant="no-hover"
                bg={bgPrevButton}
                alignSelf="flex-end"
                mt="24px"
                w={{ sm: '75px', lg: '100px' }}
                h="35px"
                onClick={onPrev}
                isLoading={loading}
              >
                <Text fontSize="xs" color="gray.700" fontWeight="bold">
                  PREV
                </Text>
              </Button>
              <Button
                alignSelf="flex-end"
                mt="24px"
                w={{ sm: '75px', lg: '100px' }}
                h="35px"
                isLoading={loading}
                type="submit"
              >
                <Text fontSize="xs" color="#fff" fontWeight="bold">
                  CREATE
                </Text>
              </Button>
            </Flex>
          </Flex>
        </form>
      </CardBody>
    </Card>
  );
};
