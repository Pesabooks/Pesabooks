import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getSafeAdmins } from '../services/gnosisServices';
import { isMemberAdmin } from '../services/membersService';
import { getPool } from '../services/poolsService';
import { membersTable } from '../supabase';
import { Pool } from '../types';

type PoolContextType = {
  pool: Pool | undefined;
  loading: boolean;
  error: any;
  refresh: () => void;
  isAdmin: boolean;
  safeAdmins: string[];
};

export const PoolContext = React.createContext<Partial<PoolContextType>>({ loading: true });

export const PoolProvider = ({ children }: any) => {
  const { user } = useAuth();
  const [pool, setPool] = useState<Pool>();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [safeAdmins, setSafeAdmins] = useState<string[]>([]);
  let { pool_id } = useParams();

  const fetchPool = useCallback(() => {
    if (pool_id)
      getPool(pool_id)
        .then((p) => {
          membersTable()
            .update({ last_viewed_at: new Date() })
            .eq('user_id', user?.id)
            .eq('pool_id', pool_id)
            .then();

          setPool(p);
          setLoading(false);
        })
        .catch((e) => {
          setPool(undefined);
          setError(e);
          setLoading(false);
        });
  }, [pool_id, user?.id]);

  useEffect(() => {
    fetchPool();
  }, [fetchPool]);

  useEffect(() => {
    if (user && pool?.id) isMemberAdmin(user.id, pool?.id).then(setIsAdmin);
  }, [pool?.id, user]);

  useEffect(() => {
    if (pool?.chain_id && pool?.gnosis_safe_address)
      getSafeAdmins(pool.chain_id, pool?.gnosis_safe_address).then(setSafeAdmins);
  }, [pool?.gnosis_safe_address, pool?.chain_id]);

  const refresh = () => fetchPool();

  const value: PoolContextType = { pool, loading, error, refresh, isAdmin, safeAdmins: safeAdmins };

  return <PoolContext.Provider value={value}>{children}</PoolContext.Provider>;
};
