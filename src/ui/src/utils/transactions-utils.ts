import { AddressLookup, Transaction } from '../types';
import { AddOwnerData, TransactionType, TransferData } from '../types/transaction';

export const getAddressName = (address: string | undefined, addressLookups: AddressLookup[]) => {
  if (!address) return null;

  return (
    addressLookups.find((a) => a.address.toLowerCase() === address.toLowerCase())?.name ?? address
  );
};

export const getTransactonDescription = (transaction: Transaction, addresses: AddressLookup[]) => {
  const { type, metadata } = transaction;

  switch (type) {
    case 'deposit':
      if ((metadata as TransferData)?.ramp_id) return transaction.created_by?.name;
      else return `From ${getAddressName((metadata as TransferData).transfer_from, addresses)}`;
    case 'withdrawal':
      return `To ${getAddressName((metadata as TransferData).transfer_to, addresses)}`;
    case 'addOwner':
      return `add ${getAddressName((metadata as AddOwnerData).address, addresses)} as admin`;
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
      return 'Add owner';
  }
};

export const getTxAmountDescription = ({ type, metadata }: Transaction) => {
  if (type === 'deposit' || type === 'withdrawal') {
    return `${(metadata as TransferData).amount} ${(metadata as TransferData)?.token?.symbol}`;
  }

  return;
};
