import { useWeb3React } from '@web3-react/core';
import { useEffect, useMemo, useState } from 'react';
import { compareAddress } from '../utils';
import { usePool } from './usePool';

export const useIsAdmin = (): boolean => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { pool, safeAdmins } = usePool();

  const { isActive, chainId, account } = useWeb3React();

  const connected = useMemo(
    () => isActive && pool?.chain_id === chainId,
    [chainId, isActive, pool?.chain_id],
  );

  useEffect(() => {
    if (connected && account) {
      const itIs = !!safeAdmins?.find((a) => compareAddress(a, account));
      setIsAdmin(itIs);
    } else setIsAdmin(false);
  }, [connected, account, safeAdmins]);

  return isAdmin;
};
