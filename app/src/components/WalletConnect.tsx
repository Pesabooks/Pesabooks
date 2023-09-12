/* eslint-disable @typescript-eslint/no-unused-vars */

import { useDisclosure, useToast } from '@chakra-ui/react';

import { usePool, useWalletConnect, useWeb3Auth } from '@pesabooks/hooks';
import { submitTransaction } from '@pesabooks/services/transactionsServices';
import { NewTransaction } from '@pesabooks/types';
import { checksummed } from '@pesabooks/utils/addresses-utils';
import { web3wallet } from '@pesabooks/utils/wallet-connect';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { getAllCategories } from '../services/categoriesService';
import {
  ReviewAndSendTransactionModal,
  ReviewAndSendTransactionModalRef,
} from './ReviewAndSendTransactionModal';
import {
  TransactionRequestModal,
  TxRequestFormValue,
} from './Wallet-connect/TransactionRequestModal';
import { WalletConnectButton } from './Wallet-connect/WalletConnectButton';
import { WalletConnectDrawer } from './Wallet-connect/WalletConnectDrawer';

export const WalletConnect = () => {
  const { isOpen: isDrawerOpen, onOpen: onOpenDrawer, onClose: onCloseDrawer } = useDisclosure();
  const { isOpen: isTxModalOpen, onOpen: onTxModalOpen, onClose: onCloseTxModal } = useDisclosure();
  const { pool } = usePool();
  const {
    connecting,
    connect,
    disconnect,
    txRequest: txRequestPayload,
    onTxSumitted,
    rejectTransactionRequest,
    functionName,
    sessions,
  } = useWalletConnect(pool!);

  const isConnected = sessions.length > 0;
  const { provider, user } = useWeb3Auth();
  const toast = useToast();
  const reviewTxRef = useRef<ReviewAndSendTransactionModalRef>(null);

  const signer = provider?.getSigner();

  const { data: categories } = useQuery({
    queryKey: [pool!.id, 'categories', { active: true }],
    queryFn: () =>
      getAllCategories(pool!.id, { activeOnly: true }).then((categories) =>
        categories.filter((c) => c.active),
      ),
  });

  useEffect(() => {
    if (!txRequestPayload) return;
    onTxModalOpen();
  }, [txRequestPayload]);

  const propose = async (formValue: TxRequestFormValue) => {
    if (!provider || !pool) return;
    const { memo, category } = formValue;
    const {
      id,
      topic,
      payload: { data, gas, gasPrice, to, value },
    } = txRequestPayload!;
    const txData = {
      to: checksummed(to!),
      data,
      value: value ? parseInt(value).toString() : '0',
      gasPrice: gasPrice ? parseInt(gasPrice) : undefined,
      baseGas: gas ? parseInt(gas) : undefined,
    };

    const transaction: NewTransaction = {
      type: 'walletConnect',
      pool_id: pool.id,
      timestamp: Math.floor(new Date().valueOf() / 1000),
      category_id: category.id,
      memo: memo ?? null,
      metadata: {
        peer_data: txRequestPayload?.peerMetadata,
        payload: txRequestPayload?.payload,
        functionName: functionName,
      },
      transaction_data: txData,
    };
    try {
      const tx = await submitTransaction(signer!, pool, transaction);

      const response = {
        id,
        result: '0x0000000000000000000000000000000000000000000000000000000000000000',
        jsonrpc: '2.0',
      };

      await web3wallet?.respondSessionRequest({ topic, response });

      onTxSumitted();
      onCloseTxModal();
    } catch (e: any) {
      const message = typeof e === 'string' ? e : e?.data?.message ?? e.message;
      toast({
        title: message,
        status: 'error',
        isClosable: true,
      });
    }
  };

  return (
    <>
      <WalletConnectButton onOpen={onOpenDrawer} isConnected={isConnected} />

      <WalletConnectDrawer
        connect={connect}
        disconnect={disconnect}
        connecting={connecting}
        isOpen={isDrawerOpen}
        onClose={onCloseDrawer}
        sessions={sessions}
      />

      {isTxModalOpen && (
        <TransactionRequestModal
          isOpen={isTxModalOpen}
          onClose={onCloseTxModal}
          txRequestPayload={txRequestPayload!}
          categories={categories ?? []}
          onSubmit={propose}
          onReject={() =>
            rejectTransactionRequest(txRequestPayload!.id, txRequestPayload!.topic).then(() =>
              onCloseTxModal(),
            )
          }
        />
      )}
      <ReviewAndSendTransactionModal ref={reviewTxRef} />
    </>
  );
};
