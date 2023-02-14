import { Container, useToast } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { Transaction as ParaswapTx } from 'paraswap';
import { useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { formatBigNumber } from '../../../bignumber-utils';
import {
  ReviewAndSubmitTransaction,
  ReviewAndSubmitTransactionRef
} from '../../../components/ReviewAndSubmitTransaction';
import { usePool } from '../../../hooks/usePool';
import { useWeb3Auth } from '../../../hooks/useWeb3Auth';
import { onTransactionComplete } from '../../../services/blockchainServices';
import { approveToken, swapTokens } from '../../../services/transactionsServices';
import { ApproveArgs, SwapArgs, SwapCard } from '../components/SwapCard';

export const SwapPage = () => {
  const { pool } = usePool();
  const { provider, user } = useWeb3Auth();
  const signer = (provider as Web3Provider)?.getSigner();
  const reviewTxRef = useRef<ReviewAndSubmitTransactionRef>(null);
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const confirmApprove = (approveArg: ApproveArgs) => {
    const { tokenFrom } = approveArg;
    reviewTxRef.current?.review(
      `Unlock token ${tokenFrom.symbol} `,
      'unlockToken',
      approveArg,
      onConfirmApprove,
    );
  };

  const onConfirmApprove = async (confirmed: boolean, args: ApproveArgs) => {
    const { paraswapProxy, tokenFrom, callback } = args;
    if (!pool || !confirmed) return;

    reviewTxRef.current?.openSubmitting('unlockToken');
    setIsSubmitting(true);
    try {
      const tx = await approveToken(
        user!,
        signer,
        pool,
        undefined, //state.srcAmount,
        paraswapProxy,
        tokenFrom,
      );

      if (tx?.hash) onTransactionComplete(pool.chain_id, tx.hash, callback);
      if (tx) reviewTxRef.current?.openTxSubmitted(tx?.type, tx?.hash, tx?.id);
    } catch (e: any) {
      const message = typeof e === 'string' ? e : e.message;
      toast({
        title: message,
        status: 'error',
        isClosable: true,
      });
      throw e;
    } finally {
      reviewTxRef.current?.closeSubmitting();
      setIsSubmitting(false);
    }
  };

  const confirmSwap = (swapArg: SwapArgs) => {
    const { tokenFrom, tokenTo, priceRoute } = swapArg;
    reviewTxRef.current?.review(
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
    { txParams, tokenFrom, tokenTo, priceRoute, slippage, callback }: SwapArgs,
  ) => {
    if (!pool || !confirmed) return;

    reviewTxRef.current?.openSubmitting('swap');
    setIsSubmitting(true);

    try {
      const tx = await swapTokens(
        user!,
        signer,
        pool,
        txParams as ParaswapTx,
        tokenFrom,
        tokenTo,
        slippage,
        priceRoute,
      );
      callback();
      if (tx) reviewTxRef.current?.openTxSubmitted(tx.type, tx.hash, tx.id);
    } catch (e: any) {
      const message = typeof e === 'string' ? e : e.message;
      toast({
        title: message,
        status: 'error',
        isClosable: true,
      });
    } finally {
      reviewTxRef.current?.closeSubmitting();
      setIsSubmitting(false);
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
            address={pool.gnosis_safe_address!}
            chain_id={pool.chain_id}
            pool_id={pool.id}
            defaultTokenAddress={pool.token?.address}
            onSwap={confirmSwap}
            onApproveToken={confirmApprove}
            isSubmitting={isSubmitting}
          />
        )}
      </Container>
      <ReviewAndSubmitTransaction ref={reviewTxRef} chainId={pool!.chain_id} />
    </>
  );
};
