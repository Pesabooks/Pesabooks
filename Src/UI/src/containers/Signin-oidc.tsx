import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { signinRedirectCallback } from '../services/UserService';
import { setUser } from '../States/Auth.state';

const SigninOidc = () => {
  const history = useHistory();
  useEffect(() => {
    async function signinAsync() {
      const user = await signinRedirectCallback();
      setUser({ name: user?.profile?.name, access_token: user?.access_token });
      history.push('/');
    }
    signinAsync();
  }, [history]);

  return <div>Redirecting...</div>;
};

export default SigninOidc;
