import { transationsTable } from '../../supabase';
import { defaultProvider } from '../blockchainServices';
import { BusMessage, eventBus, TransactionMessage } from './eventBus';

export class TransactionEventHandler {
  handleExecutionCompleted = async ({
    payload: { blockchainReceipt, chainId, transaction },
  }: BusMessage<TransactionMessage>) => {
    if (blockchainReceipt?.blockNumber) {
      const timestamp = (await defaultProvider(chainId).getBlock(blockchainReceipt.blockNumber))
        .timestamp;
      const { error } = await transationsTable()
        .update({
          status: transaction?.status === 'pending_rejection' ? 'rejected' : 'completed',
          timestamp,
        })
        .eq('hash', blockchainReceipt.transactionHash);
      if (error) console.error(error);
    }
  };

  handleExecutionFailed = async ({
    payload: { blockchainTransaction },
  }: BusMessage<TransactionMessage>) => {
    //a failed transaction is still not executed in gnosis. A rejection execution is needed
    await transationsTable()
      .update({ status: 'failed' })
      .eq('hash', blockchainTransaction?.hash)
      .is('safeTxHash', null);
  };

  register() {
    eventBus
      .channel('transaction')
      .on<TransactionMessage>('execution_completed', this.handleExecutionCompleted);

    eventBus
      .channel('transaction')
      .on<TransactionMessage>('execution_failed', this.handleExecutionFailed);
  }
}
