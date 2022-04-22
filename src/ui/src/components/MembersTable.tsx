import {
  Avatar,
  Badge,
  Button,
  Flex,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useClipboard,
  useColorModeValue
} from '@chakra-ui/react';
import { FaUserShield } from 'react-icons/fa';
import { FiMoreVertical } from 'react-icons/fi';
import { AddressLookup, Invitation } from '../types';
import { Member } from '../types/Member';
import Loading from './Loading';

interface MembersTableProps {
  members: Member[];
  lookups: AddressLookup[];
  adminAddresses: string[];
  invitations: Invitation[];
  onRevoke: (id: string) => void;
  onAddAdmin?: (id: string) => void;
  isLoading: boolean;
}
export const MembersTable = ({
  members,
  invitations,
  onRevoke,
  isLoading,
  adminAddresses,
  lookups,
}: MembersTableProps) => {
  const isAdmin = (userId: string) => {
    const userAddresses = lookups.filter((l) => l.id === userId).map((l) => l.address);
    for (const address of userAddresses) {
      if (adminAddresses.find((a) => a === address)) {
        return true;
      }
    }
    return false;
  };
  return (
    <>
      <Table variant="simple">
        <Thead>
          <Tr my=".8rem" pl="0px" color="gray.400">
            <Th pl="0px" color="gray.400">
              Member
            </Th>
            <Th color="gray.400">Email</Th>
            <Th color="gray.400">Role</Th>
            <Th color="gray.400">Status</Th>
            {/* <Th></Th> */}
            <Th></Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {members.map((member, index) => {
            return (
              <TableRow
                key={member.user_id}
                name={member.user?.name}
                email={member.user?.email}
                active={member.active}
                status={member.active ? 'active' : 'inactive'}
                isInvitation={false}
                id={member.user_id}
                isAdmin={isAdmin(member.user_id)}
              ></TableRow>
            );
          })}
          {invitations.map((invitation, index) => {
            return (
              <TableRow
                key={invitation.id}
                name={invitation.name}
                email={invitation.email}
                active={invitation.active}
                status="invited"
                isInvitation={true}
                id={invitation.id}
                onRemove={onRevoke}
                isAdmin={false}
              ></TableRow>
            );
          })}
        </Tbody>
      </Table>
      {isLoading && <Loading m={4} />}
    </>
  );
};

interface TableRowProps {
  name: string | undefined;
  email: string | undefined;
  active: boolean;
  status: string;
  isInvitation: boolean;
  id: string;
  onRemove?: (id: string) => void;
  isAdmin: boolean;
}

const TableRow = ({
  name,
  email,
  status,
  active,
  isInvitation,
  id,
  isAdmin,
  onRemove,
}: TableRowProps) => {
  const textColor = useColorModeValue('gray.700', 'white');
  let bgStatus = useColorModeValue('gray.400', '#1a202c');
  let colorStatus = useColorModeValue('white', 'gray.400');

  const link = `${window.location.origin}/auth/invitation/${id}`;
  const { onCopy } = useClipboard(link);

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

          <Text fontSize="md" color={textColor} fontWeight="bold" minWidth="100%">
            {name}
          </Text>
        </Flex>
      </Td>
      <Td>
        <Text fontSize="sm" color="gray.400" fontWeight="normal">
          {email}
        </Text>
      </Td>
      <Td>
        {isAdmin && (
          <Flex align="center">
            <Icon as={FaUserShield} color="green.400" w="24px" h="24px" me="6px" />
            <Text>Admin</Text>
          </Flex>
        )}
      </Td>
      <Td>
        <Badge bg={bgStatus} color={colorStatus} fontSize="16px" p="3px 10px" borderRadius="8px">
          {status}
        </Badge>
      </Td>
      {/* <Td>
        {isInvitation && (
          <Button colorScheme="teal" variant="link">
            Resend
          </Button>
        )}
      </Td> */}
      <Td>
        {isInvitation && (
          <Button colorScheme="teal" variant="link" onClick={onCopy}>
            Copy Link
          </Button>
        )}
      </Td>
      <Td>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<FiMoreVertical />}
            variant="ghost"
          />
          <MenuList>
            {isInvitation && <MenuItem isDisabled>Resend invitation email</MenuItem>}
            <MenuItem isDisabled={!isInvitation} onClick={() => onRemove?.(id)}>
              Remove
            </MenuItem>
          </MenuList>
        </Menu>
      </Td>
    </Tr>
  );
};
