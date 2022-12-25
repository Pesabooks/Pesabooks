import { ChakraProvider } from '@chakra-ui/react';
import * as Sentry from '@sentry/react';
import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';
import { useCallback, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { hooks as metaMaskHooks, metaMask } from './connectors/metaMask';
import { hooks as walletConnectHooks, walletConnect } from './connectors/walletConnect';
import { PoolProvider } from './contexts/PoolContext';
import { Web3AuthProvider } from './contexts/Web3AuthProvider';
import { AuthGuard } from './guards/authGuard';
import { PoolGuard } from './guards/poolGuard';
import { Auth } from './routes/auth/Auth';
import { CallbackPage } from './routes/auth/CallbackPage';
import { InvitationPage } from './routes/auth/InvitationPage';
import { SignInPage } from './routes/auth/SigninPage';
import { CreatePoolPage } from './routes/CreatePool/CreatePoolPage';
import { DashboardPage } from './routes/dashboard/DashboardPage';
import { HomePage } from './routes/home/HomePage';
import { MembersPage } from './routes/members/MembersPage';
import { NotFound } from './routes/notfound/NotFound';
import { ProfilePage } from './routes/profile';
import { AdminsPage } from './routes/settings/container/AdminsPage';
import { CategoriesPage } from './routes/settings/container/CategoriesPage';
import { OverviewPage } from './routes/settings/container/OverviewPage';
import { SettingsPage } from './routes/settings/container/SettingsPage';
import { DepositPage } from './routes/transactions/containers/DepositPage';
import { RampPage } from './routes/transactions/containers/RampPage';
import { SwapPage } from './routes/transactions/containers/SwapPage';
import { TransactionsPage } from './routes/transactions/containers/TransactionsPage';
import { WithdrawPage } from './routes/transactions/containers/WithdrawPage';
import { WalletPage } from './routes/wallet/WalletPage';
import theme from './theme/theme';
import trackPathForAnalytics from './trackpageforanalytics';

// to delete
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
        <Web3AuthProvider>
          <Web3ReactProvider connectors={connectors}>
            <Routes>
              <Route path="*" element={<NotFound />} />
              <Route path="/auth" element={<Auth />}>
                <Route path="signin" element={<SignInPage />} />
                <Route path="callback" element={<CallbackPage />} />
                <Route path="invitation/:invitation_id" element={<InvitationPage />} />
              </Route>
              <Route element={<AuthGuard />}>
                <Route path="/new-pool" element={<CreatePoolPage />} />

                <Route path="/" element={<HomePage />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/profile" element={<ProfilePage />}></Route>

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
                  <Route index element={<Navigate replace to="dashboard" />} />
                  <Route path="dashboard" element={<DashboardPage />} />
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
          </Web3ReactProvider>
        </Web3AuthProvider>
      </ChakraProvider>
    </HelmetProvider>
  );
}

export default Sentry.withProfiler(App);
