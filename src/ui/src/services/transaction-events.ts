import { ContractReceipt, ContractTransaction } from 'ethers';
import { transationsTable } from '../supabase';
import { AddOrRemoveOwnerData, NewTransaction, Transaction } from '../types/transaction';
import { notifyTransaction } from '../utils/notification';
import { defaultProvider } from './blockchainServices';
import { deactivateMember } from './membersService';

export const onTransactionSubmitted = async (
  transaction: Transaction | NewTransaction,
  tx: ContractTransaction | undefined,
  chainId: number,
  isRejection: boolean,
  safeTxHash?: string,
) => {
  if (tx) notifyTransaction(chainId, tx.hash);

  tx?.wait().then(
    (receipt) => {
      onTransactionComplete(transaction, receipt, chainId, isRejection);
    },
    () => {
      //a failed transaction is still not executed in gnosis. A rejection execution is needed
      if (!safeTxHash) onTransactionFailed(tx.hash);
    },
  );
};

export const onTransactionComplete = async (
  transaction: Transaction | NewTransaction,
  receipt: ContractReceipt,
  chainId: number,
  isRejection: boolean = false,
) => {
  if (receipt.blockNumber) {
    const timestamp = (await defaultProvider(chainId).getBlock(receipt.blockNumber)).timestamp;
    const { error } = await transationsTable()
      .update({ status: isRejection ? 'rejected' : 'completed', timestamp })
      .eq('hash', receipt.transactionHash);
    if (error) console.error(error);

    afterTransactionComplete(transaction);
  }
};

const afterTransactionComplete = async (transaction: Transaction | NewTransaction) => {
  try {
    if (transaction.type === 'removeOwner') {
      const metadata = transaction.metadata as AddOrRemoveOwnerData;
      deactivateMember(transaction!.pool_id!, metadata.user_id);
    }
  } catch (error) {
    console.error(error);
  }
};

export const onTransactionFailed = async (txHash: string) => {
  await transationsTable().update({ status: 'failed' }).eq('hash', txHash);
};
