import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Center,
  Flex,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useNativeBalance, useWeb3Auth } from '@pesabooks/hooks';
import { getTxScanLink } from '@pesabooks/services/transactionsServices';
import { formatBigNumber } from '@pesabooks/utils/bignumber-utils';
import { getTransactionTypeLabel } from '@pesabooks/utils/transactions-utils';
import { BigNumber } from 'ethers';
import {
  Reducer,
  Ref,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useReducer,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { networks } from '../data/networks';
import { TransactionType } from '../types';
import Loading from './Loading';
import { TransactionIcon } from './TransactionIcon';

export type ExecutionResponse = { hash?: string | null; internalTxId?: number };
interface options {
  labelSubmit?: string;
  closeOnSuccess?: boolean;
}

export type ReviewTransactionFn = (
  message: string,
  type: TransactionType,
  estimateFn: () => Promise<BigNumber | undefined>,
  executeFn: () => Promise<ExecutionResponse | void>,
  options?: options,
) => void;

export interface ReviewAndSendTransactionModalRef {
  open: ReviewTransactionFn;
}

export interface ReviewAndSendTransactionModalProps {
  ref: Ref<ReviewAndSendTransactionModalRef>;
}

interface State {
  type?: TransactionType;
  message?: string;
  internalTxId?: number;
  hash?: string | null;
  status: 'reviewing' | 'submitting' | 'submitted';
  fee?: BigNumber;
  executeFn: () => Promise<ExecutionResponse | void>;
  isEstimating: boolean;
  error?: { code: 'insufficientFunds' | 'willFail'; reason: string };
}

const IninitialState: State = {
  status: 'reviewing',
  executeFn: () => Promise.resolve({}),
  isEstimating: false,
};

interface Action {
  type: 'init' | 'estimating' | 'estimate' | 'submitting' | 'submitted' | 'review' | 'error';
  payload: Partial<State>;
}

const reducer: Reducer<State, Action> = (state = IninitialState, action: Action) => {
  const { type, payload } = action;
  switch (type) {
    case 'init':
      return {
        ...state,
        ...payload,
        error: undefined,
        isEstimating: false,
        fee: undefined,
        status: 'reviewing',
      };
    case 'review':
      return {
        ...state,
        status: 'reviewing',
      };
    case 'estimating':
      return {
        ...state,
        isEstimating: true,
      };
    case 'estimate':
      return {
        ...state,
        ...payload,
        isEstimating: false,
      };
    case 'submitting':
      return {
        ...state,
        status: 'submitting',
      };
    case 'submitted':
      return {
        ...state,
        ...payload,
        status: 'submitted',
      };
    case 'error':
      return {
        ...state,
        status: 'reviewing',
        error: payload.error,
      };
    default:
      return state;
  }
};

export const ReviewAndSendTransactionModal = forwardRef(
  (_: ReviewAndSendTransactionModalProps, ref: Ref<ReviewAndSendTransactionModalRef>) => {
    const [state, dispatch] = useReducer(reducer, IninitialState);
    const { isOpen, onClose, onOpen } = useDisclosure();
    const { chainId } = useWeb3Auth();
    const { balance } = useNativeBalance();
    const toast = useToast();
    const [options, setOptions] = useState<options>({});

    const navigate = useNavigate();
    const network = networks[chainId];
    const bgColor = useColorModeValue('white', 'gray.900');
    const txtColor = useColorModeValue('gray.700', 'gray.400');

    const { error, fee, isEstimating, type, status, message } = state;

    const estimate = async (estimateFn: () => Promise<BigNumber | undefined>) => {
      try {
        dispatch({ type: 'estimating', payload: {} });
        const fee = await estimateFn();
        dispatch({ type: 'estimate', payload: { fee } });
      } catch (error: any) {
        dispatch({
          type: 'error',
          payload: { error: { code: 'willFail', reason: error?.reason }, isEstimating: false },
        });
      }
    };

    const execute = async () => {
      dispatch({ type: 'submitting', payload: {} });

      try {
        const tx = await state.executeFn();

        if (options.closeOnSuccess) {
          onClose();
        }

        dispatch({
          type: 'submitted',
          payload: {
            hash: tx?.hash,
            internalTxId: tx?.internalTxId,
          },
        });
      } catch (error: any) {
        //setError({ code: 'willFail', reason: error?.reason });
        const message = typeof error === 'string' ? error : error?.data?.message ?? error.message;
        toast({
          title: message,
          status: 'error',
          isClosable: true,
        });
        dispatch({ type: 'review', payload: {} });
        throw error;
      }
    };

    useImperativeHandle(ref, () => ({
      open: async (message, type, estimateFn, executeFn, options) => {
        setOptions(options ?? {});
        dispatch({ type: 'init', payload: { message, type, executeFn } });
        onOpen();
        estimate(estimateFn);
      },
    }));

    const close = () => {
      onClose();
    };

    const isProposal = () => fee?.eq(BigNumber.from(0));

    useEffect(() => {
      if (fee) {
        if (balance.lt(fee)) {
          dispatch({
            type: 'error',
            payload: { error: { code: 'insufficientFunds', reason: 'Insufficient funds' } },
          });
        }
      }
    }, [balance, fee, network.nativeCurrency.decimals]);

    const header = () => {
      switch (status) {
        case 'reviewing':
          return 'Review Transaction';
        case 'submitting':
          return 'Sending Transaction';
        case 'submitted':
          return 'Transaction Submitted';

        default:
          return 'Review Transaction';
      }
    };

    const ReviewingContent = () => (
      <>
        <ModalBody mb={50}>
          <Stack gap={5}>
            <Box bg={bgColor} boxShadow={'2xl'} rounded={'lg'} p={6} textAlign={'center'}>
              <Center>{state?.type && <TransactionIcon type={state.type} />}</Center>

              <Text mt={5} color={txtColor} px={3}>
                {state?.message}
              </Text>
            </Box>
            <Flex direction="column">
              <Flex justifyContent="space-between">
                <Text>Pesabooks Wallet:</Text>
                <Text>
                  {formatBigNumber(balance, network.nativeCurrency.decimals)}{' '}
                  {network?.nativeCurrency.symbol}
                </Text>
              </Flex>
              {(isEstimating || !!fee) && (
                <Flex justifyContent="space-between">
                  <Text>Estmimated gas:</Text>
                  {isEstimating ? (
                    <Loading size="sm" thickness="2px" />
                  ) : (
                    <Text>
                      {formatBigNumber(fee, network.nativeCurrency.decimals)}{' '}
                      {network?.nativeCurrency.symbol}
                    </Text>
                  )}
                </Flex>
              )}
            </Flex>
          </Stack>

          {error?.code === 'willFail' && (
            <Alert status="error" mt={10} alignItems="start">
              <AlertIcon />
              <Flex direction="column">
                <AlertDescription>
                  This transaction will most likely fail. To save gas costs, reject this
                  transaction.
                </AlertDescription>
                <AlertDescription mt={5}>
                  <b>Detail: </b> {error?.reason}
                </AlertDescription>
              </Flex>
            </Alert>
          )}
        </ModalBody>

        {error?.code !== 'insufficientFunds' && (
          <ModalFooter>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Spacer />
            <Button onClick={execute} disabled={isEstimating}>
              {options.labelSubmit ? options.labelSubmit : isProposal() ? 'Propose' : 'Submit'}
            </Button>
          </ModalFooter>
        )}

        {error?.code === 'insufficientFunds' && (
          <Stack mx={15} p={5}>
            <Button onClick={() => navigate('/wallet')}>Add Funds</Button>
            <Alert status="error">
              <AlertIcon /> Insufficient funds in your pesabooks wallet
            </Alert>
          </Stack>
        )}
      </>
    );

    const SubmittingContent = () => (
      <>
        <ModalBody>
          <Stack gap={5}>
            <Box bg={bgColor} boxShadow={'2xl'} rounded={'lg'} p={6} textAlign={'center'}>
              <Center>
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="blue.500"
                  size="xl"
                ></Spinner>
              </Center>
              <Text mt={5} color={txtColor} px={3}>
                {state?.message ?? getTransactionTypeLabel(state?.type)}
              </Text>
            </Box>
          </Stack>
        </ModalBody>
      </>
    );

    const SubmittedContent = () => (
      <>
        <ModalBody>
          {state && (
            <Stack gap={5}>
              <Box bg={bgColor} boxShadow={'2xl'} rounded={'lg'} p={6} textAlign={'center'}>
                <Center>{type && <TransactionIcon type={type} />}</Center>
                <Text mt={5} color={txtColor} px={3}>
                  {message ?? getTransactionTypeLabel(type)}
                </Text>
              </Box>

              {state?.internalTxId && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`../transactions?id=${state.internalTxId}`)}
                >
                  View Transaction
                </Button>
              )}
              {state?.hash && chainId && (
                <Link href={getTxScanLink(state.hash, chainId)} isExternal>
                  <Button variant="outline" rightIcon={<ExternalLinkIcon />} w="100%">
                    View Receipt
                  </Button>
                </Link>
              )}
            </Stack>
          )}
        </ModalBody>
      </>
    );

    return (
      <Modal
        size="lg"
        isOpen={isOpen}
        onClose={close}
        closeOnOverlayClick={false}
        closeOnEsc={false}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader> {header()}</ModalHeader>
          <ModalCloseButton />
          {state.status === 'reviewing' && <ReviewingContent />}
          {state.status === 'submitting' && <SubmittingContent />}
          {state.status === 'submitted' && <SubmittedContent />}
        </ModalContent>
      </Modal>
    );
  },
);
