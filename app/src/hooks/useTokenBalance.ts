import { useEffect, useState } from 'react';
import { getAddressBalance } from '../services/blockchainServices';

export const useTokenBalance = (
  chainId: number,
  tokenAddress: string,
  userOrContractAddress: string,
): { balance: number; loading: boolean } => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getBalance = async () => {
      const balance = await getAddressBalance(chainId, tokenAddress, userOrContractAddress);
      setBalance(balance);
      setLoading(false);
    };

    getBalance();
  }, [chainId, tokenAddress, userOrContractAddress]);

  return { balance, loading };
};
