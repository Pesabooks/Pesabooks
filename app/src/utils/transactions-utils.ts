import {
  AddOrRemoveOwnerData,
  ChangeThresholdData,
  Metadata,
  NewTransaction,
  PurchaseData,
  SwapData,
  Transaction,
  TransactionStatus,
  TransactionType,
  TransferData,
  UnlockTokenData,
  User,
  WalletConnectData,
} from '@pesabooks/types';
import { compareAddress } from './addresses-utils';
import { formatBigNumber } from './bignumber-utils';

export const getAddressName = (address: string | undefined, users: User[]) => {
  if (!address) return null;

  const user = users.find((a) => compareAddress(a.wallet, address));

  return user?.username ?? address;
};

export const getTransactionDescription = (
  transaction: Transaction | NewTransaction,
  addresses?: User[],
): string => {
  const { type, metadata } = transaction;

  const isProposal = (
    ['awaitingConfirmations', 'awaitingExecution'] as TransactionStatus[]
  ).includes((transaction as Transaction).status);

  switch (type) {
    case 'deposit': {
      const fromName = addresses
        ? getAddressName((metadata as TransferData).transfer_from, addresses)
        : (metadata as TransferData).transfer_from_name;
      return `Received From ${fromName}`;
    }

    case 'withdrawal': {
      const toName = addresses
        ? getAddressName((metadata as TransferData).transfer_to, addresses)
        : (metadata as TransferData).transfer_to_name;
      if (isProposal)
        return `Send ${(metadata as TransferData).amount} ${
          (metadata as TransferData)?.token?.symbol
        } To ${toName}`;
      return `Sent To ${toName}`;
    }

    case 'addOwner': {
      const ownerName = addresses
        ? getAddressName((metadata as AddOrRemoveOwnerData).address, addresses)
        : (metadata as AddOrRemoveOwnerData).username;
      return `${isProposal ? 'Add' : 'Added'} ${ownerName} as a member`;
    }

    case 'removeOwner': {
      const removeOwnerData = metadata as AddOrRemoveOwnerData;
      return `${isProposal ? 'Remove' : 'Removed'} ${removeOwnerData.username} as a member`;
    }

    case 'unlockToken':
      return `${isProposal ? 'Unlock' : 'Unlocked'} token ${
        (metadata as UnlockTokenData).token.symbol
      }`;

    case 'swap': {
      const swapData = metadata as SwapData;
      if (isProposal)
        return `Trade ${formatBigNumber(swapData.src_amount, swapData.src_token.decimals)} ${
          swapData.src_token.symbol
        } for ${formatBigNumber(swapData.dest_amount, swapData.dest_token.decimals)} ${
          swapData.dest_token.symbol
        }  `;
      return `Traded ${swapData.src_token.symbol} for ${swapData.dest_token.symbol}  `;
    }

    case 'createSafe':
      return 'Created group wallet';
    case 'walletConnect': {
      const walletConnectData = metadata as WalletConnectData;
      return `Contract interaction ${
        walletConnectData.functionName ? `- ${walletConnectData.functionName}` : ''
      } `;
    }

    case 'changeThreshold': {
      const thresholdData = metadata as ChangeThresholdData;
      if (isProposal)
        return `Change required confirmations from ${thresholdData.current_threshold} to ${thresholdData.threshold}`;
      return `Change required confirmations to ${thresholdData.threshold}`;
    }
    default:
      return transaction.type;
  }
};

export const getTransactionTypeLabel = (type: TransactionType | undefined) => {
  if (type === undefined) return;

  switch (type) {
    case 'deposit':
      return 'Deposit';
    case 'withdrawal':
      return 'Withdrawal';
    case 'addOwner':
      return 'Add member';
    case 'removeOwner':
      return 'Remove member';
    case 'unlockToken':
      return 'Unlock Token';
    case 'swap':
      return 'Swap Token';
    case 'createSafe':
      return 'Create group wallet';
    case 'transfer_out':
      return 'Send';
    case 'rejection':
      return 'Reject transaction';
    case 'walletConnect':
      return 'WalletConnect';
    case 'changeThreshold':
      return 'Change threshold';
    default:
      return type;
  }
};

export const getTxAmountDescription = (
  type: TransactionType,
  metadata: Metadata | undefined,
): string => {
  if (!metadata) return type;

  if (['deposit', 'withdrawal', 'transfer_out'].includes(type)) {
    const transferAmout = `${(metadata as TransferData).amount} ${
      (metadata as TransferData)?.token?.symbol
    }`;
    if (type === 'withdrawal') return `- ${transferAmout}`;
    return transferAmout;
  }
  if (type === 'purchase') {
    const purchaseData = metadata as PurchaseData;
    return `${formatBigNumber(purchaseData.amount, purchaseData.token.decimals)} ${
      purchaseData.token.symbol
    }`;
  }
  if (type === 'swap') {
    const swapData = metadata as SwapData;
    return `${formatBigNumber(swapData.src_amount, swapData.src_token.decimals)} ${
      swapData.src_token.symbol
    }`;
  }
  if (type === 'unlockToken') {
    const data = metadata as UnlockTokenData;
    if (!data.amount) return type;

    return `${data.amount.toPrecision(4)} ${data.token.symbol}`;
  }

  return type;
};
