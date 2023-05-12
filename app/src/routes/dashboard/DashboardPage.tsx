import { Card, CardBody, CardHeader, Flex, SimpleGrid, Text } from '@chakra-ui/react';
import { CreateTeamSafe } from '@pesabooks/components/CreateTeamSafe';
import { usePool, useTransactions } from '@pesabooks/hooks';
import { getBalances } from '@pesabooks/services/covalentServices';
import { getMembers } from '@pesabooks/services/membersService';
import { getTransactionsStats } from '@pesabooks/services/poolsService';
import { getAllProposals } from '@pesabooks/services/transactionsServices';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaArrowDown, FaArrowUp, FaWallet } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { QueryBuilder } from '../../supabase';
import { TransactionsTable } from '../transactions/components/TransactionsTable';
import { AssetsList } from './components/AssetsList';
import BalanceCard from './components/BalanceCard';
import { ProposalsList } from './components/ProposalsList';

export const DashboardPage = () => {
  const { pool, isDeployed } = usePool();
  const navigate = useNavigate();

  const navigateToTransactions = () => navigate(`../transactions`);

  const token = pool?.token;
  if (!token) {
    throw new Error();
  }

  const filter = useCallback((query: QueryBuilder<'transactions'>) => {
    return query
      .order('timestamp', { ascending: false })
      .in('status', ['completed', 'rejected'])
      .limit(5);
  }, []);

  const { transactions, isLoading: txLoading } = useTransactions(pool.id, filter, {
    useRealTime: true,
  });

  const { data: balances, isLoading: isBalancesLoading } = useQuery({
    queryKey: [pool.id, 'balances'],
    queryFn: () => getBalances(pool.chain_id, pool.gnosis_safe_address!),
    enabled: !!pool.gnosis_safe_address,
  });

  const total = balances?.reduce((balance, resp) => balance + resp.quote, 0);

  const { data: txStats, isLoading: isStatsLoading } = useQuery({
    queryKey: [pool.id, 'transactions_stats'],
    queryFn: () => getTransactionsStats(pool.id),
    enabled: !!pool.id,
  });

  const { data: users } = useQuery({
    queryKey: [pool.id, 'members'],
    queryFn: () => getMembers(pool.id).then((members) => members.map((m) => m.user!)),
    enabled: !!pool.id,
  });

  const { data: proposals, isLoading: proposalsLoading } = useQuery({
    queryKey: [pool.id, 'proposals'],
    queryFn: () => getAllProposals(pool),
    enabled: !!pool,
  });

  return (
    <>
      <Helmet>
        <title>Dashboard | {pool?.name}</title>
      </Helmet>
      <CreateTeamSafe />
      {isDeployed && (
        <Flex direction="column">
          <SimpleGrid mb={4} columns={{ sm: 1, md: 2, xl: 4 }} spacing="24px">
            <BalanceCard
              description={`$ ${total?.toFixed(2)}`}
              loading={isBalancesLoading}
              icon={FaWallet}
              title="Balance"
            />
            <BalanceCard
              description={`${txStats?.deposit} ${pool.token?.symbol}`}
              loading={isStatsLoading}
              icon={FaArrowUp}
              title="Deposit"
            />
            <BalanceCard
              description={`${txStats?.withdrawal} ${pool.token?.symbol}`}
              loading={isStatsLoading}
              icon={FaArrowDown}
              iconBg="#f44336"
              title="Withdrawal"
            />
          </SimpleGrid>

          <Flex gap="24px" mb={{ lg: '26px' }} direction={{ base: 'column', md: 'row' }}>
            <Card mb={{ sm: '26px', lg: '0px' }} w="50%">
              <CardHeader>
                <Flex direction="column" alignSelf="flex-start">
                  <Text fontSize="lg" fontWeight="bold" mb="6px">
                    Assets
                  </Text>
                </Flex>
              </CardHeader>
              <CardBody>
                <AssetsList balances={balances ?? []} loading={isBalancesLoading} />
              </CardBody>
            </Card>

            <Card w="50%">
              <CardHeader>
                <Text fontSize="lg" fontWeight="bold">
                  Proposals
                </Text>
              </CardHeader>
              <CardBody>
                <Flex direction="column" w="100%">
                  <ProposalsList
                    proposals={proposals ?? []}
                    users={users ?? []}
                    onSelect={navigateToTransactions}
                    loading={proposalsLoading}
                  />
                </Flex>
              </CardBody>
            </Card>
          </Flex>

          {/* <Grid
            templateColumns={{ sm: '1fr', lg: '1fr 1fr' }}
            templateRows={{ sm: 'repeat(2, 1fr)', lg: '1fr' }}
            gap="24px"
            mb={{ lg: '26px' }}
          > */}
          <Card mt="8">
            <CardHeader>
              <Text fontSize="lg" fontWeight="bold">
                Last 5 Transactions
              </Text>
            </CardHeader>
            <CardBody>
              <TransactionsTable
                pool={pool}
                transactions={transactions}
                users={users ?? []}
                loading={txLoading}
                onSelect={navigateToTransactions}
                showNonce={false}
              />
            </CardBody>
          </Card>
        </Flex>
      )}
    </>
  );
};
