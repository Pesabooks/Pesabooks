import { Flex, Heading, Spacer, useDisclosure, useToast } from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ReviewAndSubmitTransaction,
  ReviewAndSubmitTransactionRef
} from '../../components/ReviewAndSubmitTransaction';
import { ButtonWithAdmingRights } from '../../components/withConnectedWallet';
import { useIsOrganizer } from '../../hooks/useIsOrganizer';
import { usePool } from '../../hooks/usePool';
import { useSafeAdmins } from '../../hooks/useSafeAdmins';
import { useWeb3Auth } from '../../hooks/useWeb3Auth';
import {
  createInvitation,
  getActiveInvitations,
  revokeInvitation,
  sendInvitation
} from '../../services/invitationService';
import { getMembers } from '../../services/membersService';
import { removeAdmin } from '../../services/transactionsServices';
import { Invitation } from '../../types';
import { Member } from '../../types/Member';
import {
  RemoveAdminFormValue,
  RemoveAdminModal,
  RemoveAdminModalRef
} from '../settings/components/RemoveAdminModal';
import { InviteMemberFormValue, InviteMemberModal } from './components/InviteMemberModal';
import { MembersTable } from './components/MembersTable';

export const MembersPage = () => {
  const { user, provider } = useWeb3Auth();
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const { pool, isDeployed } = usePool();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { safeAdmins, threshold: currentThreshold } = useSafeAdmins();
  const isOrganizer = useIsOrganizer();
  const removeAdminModaldRef = useRef<RemoveAdminModalRef>(null);
  const reviewTxRef = useRef<ReviewAndSubmitTransactionRef>(null);

  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const signer = (provider as Web3Provider)?.getSigner();

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
      await createInvitation(pool, name, email, user.username!);
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

  const onpenRemoveAdmin = (id: string) => {
    const user = members.find((m) => m.user_id === id);
    removeAdminModaldRef.current?.open(user?.user!, reviewRemoveAdminTx);
  };

  const reviewRemoveAdminTx = (formValue: RemoveAdminFormValue) => {
    const { user } = formValue;
    reviewTxRef.current?.review(
      `Remove ${user.username} as an Admin`,
      'removeOwner',
      formValue,
      onRemoveAdmin,
    );
  };

  const onRemoveAdmin = async (confirmed: boolean, { user, threshold }: RemoveAdminFormValue) => {
    if (confirmed && pool) {
      try {
        reviewTxRef.current?.openSubmitting('removeOwner');

        let tx = await removeAdmin(signer, pool, user, currentThreshold, threshold);
        if (tx) reviewTxRef.current?.openTxSubmitted(tx.type, tx.hash, tx.id);
        if (tx?.hash) {
          (await (provider as Web3Provider)?.getTransaction(tx.hash)).wait().then(() => {
            loadData();
          });
        }
      } catch (e: any) {
        toast({
          title: e?.data?.message ?? e.message,
          status: 'error',
          isClosable: true,
        });
      } finally {
        reviewTxRef.current?.closeSubmitting();
      }
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

        <Spacer />
        {!isDeployed && isOrganizer && (
          <ButtonWithAdmingRights onClick={onOpen}> Invite a member</ButtonWithAdmingRights>
        )}
      </Flex>

      <MembersTable
        adminAddresses={safeAdmins}
        members={members}
        invitations={invitations}
        onRevoke={revoke}
        onResendInvitation={resendInvitation}
        isLoading={isLoading}
        onRemoveAdmin={onpenRemoveAdmin}
      ></MembersTable>
      {isOpen && (
        <InviteMemberModal
          isOpen={isOpen}
          onClose={onClose}
          onInvite={inviteMember}
        ></InviteMemberModal>
      )}
      <RemoveAdminModal ref={removeAdminModaldRef} currentThreshold={currentThreshold} />
      <ReviewAndSubmitTransaction ref={reviewTxRef} chainId={pool!.chain_id} />
    </>
  );
};
