import { Flex, Heading, Spacer, useDisclosure, useToast } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ButtonWithAdmingRights } from '../../components/withConnectedWallet';
import { usePool } from '../../hooks/usePool';
import { useWeb3Auth } from '../../hooks/useWeb3Auth';
import {
  createInvitation,
  getActiveInvitations,
  revokeInvitation,
  sendInvitation
} from '../../services/invitationService';
import { getMembers } from '../../services/membersService';
import { Invitation } from '../../types';
import { Member } from '../../types/Member';
import { InviteMemberFormValue, InviteMemberModal } from './components/InviteMemberModal';
import { MembersTable } from './components/MembersTable';

export const MembersPage = () => {
  const { user } = useWeb3Auth();
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const { pool, safeAdmins } = usePool();
  const { isOpen, onClose, onOpen } = useDisclosure();

  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      if (pool) {
        const members = await getMembers(pool.id);
        const activeInvitations = await getActiveInvitations(pool.id);
        setMembers(members ?? []);
        setInvitations(activeInvitations ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [pool]);

  useEffect(() => {
    setIsLoading(true);
    loadData();
  }, [loadData]);

  const inviteMember = async ({ name, email }: InviteMemberFormValue) => {
    if (!pool) throw new Error('Argument Exception: pool');
    if (!user) throw new Error('Argument Exception: user');
    try {
      await createInvitation(pool, name, email, user);
      toast({
        title: `${name} has been invited to join the group`,
        status: 'success',
        isClosable: true,
      });

      onClose();
      await loadData();
    } catch (error: any) {
      toast({
        title: error.message,
        status: 'warning',
        isClosable: true,
      });
    }
  };

  const revoke = async (invitation_id: string) => {
    await revokeInvitation(invitation_id);
    await loadData();
    toast({
      title: 'Invitation revoked',
      status: 'success',
      isClosable: true,
    });
  };

  const resendInvitation = async (invitation_id: string) => {
    const invitation = invitations.find((i) => i.id === invitation_id);
    await sendInvitation(invitation!);
    toast({
      title: `Invitation sent to ${invitation?.name}`,
      status: 'success',
      isClosable: true,
    });
  };

  return (
    <>
      <Helmet>
        <title>Members | {pool?.name}</title>
      </Helmet>
      <Flex justify="space-between" align="center" my={4} mr={4}>
        <Heading as="h2" size="lg">
          Members
        </Heading>
        <Spacer />
        <ButtonWithAdmingRights onClick={onOpen} >
          {' '}
          Invite a member
        </ButtonWithAdmingRights>
      </Flex>
      <MembersTable
        adminAddresses={safeAdmins}
        members={members}
        invitations={invitations}
        onRevoke={revoke}
        onResendInvitation={resendInvitation}
        isLoading={isLoading}
      ></MembersTable>
      {isOpen && (
        <InviteMemberModal
          isOpen={isOpen}
          onClose={onClose}
          onInvite={inviteMember}
        ></InviteMemberModal>
      )}
    </>
  );
};
