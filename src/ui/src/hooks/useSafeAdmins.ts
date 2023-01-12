import { useEffect, useState } from 'react';
import { getSafeAdmins, getSafeTreshold } from '../services/gnosisServices';
import { compareAddress } from '../utils';
import { usePool } from './usePool';
import { useWeb3Auth } from './useWeb3Auth';

export const useSafeAdmins = (): {
  safeAdmins: string[];
  isSafeAdmin: boolean;
  threshold: number;
  loading: boolean;
} => {
  const [isSafeAdmin, setIsSafeAdmin] = useState(false);
  const [safeAdmins, setSafeAdmins] = useState<string[]>([]);
  const [threshold, setThreshold] = useState(1);
  const [loading, setLoading] = useState(false);
  const { pool } = usePool();

  const { account } = useWeb3Auth();

  useEffect(() => {
    const fetchInfo = async () => {
      if (pool?.chain_id && pool?.gnosis_safe_address) {
        setLoading(true);
        try {
          await getSafeAdmins(pool.chain_id, pool.gnosis_safe_address).then(setSafeAdmins);
          await getSafeTreshold(pool.chain_id, pool.gnosis_safe_address).then(setThreshold);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchInfo();
  }, [pool?.gnosis_safe_address, pool?.chain_id]);

  useEffect(() => {
    if (account) {
      const itIs = !!safeAdmins?.find((a) => compareAddress(a, account));
      setIsSafeAdmin(itIs);
    } else setIsSafeAdmin(false);
  }, [account, safeAdmins]);

  return { safeAdmins, isSafeAdmin, threshold, loading };
};
