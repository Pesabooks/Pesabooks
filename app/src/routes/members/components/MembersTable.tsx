import { Table, Tbody, Th, Thead, Tr } from '@chakra-ui/react';
import Loading from '@pesabooks/components/Loading';
import { Invitation, Member } from '../../../types';
import { MemberTableRow } from './MemberTableRow';

interface MembersTableProps {
  members: Member[];
  invitations: Invitation[];
  onRevoke: (id: string) => void;
  onResendInvitation: (id: string) => void;
  onAddAdmin?: (id: string) => void;
  onRemoveAdmin: (id: string) => void;
  isLoading: boolean;
  adminAddresses: string[];
}
export const MembersTable = ({
  members,
  invitations,
  onRevoke,
  onRemoveAdmin,
  onResendInvitation,
  adminAddresses,
  isLoading,
}: MembersTableProps) => {
  return (
    <>
      <Table variant="simple">
        <Thead>
          <Tr my=".8rem" pl="0px" color="gray.400">
            <Th pl="0px" color="gray.400">
              Member
            </Th>
            <Th color="gray.400">Wallet</Th>
            <Th color="gray.400">role</Th>
            <Th color="gray.400">Status</Th>
            <Th></Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {members.map((member) => {
            return (
              <MemberTableRow
                key={member.user_id}
                name={member.user?.username}
                wallet={member.user?.wallet}
                active={member.active}
                status={member.active ? 'active' : 'inactive'}
                isInvitation={false}
                id={member.user_id}
                onRemove={onRemoveAdmin}
              />
            );
          })}
          {invitations.map((invitation) => {
            return (
              <MemberTableRow
                key={invitation.id}
                name={invitation.name}
                active={invitation.active}
                status="invited"
                isInvitation={true}
                id={invitation.id}
                onRemove={onRevoke}
                onResendInvitation={onResendInvitation}
              />
            );
          })}
        </Tbody>
      </Table>
      {isLoading && <Loading m={4} />}
    </>
  );
};
