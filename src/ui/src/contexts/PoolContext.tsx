import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3Auth } from '../hooks/useWeb3Auth';
import { eventBus } from '../services/eventBus';
import { getPool } from '../services/poolsService';
import { membersTable } from '../supabase';
import { Pool } from '../types';

type PoolContextType = {
  pool: Pool | undefined;
  loading: boolean;
  error: any;
  isDeployed: boolean;
};

export const PoolContext = React.createContext<PoolContextType>({
  loading: true,
  error: {},
  pool: undefined,
  isDeployed: false,
});

export const PoolProvider = ({ children }: any) => {
  const { user, setChainId } = useWeb3Auth();
  const [pool, setPool] = useState<Pool>();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  let { pool_id } = useParams();

  const fetchPool = useCallback(() => {
    if (pool_id)
      getPool(pool_id)
        .then((p) => {
          membersTable()
            .update({ last_viewed_at: new Date().toDateString() })
            .eq('user_id', user?.id)
            .eq('pool_id', pool_id)
            .then();

          setPool(p);
          if (p?.chain_id) setChainId(p.chain_id);
          setLoading(false);
        })
        .catch((e) => {
          setPool(undefined);
          setError(e);
          setLoading(false);
        });
  }, [pool_id, setChainId, user?.id]);

  useEffect(() => {
    fetchPool();
  }, [fetchPool]);

  useEffect(() => {
    const sub = eventBus.channel('pool').on('*', () => fetchPool());
    return () => sub.unsubscribe();
  }, [fetchPool]);

  const value: PoolContextType = {
    pool,
    loading,
    error,
    isDeployed: !!pool?.gnosis_safe_address,
  };

  return <PoolContext.Provider value={value}>{children}</PoolContext.Provider>;
};
