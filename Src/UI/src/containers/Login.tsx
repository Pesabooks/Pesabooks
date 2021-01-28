import React, { useEffect, useState } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { first } from 'rxjs/operators';
import userManager from '../services/UserService';
import { isAuthenticated$ } from '../States/Auth.state';
import useObservable from '../utils/useObservable';

export const Login = () => {
  const returnUrl = new URLSearchParams(useLocation().search).get('returnUrl') ?? '/';

  const isAuthenticated = useObservable(isAuthenticated$);

  if (isAuthenticated === false) {
    userManager.signinRedirect();
  }

  return isAuthenticated ? <Redirect to={returnUrl} /> : <div>Loading</div>;
};
