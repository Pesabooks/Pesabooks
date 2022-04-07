import { ChakraProvider } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import * as Sentry from '@sentry/react';
import { Web3ReactProvider } from '@web3-react/core';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Auth } from './containers/Auth';
import { CreatePoolPage } from './containers/CreatePoolPage';
import { DashboardPage } from './containers/DashboardPage';
import { DepositPage } from './containers/DepositPage';
import { InvitationPage } from './containers/InvitationPage';
import { MembersPage } from './containers/MembersPage';
import { NotFound } from './containers/NotFound';
import { RedirectToPool } from './containers/Pool';
import { SignInPage } from './containers/SigninPage';
import { SignUpPage } from './containers/SignupPage';
import { TransactionsPage } from './containers/TransactionsPage';
import { WithdrawPage } from './containers/WithdrawPage';
import { AuthProvider } from './contexts/AuthContext';
import { PoolProvider } from './contexts/PoolContext';
import { AuthGuard } from './guards/authGuard';
import { PoolGuard } from './guards/poolGuard';
import theme from './theme/theme';

function App() {
  function getLibrary(provider: any): Web3Provider {
    const library = new Web3Provider(provider);
    library.pollingInterval = 12000;
    return library;
  }

  return (
    <HelmetProvider>
      <Helmet titleTemplate="%s - Pesabooks" defaultTitle="Pesabooks">
        <meta name="description" content="A crypto-powered financial platform for saving clubs" />
      </Helmet>
      <ChakraProvider theme={theme}>
        <Web3ReactProvider getLibrary={getLibrary}>
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="*" element={<NotFound />} />
                <Route path="/auth" element={<Auth />}>
                  <Route path="signin" element={<SignInPage />} />
                  <Route path="signup" element={<SignUpPage />} />
                <Route path="invitation/:invitation_id" element={<InvitationPage />} />
                </Route>
                <Route
                  path="/new-pool"
                  element={
                    <AuthGuard>
                      <CreatePoolPage />
                    </AuthGuard>
                  }
                />
                <Route
                  index
                  element={
                    <AuthGuard>
                      <RedirectToPool />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/pool/:pool_id"
                  element={
                    <AuthGuard>
                      <PoolProvider>
                        <PoolGuard>
                          <Layout />
                        </PoolGuard>
                      </PoolProvider>
                    </AuthGuard>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="transactions" element={<TransactionsPage />} />
                  <Route path="members" element={<MembersPage />} />
                  <Route path="deposit" element={<DepositPage />} />
                  <Route path="withdraw" element={<WithdrawPage />} />
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
