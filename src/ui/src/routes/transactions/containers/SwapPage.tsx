import { Container, useDisclosure, useToast } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { Transaction as ParaswapTx } from 'paraswap';
import { useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { formatBigNumber } from '../../../bignumber-utils';
import { usePool } from '../../../hooks/usePool';
import { useWeb3Auth } from '../../../hooks/useWeb3Auth';
import { onTransactionComplete } from '../../../services/blockchainServices';
import { approveToken, swapTokens } from '../../../services/transactionsServices';
import { TransactionType } from '../../../types';
import {
  ConfirmTransactionRef, ReviewTransactionModal
} from '../components/ReviewTransactionModal';
import { SubmittingTransactionModal } from '../components/SubmittingTransactionModal';
import { ApproveArgs, SwapArgs, SwapCard } from '../components/SwapCard';
import {
  TransactionSubmittedModal,
  TransactionSubmittedModalRef
} from '../components/TransactionSubmittedModal';

const DEFAULT_ALLOWED_SLIPPAGE = 0.01; //1%

export const SwapPage = () => {
  const { pool } = usePool();
  const { isOpen: isSubmitting, onOpen, onClose } = useDisclosure();
  const { provider } = useWeb3Auth();
  const signer = (provider as Web3Provider)?.getSigner();
  const confirmationRef = useRef<TransactionSubmittedModalRef>(null);
  const confirmTxRef = useRef<ConfirmTransactionRef>(null);
  const toast = useToast();
  const [type, setType] = useState<TransactionType>('swap');

  const confirmApprove = (approveArg: ApproveArgs) => {
    const { tokenFrom } = approveArg;
    confirmTxRef.current?.open(
      `Unlock token ${tokenFrom.symbol} `,
      'unlockToken',
      approveArg,
      onConfirmApprove,
    );
  };

  const onConfirmApprove = async (confirmed: boolean, args: ApproveArgs) => {
    const { paraswapProxy, tokenFrom, callback } = args;
    if (!pool || !confirmed) return;

    setType('unlockToken');
    onOpen();
    try {
      const tx = await approveToken(
        signer,
        pool,
        undefined, //state.srcAmount,
        paraswapProxy,
        tokenFrom,
      );

      if (tx?.hash) onTransactionComplete(pool.chain_id, tx.hash, callback);

      confirmationRef.current?.open(tx);
    } catch (e: any) {
      const message = typeof e === 'string' ? e : e.message;
      toast({
        title: message,
        status: 'error',
        isClosable: true,
      });
      throw e;
    } finally {
      onClose();
    }
  };

  const confirmSwap = (swapArg: SwapArgs) => {
    const { tokenFrom, tokenTo, priceRoute } = swapArg;
    confirmTxRef.current?.open(
      `Swap ${formatBigNumber(priceRoute.srcAmount, tokenFrom.decimals)} ${
        tokenFrom.symbol
      } for ${formatBigNumber(priceRoute.destAmount, tokenTo.decimals)} ${tokenTo.symbol}`,
      'swap',
      swapArg,
      onConfirmSwap,
    );
  };

  const onConfirmSwap = async (
    confirmed: boolean,
    { txParams, tokenFrom, tokenTo, priceRoute, callback }: SwapArgs,
  ) => {
    if (!pool || !confirmed) return;

    setType('swap');
    onOpen();

    try {
      const tx = await swapTokens(
        signer,
        pool,
        txParams as ParaswapTx,
        tokenFrom,
        tokenTo,
        DEFAULT_ALLOWED_SLIPPAGE,
        priceRoute,
      );
      callback();

      confirmationRef.current?.open(tx);
    } catch (e: any) {
      const message = typeof e === 'string' ? e : e.message;
      toast({
        title: message,
        status: 'error',
        isClosable: true,
      });
    } finally {
      onClose();
    }
  };

  return (
    <>
      <Helmet>
        <title>Swap token | {pool?.name}</title>
      </Helmet>
      <Container mt={20}>
        {pool && (
          <SwapCard
            address={pool.gnosis_safe_address}
            chain_id={pool.chain_id}
            pool_id={pool.id}
            defaultTokenAddress={pool.token?.address}
            onSwap={confirmSwap}
            onApproveToken={confirmApprove}
            isSubmitting={isSubmitting}
          />
        )}
      </Container>
      <TransactionSubmittedModal ref={confirmationRef} chainId={pool?.chain_id} />
      <SubmittingTransactionModal type={type} isOpen={isSubmitting} onClose={onClose} />
      <ReviewTransactionModal ref={confirmTxRef} />
    </>
  );
};
