import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Center,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react';
import { BigNumber, ethers } from 'ethers';
import { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatBigNumber } from '../../../bignumber-utils';
import Loading from '../../../components/Loading';
import { TransactionIcon } from '../../../components/TransactionIcon';
import { networks } from '../../../data/networks';
import { useNativeBalance } from '../../../hooks/useNativeBalance';
import { usePool } from '../../../hooks/usePool';
import { useSafeAdmins } from '../../../hooks/useSafeAdmins';
import { useWeb3Auth } from '../../../hooks/useWeb3Auth';
import {
  estimateAddOwner,
  estimateApprove,
  estimateRemoveOwner,
  estimateSafeCreation,
  estimateSwap,
  estimateTransaction,
  estimateTransfer,
  estimateWithdraw
} from '../../../services/estimationService';
import { TransactionType } from '../../../types';
import { getTransactionTypeLabel } from '../../../utils';
import { AddAdminFormValue } from '../../settings/components/addAdminModal';
import { RemoveAdminFormValue } from '../../settings/components/RemoveAdminModal';
import { DepositFormValue } from '../containers/DepositPage';
import { WithdrawFormValue } from '../containers/WithdrawPage';
import { ApproveArgs, SwapArgs } from './SwapCard';

type DataType = any | null;
type callbackfn = (confirmed: boolean, data?: any) => void | Promise<void>;

export type ReviewTransactionFn = (
  message: string,
  type: TransactionType,
  data: DataType | null,
  onConfirm: callbackfn,
  safeTx?: string,
) => void;

export type ReviewTransactionWithEstimateFn = (
  message: string,
  type: TransactionType,
  data: any | null,
  onConfirm: callbackfn,
  estimatedFee: BigNumber | undefined,
) => void;

export interface ReviewTransactionModalRef {
  open: ReviewTransactionFn;
  openWithEstimate: ReviewTransactionWithEstimateFn;
}

export interface ReviewTransactionModalProps {
  ref: Ref<ReviewTransactionModalRef>;
}

interface State {
  type: TransactionType;
  data: any | null;
  message: string;
  safeTxHash?: string;
}

