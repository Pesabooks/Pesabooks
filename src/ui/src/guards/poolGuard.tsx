import { Navigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { usePool } from '../hooks/usePool';
import { useWeb3Auth } from '../hooks/useWeb3Auth';

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
