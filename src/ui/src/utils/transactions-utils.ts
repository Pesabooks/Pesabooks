import { formatBigNumber } from '../bignumber-utils';
import { Transaction, User } from '../types';
import {
  AddOwnerData,
  SwapData,
  TransactionType,
  TransferData,
  UnlockTokenData,
} from '../types/transaction';
import { compareAddress } from './addresses';

export const getAddressName = (address: string | undefined, users: User[]) => {
  if (!address) return null;

  const user = users.find((a) => compareAddress(a.wallet, address));

  return user?.name ?? address;
};

export const getTransactionDescription = (transaction: Transaction, addresses: User[]): string => {
  const { type, metadata } = transaction;

  switch (type) {
    case 'deposit':
      return `Received From ${getAddressName((metadata as TransferData).transfer_from, addresses)}`;
    case 'withdrawal':
      return `Sent To ${getAddressName((metadata as TransferData).transfer_to, addresses)}`;
    case 'addOwner':
      return `add ${getAddressName((metadata as AddOwnerData).address, addresses)} as admin`;
    case 'removeOwner':
      return `Remove ${getAddressName((metadata as AddOwnerData).address, addresses)} as admin`;
    case 'unlockToken':
      return `unlock token ${(metadata as any).token.symbol}`;
    case 'swap':
      const swapData = metadata as SwapData;
      return `Trade ${swapData.src_token.symbol} for ${swapData.dest_token.symbol}  `;
    case 'createSafe':
      return 'Create Safe';
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
      return 'Add admin';
    case 'removeOwner':
      return 'Remove admin';
    case 'unlockToken':
      return 'Unlock Token';
    case 'swap':
      return 'Swap Token';
    case 'createSafe':
      return 'Create group wallet';
    case 'transfer_out':
      return 'Send';
    default:
      return type;
  }
};

export const getTxAmountDescription = (type: TransactionType, metadata: any) => {
  if (['deposit', 'withdrawal', 'transfer_out'].includes(type)) {
    const transferAmout = `${(metadata as TransferData).amount} ${
      (metadata as TransferData)?.token?.symbol
    }`;
    if (type === 'withdrawal') return `- ${transferAmout}`;
    return transferAmout;
  }
  if (type === 'purchase') {
    return `${formatBigNumber(metadata.amount, metadata.token.decimals)} ${metadata.token.symbol}`;
  }
  if (type === 'swap') {
    const swapData = metadata as SwapData;
    return `${formatBigNumber(swapData.src_amount, swapData.src_token.decimals)} ${
      swapData.src_token.symbol
    }`;
  }
  if (type === 'unlockToken') {
    const data = metadata as UnlockTokenData;
    if (!data.amount) return null;

    return `${data.amount.toPrecision(4)} ${data.token.symbol}`;
  }

  return;
};
