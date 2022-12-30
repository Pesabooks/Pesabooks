import { Flex, Grid, SimpleGrid, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardBody, CardHeader } from '../../components/Card';
import { usePool } from '../../hooks/usePool';
import { useTransactions } from '../../hooks/useTransactions';
import { getBalances, TokenBalance } from '../../services/covalentServices';
import { getMembers } from '../../services/membersService';
import { User } from '../../types';
import { AssetsList } from './components/AssetsList';
import BalanceCard from './components/BalanceCard';
import { TotalPerCategory } from './components/TotalPerCategory';
import { TransactionsList } from './components/TransactionsList';
import { TransactionsPerMonth } from './components/TransactionsPerMonth';
import { TransactionsStats } from './components/TransactionsStats';

export const DashboardPage = () => {
  const { pool } = usePool();
  const [users, setUsers] = useState<User[]>([]);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);

  const token = pool?.token;
  if (!token) {
    throw new Error();
  }

  const filter = useCallback((query) => {
    return query.order('timestamp', { ascending: false }).limit(7);
  }, []);

  const { transactions } = useTransactions(pool.id, filter, {
    useRealTime: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getMembers(pool.id).then((members) => setUsers(members?.map((m) => m.user!)));

        if (pool.gnosis_safe_address) {
          await getBalances(pool.chain_id, pool.gnosis_safe_address).then((balances) => {
            setBalances(balances ?? []);
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [pool]);

  return (
    <>
      <Helmet>
        <title>Dashboard | {pool?.name}</title>
      </Helmet>
      <SimpleGrid mb={4} columns={{ sm: 1, md: 2, xl: 4 }} spacing="24px">
        <BalanceCard />
      </SimpleGrid>

      <Grid
        templateColumns={{ sm: '1fr', lg: '1fr 1fr' }}
        templateRows={{ sm: 'repeat(2, 1fr)', lg: '1fr' }}
        gap="24px"
        mb={{ lg: '26px' }}
      >
        <Card p="16px">
          <CardBody>
            <Flex direction="column" w="100%">
              <TransactionsPerMonth pool_id={pool.id} />

              <TransactionsStats pool={pool} />
            </Flex>
          </CardBody>
        </Card>

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
      </Grid>

      <Grid
        templateColumns={{ sm: '1fr', lg: '1fr 1fr' }}
        templateRows={{ sm: 'repeat(2, 1fr)', lg: '1fr' }}
        gap="24px"
        mb={{ lg: '26px' }}
      >
        <Card mt="8">
          <CardHeader p="6px 0px 22px 0px">
            <Text fontSize="lg" fontWeight="bold">
              Total per category
            </Text>
          </CardHeader>
          <CardBody>
            <TotalPerCategory pool={pool} />
          </CardBody>
        </Card>

        <Card mt="8">
          <CardHeader p="6px 0px 22px 0px">
            <Text fontSize="lg" fontWeight="bold">
              Latest Transactions
            </Text>
          </CardHeader>
          <CardBody>
            <TransactionsList transactions={transactions} users={users}></TransactionsList>
          </CardBody>
        </Card>
      </Grid>
    </>
  );
};
