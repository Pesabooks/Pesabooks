import { Flex, Icon, Stat, StatLabel, StatNumber } from '@chakra-ui/react';
import { FaWallet } from 'react-icons/fa';
import { Card } from '../../../components/Card/Card';
import { CardBody } from '../../../components/Card/CardBody';
import { IconBox } from '../../../components/Icons';
import Loading from '../../../components/Loading';
import { useBalance } from '../../../hooks/useBalance';
import { Token } from '../../../types';

type BalanceCardProps = {
  chainId: number;
  token: Token;
  address: string;
};

const BalanceCard = ({ chainId, token, address }: BalanceCardProps) => {
  const { balance, loading } = useBalance(chainId, token.address, address);

  return (
    <Card minH="83px">
      <CardBody>
        <Flex flexDirection="row" align="center" justify="center" w="100%">
          <Stat me="auto">
            <StatLabel fontSize="sm" color="gray.400" fontWeight="bold" pb=".1rem">
              Balance
            </StatLabel>
            <Flex>
              {loading ? (
                <Loading size="md" />
              ) : (
                <StatNumber fontSize="lg">
                  {balance} {token.symbol}
                </StatNumber>
              )}
            </Flex>
          </Stat>
          <IconBox h={'45px'} w={'45px'}>
            <Icon as={FaWallet} h={'24px'} w={'24px'} />
          </IconBox>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default BalanceCard;
