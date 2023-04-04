import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  CloseButton,
  Container,
  useDisclosure
} from '@chakra-ui/react';
import { Transaction as ParaswapTx } from 'paraswap';
import { useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { formatBigNumber } from '../../../bignumber-utils';

import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { usePool } from '../../../hooks/usePool';
import { useSafeAdmins } from '../../../hooks/useSafeAdmins';
import { useWeb3Auth } from '../../../hooks/useWeb3Auth';
import { estimateSwap, estimateTransaction } from '../../../services/estimationService';
import { buildApproveTokenTx, buildSwapTokensTx } from '../../../services/transaction-builder';
import { submitTransaction } from '../../../services/transactionsServices';
import {
  ReviewAndSendTransactionModal,
  ReviewAndSendTransactionModalRef
} from '../components/ReviewAndSendTransactionModal';
import { ApproveArgs, SwapArgs, SwapCard } from '../components/SwapCard';

export const SwapPage = () => {
  const { pool } = usePool();
  const { provider, user } = useWeb3Auth();
  const reviewTxRef = useRef<ReviewAndSendTransactionModalRef>(null);
  const { threshold } = useSafeAdmins();
  const { isOpen: isDeadlineWarningVisible, onClose: onCloseDeadlineWarning } = useDisclosure({
    defaultIsOpen: threshold > 1,
  });
  const signer = (provider as Web3Provider)?.getSigner();

  const approve = async (args: ApproveArgs) => {
    const { paraswapProxy, tokenFrom } = args;

    const transaction = await buildApproveTokenTx(
      pool!,
      undefined, //state.srcAmount,
      paraswapProxy,
      tokenFrom,
    );

    reviewTxRef.current?.open(
      `Unlock token ${tokenFrom.symbol} `,
      transaction.type,
      () =>
        threshold > 1
          ? Promise.resolve(BigNumber.from(0))
          : estimateTransaction(provider!, transaction.transaction_data),
      async () => {
        const tx = await submitTransaction(user!, signer, pool!, transaction!);
        return { hash: tx?.hash, internalTxId: tx?.id };
      },
    );
  };

  const swap = async ({ txParams, tokenFrom, tokenTo, priceRoute, slippage }: SwapArgs) => {
    if (!pool) return;

    reviewTxRef.current?.open(
      `Swap ${formatBigNumber(priceRoute.srcAmount, tokenFrom.decimals)} ${
        tokenFrom.symbol
      } for ${formatBigNumber(priceRoute.destAmount, tokenTo.decimals)} ${tokenTo.symbol}`,
      'swap',
      () =>
        threshold > 1 ? Promise.resolve(BigNumber.from(0)) : estimateSwap(provider!, txParams),
      async () => {
        const transaction = await buildSwapTokensTx(
          pool,
          txParams as ParaswapTx,
          tokenFrom,
          tokenTo,
          slippage,
          priceRoute,
        );

        const tx = await submitTransaction(user!, signer, pool!, transaction!);
        return { hash: tx?.hash, internalTxId: tx?.id };
      },
    );
  };

  return (
    <>
      <Helmet>
        <title>Swap token | {pool?.name}</title>
      </Helmet>
      <Container mt={20}>
        {isDeadlineWarningVisible && (
          <Alert status="warning" mb={5}>
            <AlertIcon />
            <Box>
              <AlertTitle>Swap deadline!</AlertTitle>
              <AlertDescription>
                Swap transaction should be approved and executed in 5min. Otherwise, the transaction
                will be reverted. Get your team ready.
              </AlertDescription>
            </Box>
            <CloseButton
              alignSelf="flex-start"
              position="relative"
              right={-1}
              top={-1}
              onClick={onCloseDeadlineWarning}
            />
          </Alert>
        )}

        {pool && (
          <SwapCard
            address={pool.gnosis_safe_address!}
            chain_id={pool.chain_id}
            pool_id={pool.id}
            defaultTokenAddress={pool.token?.address}
            onSwap={swap}
            onApproveToken={approve}
          />
        )}
      </Container>
      <ReviewAndSendTransactionModal ref={reviewTxRef} />
    </>
  );
};
