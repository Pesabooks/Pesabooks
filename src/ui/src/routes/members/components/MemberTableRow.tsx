import {
  Avatar,
  Badge,
  Button,
  Flex,
  Icon, Td,
  Text,
  Tr,
  useColorModeValue
} from '@chakra-ui/react';
import { FaUserShield } from 'react-icons/fa';
import { WalletAddress } from '../../../components/WalletAddress';
import { usePool } from '../../../hooks/usePool';

interface MembleTableRowProps {
  name: string | undefined;
  wallet?: string | undefined;
  active: boolean;
  status: string;
  isInvitation: boolean;
  id: string;
  onRemove?: (id: string) => void;
  onResendInvitation?: (id: string) => void;
  role?: string;
  isAdmin: boolean;
}

export const MemberTableRow = ({
  name,
  wallet,
  status,
  active,
  isInvitation,
  id,
  onRemove,
  onResendInvitation,
  role,
  isAdmin,
}: MembleTableRowProps) => {
  const textColor = useColorModeValue('gray.700', 'white');
  let bgStatus = useColorModeValue('gray.400', '#1a202c');
  let colorStatus = useColorModeValue('white', 'gray.400');
  const { pool } = usePool();
  const isOrganizer = pool?.organizer.id === id

  if (isInvitation) {
    bgStatus = 'orange.300';
    colorStatus = 'white';
  } else if (active) {
    bgStatus = 'green.400';
    colorStatus = 'white';
  }

  return (
    <Tr>
      <Td minWidth={{ sm: '250px' }} pl="0px">
        <Flex align="center" minWidth="100%" flexWrap="nowrap">
          <Avatar name={name} w="50px" borderRadius="12px" me="18px" />

          <Text fontSize="md" color={textColor} fontWeight="bold">
            {name}
          </Text>
        </Flex>
      </Td>
      <Td>
        {wallet && pool?.chain_id && (
          <WalletAddress chainId={pool.chain_id} address={wallet} type="address" />
        )}
      </Td>

      <Td>
        <Flex align="center">
          {isOrganizer && <Icon as={FaUserShield} color="green.400" w="24px" h="24px" me="6px" />}
          <Text>{isOrganizer ? 'Organizer' : 'Member'}</Text>
        </Flex>
      </Td>

      <Td>
        <Badge bg={bgStatus} color={colorStatus} fontSize="16px" p="3px 10px" borderRadius="8px">
          {status}
        </Badge>
      </Td>
      <Td>
        {isInvitation && (
          <Button onClick={() => onResendInvitation?.(id)} colorScheme="teal" variant="link">
            Resend
          </Button>
        )}
      </Td>

      {/* <Td>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<FiMoreVertical />}
            variant="ghost"
          />
          <MenuList>
            <MenuItem isDisabled={!isInvitation} onClick={() => onRemove?.(id)}>
              Remove
            </MenuItem>
          </MenuList>
        </Menu>
      </Td> */}
    </Tr>
  );
};
