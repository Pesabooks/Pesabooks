import { Flex, Icon, SimpleGrid, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { IconBox } from '../../../components/Icons';
import { supabase } from '../../../supabase';
import { Pool } from '../../../types';

export const TransactionsStats = ({ pool }: { pool: Pool }) => {
  const [state, setState] = useState({ count: 0, deposit: 0, withdrawal: 0 });

  useEffect(() => {
    const fetchData = async () => {
      if (!pool.gnosis_safe_address) return;
      const { data } = await supabase()
        .rpc('get_transactions_stats', { pool_id: pool.id })
        .single();
        // @ts-ignore
      if (data?.[0]) setState(data?.[0]);
    };
    fetchData();
  }, [pool]);

  return (
    <SimpleGrid mt="36px" gap={{ sm: '12px' }} columns={4}>
      {/* <Flex direction="column">
        <Flex alignItems="center">
          <IconBox h={'30px'} w={'30px'} bg={iconTeal} me="6px">
            <Icon as={FaUsers} h={'15px'} w={'15px'} color={iconBoxInside} />
          </IconBox>
          <Text fontSize="sm" color="gray.400" fontWeight="semibold">
            Users
          </Text>
        </Flex>
        <Text fontSize="lg" color={textColor} fontWeight="bold" mb="6px" my="6px">
          32,984
        </Text>
      </Flex> */}
      {/* <Flex direction="column">
        <Flex alignItems="center">
          <IconBox h={'30px'} w={'30px'} me="6px">
            <Icon as={FaExchangeAlt} h={'15px'} w={'15px'} />
          </IconBox>
          <Text
            fontSize="sm"
            color="gray.400"
            fontWeight="semibold"
            display={{ sm: 'none', md: 'flex' }}
          >
            Transactions
          </Text>
        </Flex>
        <Text fontSize="lg" fontWeight="bold" mb="6px" my="6px">
          {state.count}
        </Text>
      </Flex> */}
      <Flex direction="column">
        <Flex alignItems="center">
          <IconBox h={'30px'} w={'30px'} me="6px">
            <Icon as={FaArrowUp} h={'15px'} w={'15px'} />
          </IconBox>
          <Text
            fontSize="sm"
            color="gray.400"
            fontWeight="semibold"
            display={{ sm: 'none', md: 'flex' }}
          >
            Deposit
          </Text>
        </Flex>
        <Text fontSize="lg" fontWeight="bold" mb="6px" my="6px">
          {state.deposit} {pool.token?.symbol}
        </Text>
      </Flex>
      <Flex direction="column">
        <Flex alignItems="center">
          <IconBox h={'30px'} w={'30px'} me="6px" bg="#f44336">
            <Icon as={FaArrowDown} h={'15px'} w={'15px'} />
          </IconBox>
          <Text
            fontSize="sm"
            color="gray.400"
            fontWeight="semibold"
            display={{ sm: 'none', md: 'flex' }}
          >
            Withdrawal
          </Text>
        </Flex>
        <Text fontSize="lg" fontWeight="bold" mb="6px" my="6px">
          {state.withdrawal} {pool.token?.symbol}
        </Text>
      </Flex>
    </SimpleGrid>
  );
};
