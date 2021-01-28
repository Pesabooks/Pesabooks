import React from 'react';
import { Route, Redirect, useLocation } from 'react-router-dom';
import { authState$, isAuthenticated$ } from '../States/Auth.state';
import useObservable from './useObservable';

export const AuthGuardedRoute = ({ component: Component, isAuthenticated, ...rest }) => {
  const location = useLocation();

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated === true ? (
          <Component {...props} />
        ) : (
          <Redirect to={`/login?returnUrl=${location.pathname}`} />
        )
      }
    />
  );
};