export const ReviewTransactionModal = forwardRef(
  (_: ReviewTransactionModalProps, ref: Ref<ReviewTransactionModalRef>) => {
    const { isOpen, onClose, onOpen } = useDisclosure();
    const [state, setState] = useState<State>();
    const { pool } = usePool();
    const { provider, chainId } = useWeb3Auth();
    const { balance } = useNativeBalance();
    const [error, setError] = useState<'insufficientFunds' | 'willFail' | undefined>();
    const navigate = useNavigate();
    const network = networks[chainId];
    const bgColor = useColorModeValue('white', 'gray.900');
    const txtColor = useColorModeValue('gray.700', 'gray.400');
    const [fee, setFee] = useState<BigNumber | undefined>(undefined);
    const [isEstimating, setIsEstimating] = useState(true);
    const { threshold } = useSafeAdmins();

    const onConfirmRef = useRef<any>();

    useImperativeHandle(ref, () => ({
      openWithEstimate: (
        message: string,
        type: TransactionType,
        data: DataType,
        onConfirm,
        estimatedFee: BigNumber | undefined,
      ) => {
        setState({ message, data, type });
        onOpen();
        setFee(estimatedFee);
        onConfirmRef.current = (confirmed: boolean, data?: any) => onConfirm(confirmed, data);
      },
      open: async (
        message: string,
        type: TransactionType,
        data: DataType,
        onConfirm,
        safeTxHash?: string,
      ) => {
        setState({ message, data, type, safeTxHash });
        onOpen();

        await estimate(type, data, safeTxHash);

        onConfirmRef.current = (confirmed: boolean, data?: any) => onConfirm(confirmed, data);
      },
    }));

    const close = (confirmed: boolean) => {
      onClose();
      setFee(undefined);
      setIsEstimating(true);
      setError(undefined);
      onConfirmRef.current?.(confirmed, state?.data);
    };

    const estimate = async (
      type: TransactionType,
      data: DataType,
      safeTxHash: string | undefined,
    ) => {
      if (provider && pool?.token?.address) {
        let estimatedFee: BigNumber | undefined;

        try {
          if (safeTxHash) {
            estimatedFee = await estimateTransaction(
              provider,
              chainId,
              pool.gnosis_safe_address!,
              safeTxHash,
            );
          } else {
            if (isProposal(type, safeTxHash)) {
              estimatedFee = BigNumber.from(0);
            } else {
              switch (type) {
                case 'deposit':
                  const depositFormValue = data as DepositFormValue;
                  estimatedFee = await estimateTransfer(
                    provider,
                    pool?.token?.address,
                    depositFormValue.amount,
                    pool?.gnosis_safe_address!,
                  );
                  break;

                case 'createSafe':
                  estimatedFee = await estimateSafeCreation(provider);
                  break;
                case 'swap':
                  const swapArgs = data as SwapArgs;
                  estimatedFee = await estimateSwap(provider, swapArgs.txParams);
                  break;
                case 'withdrawal':
                  const withdrawFormValue = data as WithdrawFormValue;
                  estimatedFee = await estimateWithdraw(
                    provider,
                    chainId,
                    pool.gnosis_safe_address!,
                    withdrawFormValue.user.wallet,
                    ethers.utils.parseUnits(
                      withdrawFormValue.amount.toString(),
                      pool?.token.decimals,
                    ),
                  );
                  break;
                case 'unlockToken':
                  const approveArg = data as ApproveArgs;
                  estimatedFee = await estimateApprove(
                    provider,
                    chainId,
                    pool.gnosis_safe_address!,
                    approveArg.paraswapProxy,
                  );
                  break;
                case 'addOwner':
                  const addAdminArg = data as AddAdminFormValue;
                  estimatedFee = await estimateAddOwner(
                    provider,
                    pool.chain_id,
                    pool.gnosis_safe_address!,
                    addAdminArg.user.wallet,
                    addAdminArg.threshold,
                  );
                  break;
                case 'removeOwner':
                  const removeAdminArg = data as RemoveAdminFormValue;
                  estimatedFee = await estimateRemoveOwner(
                    provider,
                    pool.chain_id,
                    pool.gnosis_safe_address!,
                    removeAdminArg.user.wallet,
                    removeAdminArg.threshold,
                  );
                  break;
                default:
                  break;
              }
            }
          }

          setFee(estimatedFee);
        } catch (error) {
          setError('willFail');
        } finally {
          setIsEstimating(false);
        }
      }
    };

    const isProposal = (type: TransactionType | undefined, safeTxHash: string | undefined) => {
      if (!type) return undefined;

      const nonProposalTypes: TransactionType[] = ['deposit', 'createSafe', 'purchase'];
      if (!pool || nonProposalTypes.includes(type)) {
        return false;
      } else if (threshold === 1) return false;
      else return !safeTxHash;
    };

    useEffect(() => {
      if (fee) {
        if (balance.lt(fee)) setError('insufficientFunds');
      }
    }, [balance, fee, network.nativeCurrency.decimals]);

    return (
      <Modal
        size="md"
        isOpen={isOpen}
        onClose={() => close(false)}
        closeOnOverlayClick={false}
        closeOnEsc={false}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader> {getTransactionTypeLabel(state?.type)}</ModalHeader>
          <ModalCloseButton />
          <ModalBody mb={50}>
            <Stack gap={5}>
              <Box bg={bgColor} boxShadow={'2xl'} rounded={'lg'} p={6} textAlign={'center'}>
                <Center>{state?.type && <TransactionIcon type={state?.type} />}</Center>
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
              </Flex>
            </Stack>
          </ModalBody>

          {error === 'willFail' && !!state?.safeTxHash && (
            <Alert status="error">
              <AlertIcon />
              <AlertDescription>
                This transaction will most likely fail. To save gas costs, reject this transaction.
              </AlertDescription>
            </Alert>
          )}

          {error !== 'insufficientFunds' && (
            <ModalFooter>
              <Button variant="outline" onClick={() => close(false)}>
                Cancel
              </Button>
              <Spacer />
              <Button onClick={() => close(true)}>
                {isProposal(state?.type, state?.safeTxHash) ? 'Propose' : 'Submit'}
              </Button>
            </ModalFooter>
          )}

          {error === 'insufficientFunds' && (
            <Stack mx={15} p={5}>
              <Button onClick={() => navigate('/wallet')}>Add Funds</Button>
              <Alert status="error">
                <AlertIcon /> Insufficient funds in your pesabooks wallet
              </Alert>
            </Stack>
          )}
        </ModalContent>
      </Modal>
    );
  },
);
