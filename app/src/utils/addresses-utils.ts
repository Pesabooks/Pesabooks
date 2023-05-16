import { User } from '@pesabooks/types';
import { ethers } from 'ethers';

export const shortenHash = (address: string): string => {
  if (!address) return '';

  return address.substring(0, 6) + '...' + address.substring(address.length - 5);
};

export const checksummed = (address: string) => ethers.utils.getAddress(address);

export const compareAddress = (
  address1: string | undefined | null,
  address2: string | undefined | null,
) => {
  if (!address1 || !address2) return false;
  return checksummed(address1) === checksummed(address2);
};

export const mathAddress = (addresses: User[], address: string | undefined) => {
  return addresses.find((a) => compareAddress(a.wallet, address));
};
