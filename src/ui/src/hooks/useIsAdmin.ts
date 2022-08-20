import { useEffect, useState } from 'react';
import { compareAddress } from '../utils';
import { usePool } from './usePool';
import { useWeb3Auth } from './useWeb3Auth';

export const useIsAdmin = (): boolean => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { safeAdmins } = usePool();

  const { account } = useWeb3Auth();

  useEffect(() => {
    if (account) {
      const itIs = !!safeAdmins?.find((a) => compareAddress(a, account));
      setIsAdmin(itIs);
    } else setIsAdmin(false);
  }, [account, safeAdmins]);

  return isAdmin;
};
