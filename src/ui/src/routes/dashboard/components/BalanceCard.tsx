import { Card, CardBody, Flex, Icon, Stat, StatLabel, StatNumber } from '@chakra-ui/react';
import { IconType } from 'react-icons/lib';
import { IconBox } from '../../../components/Icons';
import Loading from '../../../components/Loading';

interface BalanceCardProps {
  title: string;
  description: string;
  loading: boolean;
  icon: IconType;
  iconBg?: string;
}

const BalanceCard = ({ title, description, icon, iconBg, loading }: BalanceCardProps) => {
  return (
    <Card minH="83px">
      <CardBody>
        <Flex flexDirection="row" align="center" justify="center" w="100%">
          <Stat me="auto">
            <StatLabel fontSize="sm" color="gray.400" fontWeight="bold" pb=".1rem">
              {title}
            </StatLabel>
            <Flex>
              {loading ? (
                <Loading size="md" />
              ) : (
                <StatNumber fontSize="lg">{description}</StatNumber>
              )}
            </Flex>
          </Stat>
          <IconBox h={'45px'} w={'45px'} bg={iconBg ?? 'teal.300'}>
            <Icon as={icon} h={'24px'} w={'24px'} />
          </IconBox>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default BalanceCard;
