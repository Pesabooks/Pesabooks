import { ChakraProvider } from '@chakra-ui/react';
import * as Sentry from '@sentry/react';
import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { hooks as metaMaskHooks, metaMask } from './connectors/metaMask';
import { hooks as walletConnectHooks, walletConnect } from './connectors/walletConnect';
import { Auth } from './containers/Auth';
import { CreatePoolPage } from './containers/CreatePoolPage';
import { DashboardPage } from './containers/DashboardPage';
import { DepositPage } from './containers/DepositPage';
import { HomePage } from './containers/HomePage';
import { InvitationPage } from './containers/InvitationPage';
import { MembersPage } from './containers/MembersPage';
import { NotFound } from './containers/NotFound';
import { CategoriesPage } from './containers/settings/CategoriesPage';
import { OverviewPage } from './containers/settings/OverviewPage';
import { SettingsPage } from './containers/settings/SettingsPage';
import { SignInPage } from './containers/SigninPage';
import { SignUpPage } from './containers/SignupPage';
import { TransactionsPage } from './containers/TransactionsPage';
import { WithdrawPage } from './containers/WithdrawPage';
import { AuthProvider } from './contexts/AuthContext';
import { PoolProvider } from './contexts/PoolContext';
import { AuthGuard } from './guards/authGuard';
import { PoolGuard } from './guards/poolGuard';
import theme from './theme/theme';

const connectors: [MetaMask | WalletConnect, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
];

function App() {
  return (
    <HelmetProvider>
      <Helmet titleTemplate="%s - Pesabooks" defaultTitle="Pesabooks">
        <meta name="description" content="A crypto-powered financial platform for saving clubs" />
      </Helmet>
      <ChakraProvider theme={theme}>
        <Web3ReactProvider connectors={connectors}>
          <BrowserRouter>
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
                    <Route path="withdraw" element={<WithdrawPage />} />
                    <Route path="settings" element={<SettingsPage />}>
                      <Route index element={<OverviewPage />} />
                      <Route path="categories" element={<CategoriesPage />} />
                    </Route>
                  </Route>
                </Route>
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </Web3ReactProvider>
      </ChakraProvider>
    </HelmetProvider>
  );
}

export default Sentry.withProfiler(App);
