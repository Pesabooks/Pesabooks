import {
  Button,
  Flex,
  Heading,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaEllipsisV } from 'react-icons/fa';
import { MembersTable } from '../components/MembersTable';
import { InviteMemberFormValue, InviteMemberModal } from '../components/Modals/InviteMemberModal';
import { SetAdminModal } from '../components/Modals/SetAdminModal';
import { TransactionSubmittedModal } from '../components/Modals/TransactionSubmittedModal';
import { useAuth } from '../hooks/useAuth';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { usePool } from '../hooks/usePool';
import {
  createInvitation,
  getActiveInvitations,
  revokeInvitation
} from '../services/invitationService';
import { getMembers } from '../services/membersService';
import { getAddressLookUp, getAdminAddresses } from '../services/poolsService';
import { AddressLookup, Invitation } from '../types';
import { Member } from '../types/Member';

export const MembersPage = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const { pool } = usePool();
  const isAdmin = useIsAdmin();
  const {
    isOpen: isOpenInviteMemberModal,
    onClose: onCloseInviteMemberModal,
    onOpen: onOpenInviteMemberModal,
  } = useDisclosure();
  const {
    isOpen: isOpenTransactionConfirmation,
    onOpen: onOpenTransactionConfirmation,
    onClose: onCloseTransactionConfirmation,
  } = useDisclosure();
  const {
    isOpen: isOpenSetAdminModal,
    onClose: onCloseSetAdminModal,
    onOpen: onOpenSetAdminModal,
  } = useDisclosure();

  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [adminAddressess, setAdminAddressess] = useState<string[]>([]);
  const [lastTxHash, setLastTxHash] = useState('');
  const [lookups, setLookups] = useState<AddressLookup[]>([]);
  const [adminOperation, setAdminOperation] = useState<'add' | 'remove'>('add');

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

  const loadAdminAddresses = useCallback(() => {
    if (pool) getAdminAddresses(pool).then((addresses) => setAdminAddressess(addresses));
  }, [pool]);

  useEffect(() => {
    setIsLoading(true);
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (pool) {
      loadAdminAddresses();
      getAddressLookUp(pool.id, 'user').then(setLookups);
    }
  }, [loadAdminAddresses, pool]);

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

      onCloseInviteMemberModal();
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

  const addOrRemoveAdmin = (operation: 'add' | 'remove') => {
    setAdminOperation(operation);
    onOpenSetAdminModal();
  };

  const onAdminAdded = async (hash?: string) => {
    onCloseSetAdminModal();
    if (hash) {
      setLastTxHash(hash);
      onOpenTransactionConfirmation();
    }
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
        <Button variant="no-hover" p="0px">
          {isAdmin && (
            <Menu>
              <MenuButton alignSelf="flex-start">
                <Icon as={FaEllipsisV} color="gray.400" w="20px" h="20px" />
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => addOrRemoveAdmin('add')}> Add an Admin</MenuItem>
                <MenuItem onClick={() => addOrRemoveAdmin('remove')}> Remove an Admin</MenuItem>
                <MenuItem onClick={onOpenInviteMemberModal}> Invite a member</MenuItem>
              </MenuList>
            </Menu>
          )}
        </Button>
      </Flex>
      <MembersTable
        adminAddresses={adminAddressess}
        lookups={lookups}
        members={members}
        invitations={invitations}
        onRevoke={revoke}
        isLoading={isLoading}
      ></MembersTable>
      {isOpenInviteMemberModal && (
        <InviteMemberModal
          isOpen={isOpenInviteMemberModal}
          onClose={onCloseInviteMemberModal}
          onInvite={inviteMember}
        ></InviteMemberModal>
      )}
      {isOpenSetAdminModal && (
        <SetAdminModal
          operation={adminOperation}
          isOpen={isOpenSetAdminModal}
          onClose={onAdminAdded}
          lookups={lookups}
          adminAddressess={adminAddressess}
          onTxSuccess={loadAdminAddresses}
        />
      )}

      {isOpenTransactionConfirmation && pool && (
        <TransactionSubmittedModal
          isOpen={isOpenTransactionConfirmation}
          onClose={onCloseTransactionConfirmation}
          description="Your operation is submitted"
          chainId={pool.chain_id}
          hash={lastTxHash}
        />
      )}
    </>
  );
};
