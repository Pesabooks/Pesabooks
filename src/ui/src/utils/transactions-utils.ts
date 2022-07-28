import { ethers } from 'ethers';
import { AddressLookup, Transaction } from '../types';
import { AddOwnerData, SwapData, TransactionType, TransferData } from '../types/transaction';

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
    case 'unlockToken':
      return `unlock token ${(metadata as any).token.symbol}`;
    case 'swap':
      const swapData = metadata as SwapData;
      const fromAmout = ethers.utils.formatUnits(swapData.src_amount, swapData.src_token.decimals);
      const toAmout = (+ethers.utils.formatUnits(
        swapData.dest_amount,
        swapData.dest_token.decimals,
      )).toFixed(5);
      return `Swap ${fromAmout} ${swapData.src_token.symbol} for ${toAmout} ${swapData.dest_token.symbol}  `;
    case 'createSafe':
      return 'Safe Created';
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
    case 'unlockToken':
      return 'Unlock Token';
    case 'swap':
      return 'Swap Token';
    case 'createSafe':
      return 'Safe created';
  }
};

export const getTxAmountDescription = ({ type, metadata }: Transaction) => {
  if (type === 'deposit' || type === 'withdrawal') {
    return `${(metadata as TransferData).amount} ${(metadata as TransferData)?.token?.symbol}`;
  }

  return;
};
