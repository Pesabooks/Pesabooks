import { AddOrRemoveOwnerData } from '../../types/transaction';
import { deactivateMember } from '../membersService';
import { BusMessage, eventBus, TransactionMessage } from './eventBus';

export class UserEventHandler {
  handleAdminRemoval = ({ payload: { transaction } }: BusMessage<TransactionMessage>) => {
    if (transaction?.type === 'removeOwner') {
      const metadata = transaction.metadata as AddOrRemoveOwnerData;
      deactivateMember(transaction.pool_id, metadata.user_id);
    }
  };

  register() {
    eventBus
      .channel('transaction')
      .on<TransactionMessage>('execution_completed', this.handleAdminRemoval);
  }
}
