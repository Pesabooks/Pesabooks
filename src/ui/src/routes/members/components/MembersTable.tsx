import { Table, Tbody, Th, Thead, Tr } from '@chakra-ui/react';
import Loading from '../../../components/Loading';
import { AddressLookup, Invitation } from '../../../types';
import { Member } from '../../../types/Member';
import { MemberTableRow } from './MemberTableRow';

interface MembersTableProps {
  members: Member[];
  lookups: AddressLookup[];
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
  lookups,
}: MembersTableProps) => {
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
              <MemberTableRow
                key={member.user_id}
                name={member.user?.name}
                email={member.user?.email}
                active={member.active}
                status={member.active ? 'active' : 'inactive'}
                role={member.role}
                isInvitation={false}
                id={member.user_id}
              />
            );
          })}
          {invitations.map((invitation, index) => {
            return (
              <MemberTableRow
                key={invitation.id}
                name={invitation.name}
                email={invitation.email}
                active={invitation.active}
                status="invited"
                isInvitation={true}
                id={invitation.id}
                onRemove={onRevoke}
              />
            );
          })}
        </Tbody>
      </Table>
      {isLoading && <Loading m={4} />}
    </>
  );
};
