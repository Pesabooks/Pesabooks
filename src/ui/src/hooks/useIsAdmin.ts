import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { isSignerAnAdmin } from '../services/poolsService';
import { usePool } from './usePool';

export const useIsAdmin = (): boolean => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { pool } = usePool();

  const { provider, isActive, account, chainId } = useWeb3React();

  useEffect(() => {
    if (pool && isActive && pool?.chain_id === chainId)
      isSignerAnAdmin(pool, provider as Web3Provider).then(setIsAdmin);
  }, [provider, pool, account, isActive, chainId]);

  return isAdmin;
};
