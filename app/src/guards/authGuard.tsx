import Loading from '@pesabooks/components/Loading';
import { useWeb3Auth } from '@pesabooks/hooks';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export function AuthGuard() {
  const location = useLocation();

  const { isInitialised, isAuthenticated, user } = useWeb3Auth();

  if (!isInitialised) {
    return <Loading fullHeight></Loading>;
  } else if (!isAuthenticated()) {
    return (
      <Navigate to={`/auth/signin?returnUrl=${location.pathname}`} state={{ from: location }} />
    );
  } else if (user && !user.username) {
    return (
      <Navigate to={`/set-username?returnUrl=${location.pathname}`} state={{ from: location }} />
    );
  }

  return <Outlet />;
}
