import { ethers } from 'ethers';
import { AddressLookup } from '../types';

export const shortenHash = (address: string): string => {
  if (!address) return '';

  return address.substring(0, 6) + '...' + address.substring(address.length - 5);
};

export const checksummed = (address: string) => ethers.utils.getAddress(address);

export const compareAddress = (address1: string | undefined, address2: string | undefined) => {
  if (!address1 || !address2) return false;
  return checksummed(address1) === checksummed(address2);
};

export const mathAddress = (addresses: AddressLookup[], address: string) => {
  return addresses.find((a) => compareAddress(a.address, address));
};
