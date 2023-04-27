import Loading from '@pesabooks/components/Loading';
import { usePool, useWeb3Auth } from '@pesabooks/hooks';
import { Navigate } from 'react-router-dom';

export function PoolGuard({ children }: { children: JSX.Element }) {
  let { pool, loading } = usePool();
  const { user } = useWeb3Auth();

  if (loading) {
    return <Loading fullHeight></Loading>;
  } else if (!pool) {
    return <Navigate to="/" />;
  } else if (pool.members2?.find((m) => m.user_id=== user?.id && !m.active )) {
    return <Navigate to="/403" />;
  }
  return children;
}
