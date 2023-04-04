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
import { useRef } from 'react';
import { formatBigNumber } from '../../../bignumber-utils';
import { useWeb3Auth } from '../../../hooks/useWeb3Auth';
import { fee } from '../../../services/estimationService';
import { approveToken, estimateApprove, swapTokens } from '../../../services/walletServices';
import {
  ReviewAndSendTransactionModal,
  ReviewAndSendTransactionModalRef
} from '../../transactions/components/ReviewAndSendTransactionModal';
import { ApproveArgs, SwapArgs, SwapCard } from '../../transactions/components/SwapCard';

export interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  chainId: number;
  assets: string[];
}

export const SwapModal = ({ isOpen, onClose, address, chainId, assets }: SwapModalProps) => {
  const { provider } = useWeb3Auth();
  const signer = (provider as Web3Provider)?.getSigner();
  const reviewTxRef = useRef<ReviewAndSendTransactionModalRef>(null);
  const toast = useToast();

  const confirmSwap = async (swapArg: SwapArgs) => {
    const { tokenFrom, tokenTo, priceRoute } = swapArg;

    reviewTxRef.current?.open(
      `Swap ${formatBigNumber(priceRoute.srcAmount, tokenFrom.decimals)} ${
        tokenFrom.symbol
      } for ${formatBigNumber(priceRoute.destAmount, tokenTo.decimals)} ${tokenTo.symbol}`,
      'swap',
      () => fee(provider!, BigNumber.from(priceRoute.gasCost)),
      () => swap(swapArg),
    );
  };

  const swap = async ({ txParams, tokenFrom, tokenTo, priceRoute }: SwapArgs) => {
    const tx = await swapTokens(signer, txParams as ParaswapTx, tokenFrom, tokenTo, priceRoute);

    onClose();
    return {
      hash: tx?.hash,
    };
  };

  const confirmApprove = async (approveArg: ApproveArgs) => {
    const { paraswapProxy, tokenFrom, amount } = approveArg;

    reviewTxRef.current?.open(
      `Unlock token ${tokenFrom.symbol} `,
      'unlockToken',
      () => estimateApprove(provider!, paraswapProxy, tokenFrom, amount),
      () => onConfirmApprove(approveArg),
    );
  };

  const onConfirmApprove = async (args: ApproveArgs) => {
    const { paraswapProxy, tokenFrom, amount } = args;

    try {
      const tx = await approveToken(signer, chainId, amount, paraswapProxy, tokenFrom);

      return {
        hash: tx?.hash,
      };
    } catch (e: any) {
      const message = typeof e === 'string' ? e : e.message;
      toast({
        title: message,
        status: 'error',
        isClosable: true,
      });
      throw e;
    }
  };

  return (
    <>
      <Modal size="lg" isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Swap</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SwapCard
              address={address}
              chain_id={chainId}
              defaultTokenAddress={assets?.[0]}
              onSwap={confirmSwap}
              onApproveToken={confirmApprove}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <ReviewAndSendTransactionModal ref={reviewTxRef} />
    </>
  );
};
