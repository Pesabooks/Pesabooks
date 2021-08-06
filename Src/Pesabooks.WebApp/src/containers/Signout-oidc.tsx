import React, { ReactElement, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { signoutRedirectCallback } from '../services/UserService';

const Signoutoidc = () => {
  const history = useHistory();

  useEffect(() => {
    async function signoutAsync() {
      await signoutRedirectCallback();
      history.push('/');
    }
    signoutAsync();
  }, [history]);

  return <div>Redirecting...</div>;
};

export default Signoutoidc;
