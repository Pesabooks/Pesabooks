import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast
} from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { Transaction as ParaswapTx } from 'paraswap';
import { useRef, useState } from 'react';
import { formatBigNumber } from '../../../bignumber-utils';
import { useWeb3Auth } from '../../../hooks/useWeb3Auth';
import { onTransactionComplete } from '../../../services/blockchainServices';
import { fee } from '../../../services/estimationService';
import { approveToken, estimateApprove, swapTokens } from '../../../services/walletServices';
import { TransactionType } from '../../../types';
import {
  ReviewTransactionModal,
  ReviewTransactionModalRef
} from '../../transactions/components/ReviewTransactionModal';
import {
  SubmittingTransactionModal,
  SubmittingTxModalRef
} from '../../transactions/components/SubmittingTransactionModal';
import { ApproveArgs, SwapArgs, SwapCard } from '../../transactions/components/SwapCard';

export interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  chainId: number;
  assets: string[];
  onTxSubmitted: (type: TransactionType, hash: string) => void;
}

export const SwapModal = ({
  isOpen,
  onClose,
  onTxSubmitted,
  address,
  chainId,
  assets,
}: SwapModalProps) => {
  const { provider } = useWeb3Auth();
  const signer = (provider as Web3Provider)?.getSigner();
  const confirmTxRef = useRef<ReviewTransactionModalRef>(null);
  const submittingRef = useRef<SubmittingTxModalRef>(null);
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const confirmSwap = async (swapArg: SwapArgs) => {
    const { tokenFrom, tokenTo, priceRoute } = swapArg;
    const gasfee = await fee(provider!, BigNumber.from(priceRoute.gasCost));

    confirmTxRef.current?.openWithEstimate(
      `Swap ${formatBigNumber(priceRoute.srcAmount, tokenFrom.decimals)} ${
        tokenFrom.symbol
      } for ${formatBigNumber(priceRoute.destAmount, tokenTo.decimals)} ${tokenTo.symbol}`,
      'swap',
      swapArg,
      onConfirmSwap,
      gasfee,
      // ethers.utils.parseUnits(priceRoute.gasCost, 18)
    );
  };

  const onConfirmSwap = async (
    confirmed: boolean,
    { txParams, tokenFrom, tokenTo, priceRoute, callback }: SwapArgs,
  ) => {
    if (!confirmed) return;

    submittingRef.current?.open('swap');
    setIsSubmitting(true);

    try {
      const tx = await swapTokens(signer, txParams as ParaswapTx, tokenFrom, tokenTo, priceRoute);
      callback();
      if (tx) onTxSubmitted('swap', tx.hash);
      onClose();
    } catch (e: any) {
      const message = typeof e === 'string' ? e : e.message;
      toast({
        title: message,
        status: 'error',
        isClosable: true,
      });
    } finally {
      submittingRef.current?.close();
      setIsSubmitting(false);
    }
  };

  const confirmApprove = async (approveArg: ApproveArgs) => {
    const { paraswapProxy, tokenFrom, amount } = approveArg;
    const estimatedFee = await estimateApprove(provider!, paraswapProxy, tokenFrom, amount);
    confirmTxRef.current?.openWithEstimate(
      `Unlock token ${tokenFrom.symbol} `,
      'unlockToken',
      approveArg,
      onConfirmApprove,
      estimatedFee,
    );
  };

  const onConfirmApprove = async (confirmed: boolean, args: ApproveArgs) => {
    if (!confirmed) return;
    const { paraswapProxy, tokenFrom, callback, amount } = args;

    submittingRef.current?.open('unlockToken');
    setIsSubmitting(true);
    try {
      const tx = await approveToken(signer, chainId, amount, paraswapProxy, tokenFrom);

      if (tx?.hash) onTransactionComplete(chainId, tx.hash, callback);

      onTxSubmitted('swap', tx.hash);
    } catch (e: any) {
      const message = typeof e === 'string' ? e : e.message;
      toast({
        title: message,
        status: 'error',
        isClosable: true,
      });
      throw e;
    } finally {
      submittingRef.current?.close();
      setIsSubmitting(false);
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
            <SwapCard
              address={address}
              chain_id={chainId}
              defaultTokenAddress={assets?.[0]}
              onSwap={confirmSwap}
              onApproveToken={confirmApprove}
              isSubmitting={isSubmitting}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <SubmittingTransactionModal ref={submittingRef} />
      <ReviewTransactionModal ref={confirmTxRef} />
    </>
  );
};
