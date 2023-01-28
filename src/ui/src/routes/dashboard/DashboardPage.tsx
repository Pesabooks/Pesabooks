import { Flex, SimpleGrid, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaArrowDown, FaArrowUp, FaWallet } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '../../components/Card';
import { CreateTeamSafe } from '../../components/CreateTeamSafe';
import { usePool } from '../../hooks/usePool';
import { useTransactions } from '../../hooks/useTransactions';
import { getBalances, TokenBalance } from '../../services/covalentServices';
import { getMembers } from '../../services/membersService';
import { getAllProposals } from '../../services/transactionsServices';
import { QueryBuilder, supabase } from '../../supabase';
import { Transaction, User } from '../../types';
import { TransactionsTable } from '../transactions/components/TransactionsTable';
import { AssetsList } from './components/AssetsList';
import BalanceCard from './components/BalanceCard';
import { ProposalsList } from './components/ProposalsList';

export const DashboardPage = () => {
  const { pool, isDeployed } = usePool();
  const [users, setUsers] = useState<User[]>([]);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [txStats, setTxStats] = useState({ count: 0, deposit: 0, withdrawal: 0 });
  const [proposals, setProposals] = useState<Transaction[]>([]);
  const navigate = useNavigate();

  const total = balances.reduce((balance, resp) => balance + resp.quote, 0);

  const navigateToTransactions = () => navigate(`../transactions`);

  const token = pool?.token;
  if (!token) {
    throw new Error();
  }

  const filter = useCallback((query: QueryBuilder<'transactions'>) => {
    return query
      .order('created_at', { ascending: false })
      .in('status', ['completed', 'rejected'])
      .limit(5);
  }, []);

  const { transactions, loading: txLoading } = useTransactions(
    pool.id,
    pool.chain_id,
    pool.gnosis_safe_address!,
    filter,
    {
      useRealTime: true,
    },
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getMembers(pool.id).then((members) => setUsers(members?.map((m) => m.user!)));

        if (pool.gnosis_safe_address) {
          await getBalances(pool.chain_id, pool.gnosis_safe_address).then((balances) => {
            setBalances(balances ?? []);
          });

          await supabase()
            .rpc('get_transactions_stats', { pool_id: pool.id })
            .single()
            .then(({ data }) => {
              if (data) setTxStats(data);
            });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [pool]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (pool) {
          await getAllProposals(pool).then(setProposals);
        }
      } finally {
        setProposalsLoading(false);
      }
    };
    fetchData();
  }, [pool]);

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
              description={`$ ${total.toFixed(2)}`}
              loading={loading}
              icon={FaWallet}
              title="Balance"
            />
            <BalanceCard
              description={`${txStats.deposit} ${pool.token?.symbol}`}
              loading={loading}
              icon={FaArrowUp}
              title="Deposit"
            />
            <BalanceCard
              description={`${txStats.withdrawal} ${pool.token?.symbol}`}
              loading={loading}
              icon={FaArrowDown}
              iconBg="#f44336"
              title="Withdrawal"
            />
          </SimpleGrid>

          <Flex gap="24px" mb={{ lg: '26px' }} direction={{ base: 'column', md: 'row' }}>
            <Card p="28px 10px 16px 0px" mb={{ sm: '26px', lg: '0px' }}>
              <CardHeader mb="20px" pl="22px">
                <Flex direction="column" alignSelf="flex-start">
                  <Text fontSize="lg" fontWeight="bold" mb="6px">
                    Assets
                  </Text>
                </Flex>
              </CardHeader>
              <AssetsList balances={balances} loading={loading} />
            </Card>

            <Card p="16px">
              <CardHeader p="6px 0px 22px 0px">
                <Text fontSize="lg" fontWeight="bold">
                  Proposals
                </Text>
              </CardHeader>
              <CardBody>
                <Flex direction="column" w="100%">
                  <ProposalsList
                    proposals={proposals}
                    users={users}
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
            <CardHeader p="6px 0px 22px 0px">
              <Text fontSize="lg" fontWeight="bold">
                Last 5 Transactions
              </Text>
            </CardHeader>
            <CardBody>
              <TransactionsTable
                pool={pool}
                transactions={transactions}
                users={users}
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
