import { BigNumber } from 'ethers';
import { forwardRef, Ref, useImperativeHandle, useRef } from 'react';
import {
  ReviewTransactionFn,
  ReviewTransactionModal,
  ReviewTransactionModalRef,
  ReviewTransactionWithEstimateFn
} from '../routes/transactions/components/ReviewTransactionModal';
import {
  closeSubmittingModal,
  openSubmittingModal,
  SubmittingTransactionModal,
  SubmittingTxModalRef
} from '../routes/transactions/components/SubmittingTransactionModal';
import {
  openTxSubmittedModal,
  TransactionSubmittedModal,
  TransactionSubmittedModalRef
} from '../routes/transactions/components/TransactionSubmittedModal';
import { TransactionType } from '../types';

export interface ReviewAndSubmitTransactionRef {
  review: ReviewTransactionFn;
  reviewWithEstimate: ReviewTransactionWithEstimateFn;
  openSubmitting: openSubmittingModal;
  closeSubmitting: closeSubmittingModal;
  openTxSubmitted: openTxSubmittedModal;
}

export interface ReviewTransactionModalProps {
  chainId?: number;
  ref: Ref<ReviewAndSubmitTransactionRef>;
}

export const ReviewAndSubmitTransaction = forwardRef(
  ({ chainId }: ReviewTransactionModalProps, ref: Ref<ReviewAndSubmitTransactionRef>) => {
    const reviewTxRef = useRef<ReviewTransactionModalRef>(null);
    const txSubmittedRef = useRef<TransactionSubmittedModalRef>(null);
    const submittingRef = useRef<SubmittingTxModalRef>(null);

    useImperativeHandle(ref, () => ({
      reviewWithEstimate: (
        message: string,
        type: TransactionType,
        data: any | null,
        onConfirm,
        estimatedFee: BigNumber | undefined,
      ) => reviewTxRef.current?.openWithEstimate(message, type, data, onConfirm, estimatedFee),
      review: async (
        message: string,
        type: TransactionType,
        data: any | null,
        onConfirm,
        safeTxHash?: string,
      ) => reviewTxRef.current?.open(message, type, data, onConfirm, safeTxHash),
      openSubmitting: (type: TransactionType, description?: string) =>
        submittingRef.current?.open(type, description),
      closeSubmitting: () => submittingRef.current?.close(),
      openTxSubmitted: (type: TransactionType, hash: string | null, internalTxId?: number) =>
        txSubmittedRef.current?.open(type, hash, internalTxId),
    }));

    return (
      <>
        <ReviewTransactionModal ref={reviewTxRef} />
        <TransactionSubmittedModal ref={txSubmittedRef} chainId={chainId} />
        <SubmittingTransactionModal ref={submittingRef} />
      </>
    );
  },
);
