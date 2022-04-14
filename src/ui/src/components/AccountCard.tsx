import { Flex, Icon, Stat, StatLabel, StatNumber } from '@chakra-ui/react';
import { FaWallet } from 'react-icons/fa';
import { useBalance } from '../hooks/useBalance';
import { Account, Token } from '../types';
import { Card } from './Card/Card';
import { CardBody } from './Card/CardBody';
import { IconBox } from './Icons';
import Loading from './Loading';

type AccountBalanceProps = {
  chainId: number;
  token: Token;
  account: Account;
};

const AccountCard = ({ chainId, token, account }: AccountBalanceProps) => {
  const { balance, loading } = useBalance(chainId, token.address, account.contract_address);

  return (
    <Card minH="83px">
      <CardBody>
        <Flex flexDirection="row" align="center" justify="center" w="100%">
          <Stat me="auto">
            <StatLabel fontSize="sm" color="gray.400" fontWeight="bold" pb=".1rem">
              {account.name}
            </StatLabel>
            <Flex>
              {loading ? (
                <Loading size="md"/>
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

export default AccountCard;
