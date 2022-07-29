import { ChakraProvider } from '@chakra-ui/react';
import * as Sentry from '@sentry/react';
import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';
import { useCallback, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { hooks as metaMaskHooks, metaMask } from './connectors/metaMask';
import { hooks as walletConnectHooks, walletConnect } from './connectors/walletConnect';
import { AuthProvider } from './contexts/AuthContext';
import { PoolProvider } from './contexts/PoolContext';
import { AuthGuard } from './guards/authGuard';
import { PoolGuard } from './guards/poolGuard';
import { Auth } from './routes/auth/Auth';
import { InvitationPage } from './routes/auth/InvitationPage';
import { SignInPage } from './routes/auth/SigninPage';
import { SignUpPage } from './routes/auth/SignupPage';
import { CreatePoolPage } from './routes/CreatePool/CreatePoolPage';
import { DashboardPage } from './routes/dashboard/DashboardPage';
import { HomePage } from './routes/home/HomePage';
import { MembersPage } from './routes/members/MembersPage';
import { NotFound } from './routes/notfound/NotFound';
import { AdminsPage } from './routes/settings/container/AdminsPage';
import { CategoriesPage } from './routes/settings/container/CategoriesPage';
import { OverviewPage } from './routes/settings/container/OverviewPage';
import { SettingsPage } from './routes/settings/container/SettingsPage';
import { DepositPage } from './routes/transactions/containers/DepositPage';
import { RampPage } from './routes/transactions/containers/RampPage';
import { SwapPage } from './routes/transactions/containers/SwapPage';
import { TransactionsPage } from './routes/transactions/containers/TransactionsPage';
import { WithdrawPage } from './routes/transactions/containers/WithdrawPage';
import theme from './theme/theme';
import trackPathForAnalytics from './trackpageforanalytics';

const connectors: [MetaMask | WalletConnect, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
];

function App() {
  const data = useLocation();
  const { pathname, search } = data;

  const analytics = useCallback(() => {
    trackPathForAnalytics({ path: pathname, search: search, title: pathname.split('/')[1] });
  }, [pathname, search]);

  useEffect(() => {
    analytics();
  }, [analytics]);

  return (
    <HelmetProvider>
      <Helmet titleTemplate="%s - Pesabooks" defaultTitle="Pesabooks">
        <meta name="description" content="A crypto-powered financial platform for saving clubs" />
      </Helmet>
      <ChakraProvider theme={theme}>
        <Web3ReactProvider connectors={connectors}>
          <AuthProvider>
            <Routes>
              <Route path="*" element={<NotFound />} />
              <Route path="/auth" element={<Auth />}>
                <Route path="signin" element={<SignInPage />} />
                <Route path="signup" element={<SignUpPage />} />
                <Route path="invitation/:invitation_id" element={<InvitationPage />} />
              </Route>
              <Route element={<AuthGuard />}>
                <Route path="/new-pool" element={<CreatePoolPage />} />

                <Route path="/" element={<HomePage />} />

                <Route
                  path="/pool/:pool_id"
                  element={
                    <PoolProvider>
                      <PoolGuard>
                        <Layout />
                      </PoolGuard>
                    </PoolProvider>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="transactions" element={<TransactionsPage />} />
                  <Route path="members" element={<MembersPage />} />
                  <Route path="deposit" element={<DepositPage />} />
                  <Route path="ramp" element={<RampPage />} />
                  <Route path="withdraw" element={<WithdrawPage />} />
                  <Route path="swap" element={<SwapPage />} />
                  <Route path="settings" element={<SettingsPage />}>
                    <Route index element={<OverviewPage />} />
                    <Route path="categories" element={<CategoriesPage />} />
                    <Route path="admins" element={<AdminsPage />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </AuthProvider>
        </Web3ReactProvider>
      </ChakraProvider>
    </HelmetProvider>
  );
}

export default Sentry.withProfiler(App);
