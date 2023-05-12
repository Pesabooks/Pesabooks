import { Box, Flex, Img, Text } from '@chakra-ui/react';
import Loading from '@pesabooks/components/Loading';
import { TokenBalance } from '@pesabooks/services/covalentServices';
import { formatBigNumber, formatCurrency } from '@pesabooks/utils/bignumber-utils';

interface AssetsCardProps {
  balances: TokenBalance[];
  loading: boolean;
}
export const AssetsList = ({ balances, loading }: AssetsCardProps) => {
  return (
    <Box>
      {loading ? (
        <Loading />
      ) : (
        balances.map((balance, index) => {
          return (
            <Flex key={index} justifyContent="space-between" px={2} mb={4}>
              <Flex alignItems="center" gap={2}>
                <Img w="30px" h="30px" src={balance.token.image} />
                <Text fontSize={{ sm: 'md', md: 'lg', lg: 'md' }} fontWeight="bold">
                  {balance.token.name}
                </Text>
              </Flex>

              <Flex direction="column" alignItems="end">
                <Text align="end" fontSize={{ sm: 'md', md: 'lg', lg: 'md' }} fontWeight="bold">
                  {formatBigNumber(balance.balance, balance.token.decimals)} {balance.token.symbol}
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
  );
};
