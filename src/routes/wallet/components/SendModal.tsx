import {
    Button,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Stack,
    Text
} from '@chakra-ui/react';
import { InputAmountField } from '@pesabooks/components/Input/InputAmountField';
import {
    ReviewAndSendTransactionModal,
    ReviewAndSendTransactionModalRef
} from '@pesabooks/components/ReviewAndSendTransactionModal';
import { useWeb3Auth } from '@pesabooks/hooks';
import { TokenBalance } from '@pesabooks/services/covalentServices';
import { fee } from '@pesabooks/services/estimationService';
import {
    estimateTokenTransfer,
    sendNativeToken,
    sendToken
} from '@pesabooks/services/walletServices';
import { formatBigNumber } from '@pesabooks/utils/bignumber-utils';
import { chakraComponents, GroupBase, OptionProps, Select } from 'chakra-react-select';
import { BigNumber, ethers } from 'ethers';
import { useEffect, useRef } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

export interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  chainId: number;
  balances: TokenBalance[];
}

export interface SendFormValue {
  amount: number;
  token: TokenBalance;
  address: string;
}

const IconOption = (props: OptionProps<TokenBalance, boolean, GroupBase<TokenBalance>>) => {
  return (
    <chakraComponents.Option {...props}>
      <Flex align="center">
        <Image w="20px" h="20px" src={props.data.token.image} alt={props.data.token.symbol} />
        <Text ml="10px">{props.data.token.symbol}</Text>
      </Flex>
    </chakraComponents.Option>
  );
};

export const SendModal = ({ isOpen, onClose, chainId, balances }: SendModalProps) => {
  const { provider } = useWeb3Auth();
  const reviewTxRef = useRef<ReviewAndSendTransactionModalRef>(null);

  const methods = useForm<SendFormValue>();
  const {
    register,
    getValues,
    trigger,
    watch,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  const selectedToken: TokenBalance = watch('token');

  useEffect(() => {
    const a = getValues('amount');
    if (a) trigger('amount');
  }, [getValues, selectedToken, trigger]);

  const addressControl = register('address', {
    validate: { invalid: ethers.utils.isAddress },
  });

  const estimate = async (formValue: SendFormValue) => {
    const { amount, token, address } = formValue;

    if (token.token.is_native) {
      return fee(provider!, BigNumber.from(21000));
    } else {
      return estimateTokenTransfer(provider!, address, token.token.address, amount);
    }
  };

  const send = async (formValue: SendFormValue) => {
    const signer = provider!.getSigner();
    const { amount, token, address } = formValue;

    let tx: ethers.providers.TransactionResponse;

    if (token.token.is_native) {
      tx = await sendNativeToken(signer, chainId, amount, address);
    } else {
      tx = await sendToken(signer, chainId, amount, address, token.token);
    }

    reset();
    onClose();
    return {
      hash: tx?.hash,
    };
  };

  const confirmTx = async (formValue: SendFormValue) => {
    const { amount, token, address } = formValue;

    reviewTxRef.current?.open(
      `Send ${amount} ${token?.token.symbol} to ${address}`,
      'withdrawal',
      () => estimate(formValue),
      () => send(formValue),
    );
  };

  return (
    <>
      <Modal size="lg" isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(confirmTx)}>
                <Stack spacing={5}>
                  <Controller
                    control={control}
                    name="token"
                    render={({
                      field: { onChange, onBlur, value, name, ref },
                      fieldState: { invalid, error },
                    }) => (
                      <FormControl isInvalid={invalid} id="token">
                        <FormLabel>Asset</FormLabel>

                        <Select
                          name={name}
                          ref={ref}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          options={balances}
                          placeholder="Select a token"
                          getOptionLabel={(t) => `${t.token.symbol}`}
                          getOptionValue={(t) => t.token.address}
                          components={{ Option: IconOption }}
                        />

                        <FormErrorMessage>{error && error.message}</FormErrorMessage>
                      </FormControl>
                    )}
                  />

                  <InputAmountField
                    balance={formatBigNumber(
                      selectedToken?.balance ?? 0,
                      selectedToken?.token.decimals,
                    )}
                    symbol={selectedToken?.token.symbol}
                  />

                  <FormControl isInvalid={!!errors.address} id="address">
                    <FormLabel>Address</FormLabel>
                    <Input {...addressControl} />
                    <FormErrorMessage>
                      {errors.address?.type === 'invalid' && 'Invalid address'}
                    </FormErrorMessage>
                  </FormControl>

                  <Button mt={4} isLoading={isSubmitting} type="submit">
                    Review
                  </Button>
                </Stack>
              </form>
            </FormProvider>
          </ModalBody>
        </ModalContent>
      </Modal>
      <ReviewAndSendTransactionModal ref={reviewTxRef} />
    </>
  );
};
