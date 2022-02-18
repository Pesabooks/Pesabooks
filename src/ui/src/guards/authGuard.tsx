import { useLocation, Navigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { useAuth } from '../hooks/useAuth';

export function AuthGuard({ children }: { children: JSX.Element }) {
  let auth = useAuth();
  let location = useLocation();

  if (auth.loading) {
    return <Loading></Loading>;
  } else if (!auth.user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to={`/signin?returnUrl=${location.pathname}`} state={{ from: location }} />;
  }

  return children;
}
