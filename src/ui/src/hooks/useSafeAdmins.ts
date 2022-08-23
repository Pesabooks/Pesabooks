import { useEffect, useState } from 'react';
import { getSafeAdmins } from '../services/gnosisServices';
import { compareAddress } from '../utils';
import { usePool } from './usePool';
import { useWeb3Auth } from './useWeb3Auth';

export const useSafeAdmins = (): { safeAdmins: string[]; isSafeAdmin: boolean } => {
  const [isSafeAdmin, setIsSafeAdmin] = useState(false);
  const [safeAdmins, setSafeAdmins] = useState<string[]>([]);
  const { pool } = usePool();

  const { account } = useWeb3Auth();

  useEffect(() => {
    if (!pool?.gnosis_safe_address) return;

    if (pool?.chain_id && pool?.gnosis_safe_address)
      getSafeAdmins(pool.chain_id, pool.gnosis_safe_address).then(setSafeAdmins);
  }, [pool?.gnosis_safe_address, pool?.chain_id]);

  useEffect(() => {
    if (account) {
      const itIs = !!safeAdmins?.find((a) => compareAddress(a, account));
      setIsSafeAdmin(itIs);
    } else setIsSafeAdmin(false);
  }, [account, safeAdmins]);

  return { safeAdmins, isSafeAdmin };
};
