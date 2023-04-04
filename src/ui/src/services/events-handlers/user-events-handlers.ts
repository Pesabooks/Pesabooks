import { AddOrRemoveOwnerData } from '../../types/transaction';
import { BusMessage, eventBus, TransactionMessage } from '../eventBus';
import { deactivateMember } from '../membersService';

export class UserEventHandler {
  handleAdminRemoval = ({ payload: { transaction } }: BusMessage<TransactionMessage>) => {
    if (transaction?.type === 'removeOwner') {
      const metadata = transaction.metadata as AddOrRemoveOwnerData;
      deactivateMember(transaction!.pool_id!, metadata.user_id);
    }
  };

  register() {
    eventBus
      .channel('transaction')
      .on<TransactionMessage>('execution_completed', this.handleAdminRemoval);
  }
}
