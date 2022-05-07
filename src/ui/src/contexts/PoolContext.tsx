import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isMemberAdmin } from '../services/membersService';
import { getPool } from '../services/poolsService';
import { Pool } from '../types';

type PoolContextType = {
  pool: Pool | undefined;
  loading: boolean;
  error: any;
  refresh: () => void;
  isAdmin: boolean;
};

export const PoolContext = React.createContext<Partial<PoolContextType>>({ loading: true });

export const PoolProvider = ({ children }: any) => {
  const { user } = useAuth();
  const [pool, setPool] = useState<Pool>();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  let { pool_id } = useParams();

  const fetchPool = useCallback(() => {
    if (pool_id)
      getPool(pool_id)
        .then((p) => {
          setPool(p);
          setLoading(false);
        })
        .catch((e) => {
          setPool(undefined);
          setError(e);
          setLoading(false);
        });
  }, [pool_id]);

  useEffect(() => {
    fetchPool();
  }, [fetchPool]);

  useEffect(() => {
    if (user && pool) isMemberAdmin(user.id, pool?.id).then(setIsAdmin);
  }, [pool, user]);

  const refresh = () => fetchPool();

  const value: PoolContextType = { pool, loading, error, refresh, isAdmin };

  return <PoolContext.Provider value={value}>{children}</PoolContext.Provider>;
};
