import { Flex, Grid, SimpleGrid, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardBody, CardHeader } from '../../components/Card';
import { usePool } from '../../hooks/usePool';
import { useTransactions } from '../../hooks/useTransactions';
import { getAddressLookUp } from '../../services/poolsService';
import { AddressLookup } from '../../types';
import { AssetsCard } from './components/AssetsCard';
import BalanceCard from './components/BalanceCard';
import { TotalPerCategory } from './components/TotalPerCategory';
import { TransactionsList } from './components/TransactionsList';
import { TransactionsPerMonth } from './components/TransactionsPerMonth';
import { TransactionsStats } from './components/TransactionsStats';

export const DashboardPage = () => {
  const { pool } = usePool();
  const [addressLookups, setAddressLookups] = useState<AddressLookup[]>([]);

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
      getAddressLookUp(pool.id).then(setAddressLookups);
    };
    fetchData();
  }, [pool]);

  return (
    <>
      <Helmet>
        <title>Dashboard | {pool?.name}</title>
      </Helmet>
      <SimpleGrid mb={4} columns={{ sm: 1, md: 2, xl: 4 }} spacing="24px">
        <BalanceCard chainId={pool.chain_id} token={token} address={pool.contract_address} />
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
        {/* <BalancesPerMonth pool_id={pool.id} /> */}
        <AssetsCard/>
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
            <TransactionsList
              transactions={transactions}
              addressLookups={addressLookups}
            ></TransactionsList>
          </CardBody>
        </Card>
      </Grid>
    </>
  );
};
