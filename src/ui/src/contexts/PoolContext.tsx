import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPool } from '../services/poolsService';
import { Pool } from '../types';

type PoolContextType = {
  pool: Pool | undefined;
  loading: boolean;
  error: any;
};

export const PoolContext = React.createContext<Partial<PoolContextType>>({ loading: true });

export const PoolProvider = ({ children }: any) => {
  const [pool, setPool] = useState<Pool>();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  let { pool_id } = useParams();

  useEffect(() => {
    if (pool_id) {
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
    }
  }, [pool_id]);

  const value: PoolContextType = { pool, loading, error };

  return <PoolContext.Provider value={value}>{children}</PoolContext.Provider>;
};
