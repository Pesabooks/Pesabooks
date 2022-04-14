import { Navigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { usePool } from '../hooks/usePool';

export function PoolGuard({ children }: { children: JSX.Element }) {
  let { pool, loading } = usePool();

  if (loading) {
    return <Loading  fullHeight></Loading>;
  } else if (!pool) {
    return <Navigate to="/" />;
  }

  return children;
}
