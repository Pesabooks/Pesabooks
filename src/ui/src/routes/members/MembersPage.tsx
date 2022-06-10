import { Flex, Heading, Spacer, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ButtonWithConnectedWallet } from '../../components/withConnectedWallet';
import { useAuth } from '../../hooks/useAuth';
import { usePool } from '../../hooks/usePool';
import {
  createInvitation,
  getActiveInvitations,
  revokeInvitation
} from '../../services/invitationService';
import { getMembers } from '../../services/membersService';
import { getAddressLookUp } from '../../services/poolsService';
import { AddressLookup, Invitation } from '../../types';
import { Member } from '../../types/Member';
import { InviteMemberFormValue, InviteMemberModal } from './components/InviteMemberModal';
import { MembersTable } from './components/MembersTable';

export const MembersPage = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const { pool } = usePool();
  const { isOpen, onClose, onOpen } = useDisclosure();

  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [lookups, setLookups] = useState<AddressLookup[]>([]);

 

  const loadData = useCallback(async () => {
    try {
      if (pool) {
        const members = await getMembers(pool.id);
        getAddressLookUp(pool.id, 'user').then(setLookups);
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
      <Flex justify="space-between" align="center" my={4} mr={4}>
        <Heading as="h2" size="lg">
          Members
        </Heading>
        <Spacer />
        <ButtonWithConnectedWallet onClick={onOpen} onlyAdmin={true}> Invite a member</ButtonWithConnectedWallet>
      </Flex>
      <MembersTable
        lookups={lookups}
        members={members}
        invitations={invitations}
        onRevoke={revoke}
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
