import {
    Card,
    CardBody,
    CardHeader,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useColorModeValue
} from '@chakra-ui/react';
import { WalletAddress } from '@pesabooks/components/WalletAddress';
import { usePool } from '@pesabooks/hooks';
import { useEffect, useState } from 'react';
import { FunctionReturns, supabase } from '../../supabase';

export const TotalDepositPerUser = () => {
  const textColor = useColorModeValue('gray.700', 'white');
  const [deposits, setDeposits] = useState<FunctionReturns<'report_users_stake'> | null>();

  const { pool } = usePool();

  useEffect(() => {
    supabase()
      .rpc('report_users_stake', { pool_id: pool?.id! })
      .then(({ data, error }) => {
        //@ts-ignore
        setDeposits(data);
      });
  }, [pool?.id]);

  return (
    <>
      <Card>
        <CardHeader>
          <Text color={textColor} fontSize="lg" fontWeight="bold">
            Total Deposit Per User
          </Text>
        </CardHeader>
        <CardBody overflowX={{ sm: 'scroll', md: 'hidden' }}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th color="gray.400" fontSize="xs">
                  User:
                </Th>
                <Th color="gray.400" fontSize="xs">
                  Wallet:
                </Th>
                <Th color="gray.400" fontSize="xs">
                  Total Deposit:
                </Th>
                <Th color="gray.400" fontSize="xs">
                  Stake:
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {deposits?.map((deposit, index) => (
                <Tr key={index}>
                  <Td minW="180px">
                    <Stack direction="row" spacing="16px">
                      <Text color={textColor} fontSize="sm" fontWeight="bold">
                        {deposit.username}
                      </Text>
                    </Stack>
                  </Td>
                  <Td>
                    <WalletAddress
                      chainId={pool!.chain_id}
                      address={deposit.wallet}
                      type="address"
                    />
                  </Td>
                  <Td>
                    <Text color={textColor} fontSize="sm" fontWeight="bold">
                      {deposit.total_deposit} {pool?.token?.symbol}
                    </Text>
                  </Td>
                  <Td>
                    <Text color={textColor} fontSize="sm" fontWeight="bold">
                      {deposit.stake.toFixed(2)}%
                    </Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </>
  );
};
