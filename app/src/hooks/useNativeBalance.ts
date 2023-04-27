import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { defaultProvider } from '../services/blockchainServices';
import { useWeb3Auth } from './useWeb3Auth';

export const useNativeBalance = (): { balance: BigNumber; loading: boolean } => {
  const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0));
  const [loading, setLoading] = useState(false);
  const { account, chainId } = useWeb3Auth();

  useEffect(() => {
    const getBalance = async () => {
      const provider = defaultProvider(chainId);

      if (account) {
        try {
          setLoading(true);
          const balance = await provider.getBalance(account);
          setBalance(balance);
        } finally {
          setLoading(false);
        }
      }
    };

    getBalance();
  }, [account, chainId]);

  return { balance, loading };
};
