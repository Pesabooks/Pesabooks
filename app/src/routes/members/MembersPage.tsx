import {
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Spacer,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { Web3Provider } from '@ethersproject/providers';
import {
  ReviewAndSendTransactionModal,
  ReviewAndSendTransactionModalRef,
} from '@pesabooks/components/ReviewAndSendTransactionModal';
import { ButtonWithAdmingRights } from '@pesabooks/components/withConnectedWallet';
import { useIsOrganizer, usePool, useSafeAdmins, useWeb3Auth } from '@pesabooks/hooks';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { estimateTransaction } from '../../services/estimationService';
import {
  createInvitation,
  getActiveInvitations,
  revokeInvitation,
  sendInvitation,
} from '../../services/invitationService';
import { deleteMember, getMembers } from '../../services/membersService';
import { BuildRemoveAdminTx } from '../../services/transaction-builder';
import { submitTransaction } from '../../services/transactionsServices';
import { Invitation } from '../../types';
import { Member } from '../../types/Member';
import {
  RemoveAdminFormValue,
  RemoveAdminModal,
  RemoveAdminModalRef,
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
  const reviewTxRef = useRef<ReviewAndSendTransactionModalRef>(null);

  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const signer = (provider as Web3Provider)?.getSigner();

  if (!provider) throw new Error('Provider is not set');
  if (!user) throw new Error('User is not set');
  if (!pool) throw new Error('Pool is not set');

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
      await createInvitation(pool, name, email, user.username ?? user.email);
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
    if (!invitation) throw new Error('Invitation not found');

    await sendInvitation(invitation);
    toast({
      title: `Invitation sent to ${invitation?.name}`,
      status: 'success',
      isClosable: true,
    });
  };

  const onpenRemoveAdmin = (id: string) => {
    const user = members.find((m) => m.user_id === id);
    if (!user) throw new Error('User not found');
    removeAdminModaldRef.current?.open(user.user!, removeAdmin);
  };

  const removeAdmin = async ({ user, threshold }: RemoveAdminFormValue) => {
    if (pool) {
      // if pool is not deployed
      if (!isDeployed) {
        //if user is not organizer throw error
        if (!isOrganizer) {
          toast({ status: 'error', title: 'You are not the organizer of this group' });
        }
        await deleteMember(pool.id, user.id);
        loadData();
        toast({ status: 'success', title: `${user.username} has been removed from the group` });
      } else {
        const transaction = await BuildRemoveAdminTx(
          signer,
          pool,
          user,
          currentThreshold,
          threshold,
        );

        reviewTxRef.current?.open(
          `Remove ${user.username} as a member`,
          transaction.type,
          () =>
            currentThreshold > 1
              ? Promise.resolve(BigNumber.from(0))
              : estimateTransaction(provider, transaction.transaction_data),
          async () => {
            const tx = await submitTransaction(user, signer, pool, transaction);
            if (tx?.hash) {
              (await (provider as Web3Provider)?.getTransaction(tx.hash))?.wait().then(() => {
                loadData();
              });
            }
            return { hash: tx?.hash, internalTxId: tx?.id };
          },
        );
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Members | {pool?.name}</title>
      </Helmet>
      <Card>
        <CardHeader>
          <Flex>
            <Heading as="h2" size="lg">
              Members
            </Heading>

            <Spacer />
            {!isDeployed && isOrganizer && (
              <ButtonWithAdmingRights onClick={onOpen}> Invite a member</ButtonWithAdmingRights>
            )}
          </Flex>
        </CardHeader>
        <CardBody>
          <MembersTable
            adminAddresses={safeAdmins}
            members={members}
            invitations={invitations}
            onRevoke={revoke}
            onResendInvitation={resendInvitation}
            isLoading={isLoading}
            onRemoveAdmin={onpenRemoveAdmin}
          ></MembersTable>
        </CardBody>
      </Card>

      {isOpen && (
        <InviteMemberModal
          isOpen={isOpen}
          onClose={onClose}
          onInvite={inviteMember}
        ></InviteMemberModal>
      )}
      <RemoveAdminModal ref={removeAdminModaldRef} />
      <ReviewAndSendTransactionModal ref={reviewTxRef} />
    </>
  );
};
