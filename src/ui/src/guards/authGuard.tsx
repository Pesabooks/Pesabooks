import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loading from '../components/Loading';
import { useWeb3Auth } from '../hooks/useWeb3Auth';
import { isTokenExpired } from '../utils/jwt-utils';
import { getTypedStorageItem } from '../utils/storage-utils';

export function AuthGuard() {
  let location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const { isInitialised, web3Auth, signOut } = useWeb3Auth();

  useEffect(() => {
    if (isInitialised && web3Auth) {
      web3Auth
        .getUserInfo()
        .then((user) => {
          const supabase_jwt_token = getTypedStorageItem('supabase_access_token');
          if (!user || !supabase_jwt_token || isTokenExpired(supabase_jwt_token)) {
            signOut();
            setIsAuthenticated(false);
          } else setIsAuthenticated(true);
        })
        .catch((_) => {})
        .finally(() => setLoading(false));
    }
  }, [isInitialised, signOut, web3Auth]);

  if (loading) {
    return <Loading fullHeight></Loading>;
  } else if (!isAuthenticated) {
    return (
      <Navigate to={`/auth/signin?returnUrl=${location.pathname}`} state={{ from: location }} />
    );
  }

  return <Outlet />;
}
