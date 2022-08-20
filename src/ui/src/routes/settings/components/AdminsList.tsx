import { DeleteIcon } from '@chakra-ui/icons';
import { Flex, Spacer, Text, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { WalletAddress } from '../../../components/WalletAddress';
import {
  IconButtonWithConnectedWallet
} from '../../../components/withConnectedWallet';
import { User } from '../../../types';

interface AdminsListProps {
  chainId: number;
  admins: User[];
  remove: (address: User) => void;
}
export const AdminsList = ({ chainId, admins, remove }: AdminsListProps) => {
  const textColor = useColorModeValue('gray.700', 'white');

  return (
    <Flex direction="column" w="100%">
      {admins.map((row, index) => {
        return (
          <Flex key={index} my={{ sm: '1rem', xl: '10px' }} alignItems="center">
            <Flex direction="column">
              <Text fontSize="md" color={textColor} fontWeight="bold">
                {row.name}
              </Text>
              <WalletAddress address={row.wallet} chainId={chainId} type="address" />
            </Flex>
            <Spacer />

            <Flex alignItems="center" p="12px">
              <Tooltip label="Remove admin">
                <IconButtonWithConnectedWallet
                  onlyAdmin={true}
                  variant="ghost"
                  onClick={() => remove(row)}
                  // isLoading={loading}
                  aria-label="Remove admin"
                  icon={<DeleteIcon />}
                />
              </Tooltip>
            </Flex>
          </Flex>
        );
      })}
    </Flex>
  );
};
