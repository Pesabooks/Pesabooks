import {
  BoxProps,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  InputGroup,
  InputRightAddon,
  NumberInput,
  NumberInputField,
  Spacer,
  Text
} from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';

interface InputAmountFieldProps extends BoxProps {
  balance?: number;
  symbol: string;
}

export const validateAmount = (value: number, balance: number | undefined) => {
  if (balance === undefined) return true;
  return value <= balance;
};

export const vali = (value: number) => {
  return value > 0;
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
    validate: {
      insufficientFunds: (value) => validateAmount(value, balance),
      required: (value) => vali(value),
    },
  });

  return (
    <FormControl {...boxProps} isInvalid={errors.amount} isRequired>
      <Flex>
        <FormLabel htmlFor="amount">Amount</FormLabel>
        <Spacer />
        <Flex align="center" gap={1}>
          {balance !== undefined && (
            <Text fontSize="sm">
              Balance: {balance} {symbol}
            </Text>
          )}
          {/* <Icon as={FaWallet} h={'12px'} w={'12px'} /> */}
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
