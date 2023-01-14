import { Flex, Icon, Stat, StatLabel, StatNumber } from '@chakra-ui/react';
import { FaWallet } from 'react-icons/fa';
import { Card } from '../../../components/Card/Card';
import { CardBody } from '../../../components/Card/CardBody';
import { IconBox } from '../../../components/Icons';
import Loading from '../../../components/Loading';

const BalanceCard = ({ balance, loading }: { balance: number; loading: boolean }) => {
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
                <StatNumber fontSize="lg">$ {balance.toFixed(2)}</StatNumber>
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
