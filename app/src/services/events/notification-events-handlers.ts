import { getSafeTransaction, getSafeTreshold } from '../gnosisServices';
import { sendNotification } from '../notificationServices';
import { getPool } from '../poolsService';
import { BusMessage, ConfirmTransactionPayload, TransactionMessage, eventBus } from './eventBus';

export class NotificationEventHandler {
  onTransactionRejected = async ({
    payload: { transaction, userId },
  }: BusMessage<ConfirmTransactionPayload>) => {
    sendNotification(userId, 'proposal_rejection', transaction);
  };

  onTransactionConfirmed = async ({
    payload: { chainId, transaction, userId, safeTxHash },
  }: BusMessage<ConfirmTransactionPayload>) => {
    const safeTransaction = await getSafeTransaction(chainId, safeTxHash);

    const { confirmations, confirmationsRequired } = safeTransaction;
    const remaining_votes = confirmations
      ? confirmationsRequired - confirmations.length
      : confirmations;

    sendNotification(userId, 'proposal_confirmation', transaction, { remaining_votes });
  };

  onTransactionExecuted = async ({
    payload: { transaction, user },
  }: BusMessage<TransactionMessage>) => {
    // const pool = await getPool(transaction.pool_id!);

    // todo: get user from wallet
    // const safeTxHash =
    //   transaction.status === 'rejected'
    //     ? transaction.reject_safe_tx_hash!
    //     : transaction.safe_tx_hash!;
    // const safeTransaction = await getSafeTransaction(pool.chain_id, safeTxHash);

    // const wallet =safeTransaction.executor;
    if (!user?.id) return;

    if (transaction?.type === 'deposit') {
      sendNotification(user.id, 'new_deposit', transaction);
    } else {
      sendNotification(user.id, 'proposal_execution', transaction);
    }
  };

  onNewProposal = async ({ payload: { transaction, user } }: BusMessage<TransactionMessage>) => {
    const pool = await getPool(transaction.pool_id);
    const treshold = await getSafeTreshold(pool.chain_id, pool.gnosis_safe_address!);

    if (!user?.id) return;
    sendNotification(user.id, 'new_proposal', transaction, {
      remaining_votes: treshold - 1,
    });
  };

  register() {
    eventBus.channel('transaction').on('rejected', this.onTransactionRejected);

    eventBus.channel('transaction').on('confirmed', this.onTransactionConfirmed);

    eventBus.channel('transaction').on('execution_completed', this.onTransactionExecuted);

    eventBus.channel('transaction').on('proposed', this.onNewProposal);
  }
}
