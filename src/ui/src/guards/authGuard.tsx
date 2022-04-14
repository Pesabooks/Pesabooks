import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loading from '../components/Loading';
import { useAuth } from '../hooks/useAuth';

export function AuthGuard() {
  let auth = useAuth();
  let location = useLocation();

  if (auth.loading) {
    return <Loading fullHeight></Loading>;
  } else if (!auth.user) {
    return (
      <Navigate to={`/auth/signin?returnUrl=${location.pathname}`} state={{ from: location }} />
    );
  }

  return <Outlet />;
}
