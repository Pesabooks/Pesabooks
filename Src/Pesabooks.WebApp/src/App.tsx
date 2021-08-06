import React, { FC, useEffect, useState } from 'react';
import { Button, message } from 'antd';
import styles from './App.module.scss';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import ChartOfAccounts from './containers/ChartOfAccounts';
import Members from './containers/Members';
import Dashboard from './containers/Dashboard';
import AccountHistory from './containers/AccountHistory';
import { AuthGuardedRoute } from './utils/AuthGuardedRoute';
import SigninOidc from './containers/Signin-oidc';
import Signoutoidc from './containers/Signout-oidc';
import { loadUserFromStorage } from './services/UserService';
import { isAuthenticated$, setUser } from './States/Auth.state';
import { Login } from './containers/Login';
import useObservable from './utils/useObservable';
import Transactions from './containers/Transactions';

const App: FC = () => {
  const [intiliased, setIntiliased] = useState(false);
  const isAuthenticated = useObservable(isAuthenticated$);

  useEffect(() => {
    loadUserFromStorage().then((user) => {
      if (user) {
        setUser({ name: user?.profile?.name, access_token: user?.access_token });
      }
      setIntiliased(true);
    });
  }, []);

  if (!intiliased) {
    return null;
  }
  return (
    <main>
      <Switch>
        <AuthGuardedRoute path="/" isAuthenticated={isAuthenticated} component={Dashboard} exact />
        <AuthGuardedRoute path="/members" isAuthenticated={isAuthenticated} component={Members} />
        <AuthGuardedRoute
          path="/accounts"
          isAuthenticated={isAuthenticated}
          component={ChartOfAccounts}
        />
        <AuthGuardedRoute
          path="/transactions"
          isAuthenticated={isAuthenticated}
          component={Transactions}
        />
        <AuthGuardedRoute
          path="/account/:id/history"
          isAuthenticated={isAuthenticated}
          component={AccountHistory}
        />
        <Route path="/signin-oidc" component={SigninOidc} />
        <Route path="/signout-oidc" component={Signoutoidc} />
        <Route path="/login" component={Login} />
      </Switch>
    </main>
  );
};

export default App;
