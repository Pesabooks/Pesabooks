import {
  BoxProps,
  Button,
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
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FaWallet } from 'react-icons/fa';
import { formatLongNumber } from '../../bignumber-utils';

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
  const [amountValue, setAmountValue] = useState('');
  const {
    register,
    trigger,
    setValue,
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

  const fillMaxAmount = () => {
    setValue(amount.name, balance);
    setAmountValue(`${balance}`);
    trigger(amount.name);
  };

  return (
    <FormControl {...boxProps} isInvalid={errors.amount} isRequired>
      <Flex>
        <FormLabel htmlFor="amount">Amount</FormLabel>
        <Spacer />
        <Flex align="center" gap={1}>
          {balance !== undefined && (
            <Button
              onClick={fillMaxAmount}
              size="xs"
              colorScheme="white"
              leftIcon={<FaWallet />}
              variant="link"
            >
              <Text fontSize="sm">
                Balance: {formatLongNumber(balance)} {symbol}
              </Text>
            </Button>
          )}
        </Flex>
      </Flex>

      <InputGroup>
        <NumberInput
          min={0}
          w="100%"
          value={amountValue}
          onChange={(valueString) => setAmountValue(valueString)}
        >
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
