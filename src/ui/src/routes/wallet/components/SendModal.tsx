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
  Text,
  useToast
} from '@chakra-ui/react';
import { chakraComponents, GroupBase, OptionProps, Select } from 'chakra-react-select';
import { BigNumber, ethers } from 'ethers';
import { useEffect, useRef } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { formatBigNumber } from '../../../bignumber-utils';
import { InputAmountField } from '../../../components/Input/InputAmountField';
import { useWeb3Auth } from '../../../hooks/useWeb3Auth';
import { TokenBalance } from '../../../services/covalentServices';
import { fee } from '../../../services/estimationService';
import {
  estimateTokenTransfer,
  sendNativeToken,
  sendToken
} from '../../../services/walletServices';
import { TransactionType } from '../../../types';
import {
  ReviewTransactionModal,
  ReviewTransactionModalRef
} from '../../transactions/components/ReviewTransactionModal';
import {
  SubmittingTransactionModal,
  SubmittingTxModalRef
} from '../../transactions/components/SubmittingTransactionModal';

export interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTxSubmitted: (type: TransactionType, hash: string) => void;
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

export const SendModal = ({
  isOpen,
  onClose,
  onTxSubmitted: onSent,
  chainId,
  balances,
}: SendModalProps) => {
  const { provider } = useWeb3Auth();
  const toast = useToast();
  const reviewTxRef = useRef<ReviewTransactionModalRef>(null);
  const submittingRef = useRef<SubmittingTxModalRef>(null);

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

  const confirmTx = async (formValue: SendFormValue) => {
    const { amount, token, address } = formValue;

    let estimatedFee: BigNumber | undefined;

    if (token.token.is_native) {
      estimatedFee = await fee(provider!, BigNumber.from(21000));
    } else {
      estimatedFee = await estimateTokenTransfer(provider!, address, token.token.address, amount);
    }

    reviewTxRef.current?.openWithEstimate(
      `Send ${amount} ${token?.token.symbol} to ${address}`,
      'withdrawal',
      formValue,
      send,
      estimatedFee,
    );
  };

  const send = async (confirmed: boolean, formValue: SendFormValue) => {
    if (!provider || !confirmed) return;
    const signer = provider.getSigner();
    submittingRef.current?.open('withdrawal');
    const { amount, token, address } = formValue;

    let tx: ethers.providers.TransactionResponse;
    try {
      if (token.token.is_native) {
        tx = await sendNativeToken(signer, chainId, amount, address);
      } else {
        tx = await sendToken(signer, chainId, amount, address, token.token);
      }

      if (tx) onSent('withdrawal', tx.hash);

      reset();
      onClose();
    } catch (e: any) {
      const message = typeof e === 'string' ? e : e.message;
      toast({
        title: message,
        status: 'error',
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Modal size="lg" isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reiceive Funds</ModalHeader>
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
      <SubmittingTransactionModal ref={submittingRef} />
      <ReviewTransactionModal ref={reviewTxRef} />
    </>
  );
};
