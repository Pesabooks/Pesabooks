import { SendNotificationRequest } from '@pesabooks/supabase/functions';
import { formatBigNumber } from '@pesabooks/utils/bignumber-utils';
import { supabase } from '../supabase';
import {
  AddOrRemoveOwnerData,
  ChangeThresholdData,
  NotificationData,
  NotificationType,
  SwapData,
  Transaction,
  TransferData,
  WalletConnectData,
} from '../types';

export const getNotificationDescription = (transaction: Transaction): string => {
  const { type, metadata } = transaction;

  let data;
  let username;

  switch (type) {
    case 'deposit':
      data = metadata as TransferData;
      username = data.transfer_from_name;
      return `${data.amount} ${data?.token?.symbol}`;

    case 'withdrawal':
      data = metadata as TransferData;
      username = data.transfer_to_name;
      return `Send ${data.amount} ${data?.token?.symbol} To ${username}`;

    case 'addOwner':
      data = metadata as AddOrRemoveOwnerData;
      username = data.username;
      return `Add ${username} as a member`;

    case 'removeOwner':
      const removeOwnerData = metadata as AddOrRemoveOwnerData;
      return `Remove ${removeOwnerData.username} as a member`;

    case 'unlockToken':
      return `Unlock token ${(metadata as any).token.symbol}`;

    case 'swap':
      const swapData = metadata as SwapData;

      return `Trade ${formatBigNumber(swapData.src_amount, swapData.src_token.decimals)} ${
        swapData.src_token.symbol
      } for ${formatBigNumber(swapData.dest_amount, swapData.dest_token.decimals)} ${
        swapData.dest_token.symbol
      }  `;

    case 'walletConnect':
      const walletConnectData = metadata as WalletConnectData;
      return `Contract interaction ${
        walletConnectData.functionName ? `- ${walletConnectData.functionName}` : ''
      } `;

    case 'changeThreshold':
      const thresholdData = metadata as ChangeThresholdData;

      return `Change required confirmations from ${thresholdData.current_threshold} to ${thresholdData.threshold}`;

    default:
      return transaction.type;
  }
};

export const sendNotification = async (
  user_id: string,
  type: NotificationType,
  transaction: Transaction,
  notificationData?: NotificationData,
) => {
  try {
    const pool_id = transaction.pool_id;
    const notificationDescription = getNotificationDescription(transaction);

    const payload: SendNotificationRequest = {
      notification_description: notificationDescription,
      notification_type: type,
      notification_data: {
        ...notificationData,
        url: `${window.location.origin}/pool/${pool_id}/transactions`,
      },
      pool_id: pool_id,
      user_id: user_id,
    };

    supabase().functions.invoke('send-notification', {
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error(error);
  }
};
