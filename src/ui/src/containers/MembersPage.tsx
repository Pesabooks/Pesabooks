import { Button, Flex, Heading, Spacer, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MembersTable } from '../components/MembersTable';
import { InviteMemberFormValue, InviteMemberModal } from '../components/Modals/InviteMemberModal';
import { useAuth } from '../hooks/useAuth';
import { usePool } from '../hooks/usePool';
import {
  createInvitation,
  getActiveInvitations,
  revokeInvitation
} from '../services/invitationService';
import { getMembers } from '../services/membersService';
import { Invitation } from '../types';
import { Member } from '../types/Member';

export const MembersPage = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const { pool } = usePool();
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
        title: `Invitation created. Please copy the link and send it to the member`,
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

  return (
    <>
      <Helmet>
        <title>Members | {pool?.name}</title>
      </Helmet>
      <Flex my={4} mr={4}>
        <Heading as="h2" size="lg">
          Members
        </Heading>
        <Spacer />
        <Button onClick={onOpen}> Invite a member</Button>
      </Flex>
      <MembersTable
        members={members}
        invitations={invitations}
        onRevoke={revoke}
        isLoading={isLoading}
      ></MembersTable>
      <InviteMemberModal
        isOpen={isOpen}
        onClose={onClose}
        onInvite={inviteMember}
      ></InviteMemberModal>
    </>
  );
};
