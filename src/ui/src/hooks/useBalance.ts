import { useEffect, useState } from 'react';
import { getAddressBalance } from '../services/blockchainServices';

export const useBalance = (
  chainId: number,
  tokenAddress: string,
  userOrContractAddress: string,
): number => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const getBalance = async () => {
      const balance = await getAddressBalance(chainId, tokenAddress, userOrContractAddress);
      setBalance(balance);
    };

    getBalance();
  }, [chainId, tokenAddress, userOrContractAddress]);

  return balance;
};
