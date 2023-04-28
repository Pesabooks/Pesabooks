import { ChakraProvider } from '@chakra-ui/react';
import * as Sentry from '@sentry/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useCallback, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
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
import { Unauthorized } from './routes/notfound/Unauthorized';
import { ProfilePage } from './routes/profile';
import { ReportsPage } from './routes/Reports/ReportsPage';
import { TotalDepositPerUser } from './routes/Reports/TotalDepositPerUser';
import { CategoriesPage } from './routes/settings/container/CategoriesPage';
import { OverviewPage } from './routes/settings/container/OverviewPage';
import { SettingsPage } from './routes/settings/container/SettingsPage';
import { ThresholdPage } from './routes/settings/container/ThresholdPage';
import { DepositPage } from './routes/transactions/containers/DepositPage';
import { SwapPage } from './routes/transactions/containers/SwapPage';
import { TransactionsPage } from './routes/transactions/containers/TransactionsPage';
import { WithdrawPage } from './routes/transactions/containers/WithdrawPage';
import { WalletPage } from './routes/wallet/WalletPage';
import theme from './theme/theme';
import trackPathForAnalytics from './trackpageforanalytics';
import { SetUsernamePage } from './routes/SetUsernamePage';

function App() {
  const data = useLocation();
  const { pathname, search } = data;

  const analytics = useCallback(() => {
    trackPathForAnalytics({ path: pathname, search: search, title: pathname.split('/')[1] });
  }, [pathname, search]);

  useEffect(() => {
    analytics();
  }, [analytics]);

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <Helmet titleTemplate="%s - Pesabooks" defaultTitle="Pesabooks">
          <meta name="description" content="A crypto-powered financial platform for saving clubs" />
        </Helmet>
        {/* https://stackoverflow.com/questions/72246624/chakra-ui-custom-theme-doesnt-work-at-all-in-my-next-js-project */}
        <ChakraProvider theme={theme} cssVarsRoot="body">
          <Web3AuthProvider>
            <Routes>
              <Route path="*" element={<NotFound />} />
              <Route path="/403" element={<Unauthorized />} />
              <Route path="/auth" element={<Auth />}>
                <Route path="signin" element={<SignInPage />} />
                <Route path="callback" element={<CallbackPage />} />
                <Route path="invitation/:invitation_id" element={<InvitationPage />} />
              </Route>
              <Route path="/set-username" element={<SetUsernamePage />} />
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
                  <Route path="withdraw" element={<WithdrawPage />} />
                  <Route path="swap" element={<SwapPage />} />
                  <Route path="settings" element={<SettingsPage />}>
                    <Route index element={<OverviewPage />} />
                    <Route path="categories" element={<CategoriesPage />} />
                    <Route path="threshold" element={<ThresholdPage />} />
                  </Route>
                  <Route path="reports" element={<ReportsPage />}>
                    <Route path="total-deposit-per-user" element={<TotalDepositPerUser />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </Web3AuthProvider>
        </ChakraProvider>
      </HelmetProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default Sentry.withProfiler(App);
