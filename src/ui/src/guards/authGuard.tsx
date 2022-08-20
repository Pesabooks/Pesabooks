import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loading from '../components/Loading';
import { useWeb3Auth } from '../hooks/useWeb3Auth';

export function AuthGuard() {
  let location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const { isInitialised, web3Auth } = useWeb3Auth();

  useEffect(() => {
    if (isInitialised && web3Auth) {
      web3Auth
        .getUserInfo()
        .then((user) => setIsAuthenticated(!!user))
        .finally(() => setLoading(false));
    }
  }, [isInitialised, web3Auth]);

  if (loading) {
    return <Loading fullHeight></Loading>;
  } else if (!isAuthenticated) {
    return (
      <Navigate to={`/auth/signin?returnUrl=${location.pathname}`} state={{ from: location }} />
    );
  }

  return <Outlet />;
}
