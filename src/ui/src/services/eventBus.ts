import { ContractReceipt, ContractTransaction } from 'ethers';
import { filter, Subject } from 'rxjs';
import { Activity, Transaction, User } from '../types';
import { NotificationEventHandler } from './events-handlers/notification-events-handlers';
import { TransactionEventHandler } from './events-handlers/transaction-events-handlers';
import { UserEventHandler } from './events-handlers/user-events-handlers';

type EventName =
  | 'execution_sent'
  | 'proposed'
  | 'execution_completed'
  | 'execution_failed'
  | 'confirmed'
  | 'rejected';
type TypeName = 'transaction' | 'activity';
type Payload =
  | TransactionPayload
  | TransactionMessage
  | ActivityBusMessage
  | ConfirmTransactionPayload;

export interface ConfirmTransactionPayload {
  chainId: number;
  userId: string;
  transaction: Transaction;
  safeTxHash: string;
}

export interface TransactionPayload {
  transaction: Transaction;
}

export interface TransactionMessage extends TransactionPayload {
  blockchainTransaction: ContractTransaction;
  blockchainReceipt?: ContractReceipt;
  chainId: number;
  user?: User;
}

export interface ActivityBusMessage {
  activity: Activity;
  blockchainTransaction?: ContractTransaction;
  blockchainReceipt?: ContractReceipt;
  chainId: number;
}

export interface BusMessage<T extends Payload> {
  event: EventName;
  type: TypeName;
  payload: T;
}

const createEventBus = () => {
  const bus = new Subject<BusMessage<any>>();

  //logs all events
  bus.subscribe((message) => {
    const { event, type, payload } = message;
    console.log('Event:', type, event, payload);
  });

  const channel = (type: TypeName) => {
    return {
      on: <T extends Payload>(
        event: '*' | EventName | EventName[],
        callback: (value: BusMessage<T>) => void,
      ) => {
        return bus
          .pipe(
            filter((message) => message.type === type),
            filter((message) => {
              if (event === '*') return true;
              if (Array.isArray(event)) return event.includes(message.event);
              return message.event === event;
            }),
          )
          .subscribe(callback);
      },
      emit: <T extends Payload>(event: EventName, payload: T) => {
        bus.next({ type, event, payload });
      },
    };
  };

  return {
    channel,
  };
};

// Create a single instance of the event bus for the entire application.
export const eventBus = createEventBus();

// register the handlers
// this is done here so the tree-shaking doesn't remove them
new TransactionEventHandler().register();
new UserEventHandler().register();
new NotificationEventHandler().register();
