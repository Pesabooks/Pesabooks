import { Box, Flex, Img, Text } from '@chakra-ui/react';
import { BalancesReponse } from '@pesabooks/supabase/functions';
import { formatBigNumber, formatCurrency } from '../../../bignumber-utils';
import { Card, CardHeader } from '../../../components/Card';
import Loading from '../../../components/Loading';

interface AssetsCardProps {
  balances: BalancesReponse[];
  loading: boolean;
}
export const AssetsCard = ({ balances, loading }: AssetsCardProps) => {
  return (
    <Card p="28px 10px 16px 0px" mb={{ sm: '26px', lg: '0px' }}>
      <CardHeader mb="20px" pl="22px">
        <Flex direction="column" alignSelf="flex-start">
          <Text fontSize="lg" fontWeight="bold" mb="6px">
            Assets
          </Text>
        </Flex>
      </CardHeader>
      <Box w="100%" h={{ sm: '300px' }} ps="8px">
        {loading ? (
          <Loading />
        ) : (
          balances.map((balance, index) => {
            return (
              <Flex key={index} justifyContent="space-between" px={2} mb={4}>
                <Flex alignItems="center" gap={2}>
                  <Img w="30px" h="30px" src={balance.logo_url} />
                  <Text fontSize={{ sm: 'md', md: 'lg', lg: 'md' }} fontWeight="bold">
                    {balance.contract_name}
                  </Text>
                </Flex>

                <Flex direction="column" alignItems="end">
                  <Text align="end" fontSize={{ sm: 'md', md: 'lg', lg: 'md' }} fontWeight="bold">
                    {formatBigNumber(balance.balance, balance.contract_decimals)} {balance.contract_ticker_symbol}
                  </Text>

                  <Text
                    fontSize={{ sm: 'xs', md: 'sm', lg: 'xs' }}
                    color="gray.400"
                    fontWeight="semibold"
                  >
                    $ {formatCurrency(balance.quote)}
                  </Text>
                </Flex>
              </Flex>
            );
          })
        )}
      </Box>
    </Card>
  );
};
