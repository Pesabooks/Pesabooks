import Loading from '@pesabooks/components/Loading';
import { useWeb3Auth } from '@pesabooks/hooks';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export function AuthGuard() {
  let location = useLocation();

  const { isInitialised, isAuthenticated } = useWeb3Auth();

  if (!isInitialised) {
    return <Loading fullHeight></Loading>;
  } else if (!isAuthenticated()) {
    return (
      <Navigate to={`/auth/signin?returnUrl=${location.pathname}`} state={{ from: location }} />
    );
  }

  return <Outlet />;
}
