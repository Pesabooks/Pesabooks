import { AddressLookup, Transaction } from '../types';
import { AddOwnerData, TransferData } from '../types/transaction';

export const getAddressName = (address: string, addressLookups: AddressLookup[]) => {
  if (!address) return null;

  return (
    addressLookups.find((a) => a.address.toLowerCase() === address.toLowerCase())?.name ?? address
  );
};

export const getTransactonDescription = (transaction: Transaction, addresses: AddressLookup[]) => {
  const { type, metadata } = transaction;

  switch (type) {
    case 'deposit':
      return `From ${getAddressName((metadata as TransferData).transfer_from, addresses)}`;
    case 'withdrawal':
      return `To ${getAddressName((metadata as TransferData).transfer_to, addresses)}`;
    case 'addOwner':
      return `add ${getAddressName((metadata as AddOwnerData).address, addresses)} as admin`;
  }
};

export const getTxAmountDescription = ({ type, metadata }: Transaction) => {
  if (type === 'deposit' || type === 'withdrawal') {
    return `${(metadata as TransferData).amount} ${(metadata as TransferData)?.token?.symbol}`;
  }

  return;
};
