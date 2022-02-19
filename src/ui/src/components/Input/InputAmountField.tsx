import {
  BoxProps,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  InputGroup,
  InputRightAddon,
  NumberInput,
  NumberInputField,
  Spacer,
  Text,
} from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import { FaWallet } from 'react-icons/fa';

interface InputAmountFieldProps extends BoxProps {
  balance: number;
  symbol: string;
}

export const validateAmount = (value: number, balance: number) => {
  return value <= balance;
};

export const InputAmountField = ({ balance, symbol, ...boxProps }: InputAmountFieldProps) => {
  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext();

  const amount = register('amount', {
    valueAsNumber: true,
    required: 'Amount is required',
    validate: { insufficientFunds: (value) => validateAmount(value, balance) },
  });

  return (
    <FormControl {...boxProps} isInvalid={errors.amount} isRequired>
      <Flex>
        <FormLabel htmlFor="amount">amount</FormLabel>
        <Spacer />
        <Flex align="center" gap={1}>
          <Icon as={FaWallet} h={'12px'} w={'12px'} />
          <Text fontSize="sm">
            {balance} {symbol}
          </Text>
        </Flex>
      </Flex>

      <InputGroup>
        <NumberInput min={0} w="100%">
          <NumberInputField
            id="amount"
            name={amount.name}
            onChange={(e) => {
              amount.onChange(e);
              trigger(amount.name);
            }}
            onBlur={amount.onBlur}
            ref={amount.ref}
          />
          {/* <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper> */}
        </NumberInput>
        <InputRightAddon children={symbol} />
      </InputGroup>
      <FormErrorMessage>
        {errors.amount?.type === 'required' && 'Amount is required'}
        {errors.amount?.type === 'insufficientFunds' && 'Insufficient funds'}
      </FormErrorMessage>
    </FormControl>
  );
};