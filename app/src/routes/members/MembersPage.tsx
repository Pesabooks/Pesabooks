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
import { estimateTransaction } from '@pesabooks/services/estimationService';
import {
  createInvitation,
  getActiveInvitations,
  revokeInvitation,
  sendInvitation,
} from '@pesabooks/services/invitationService';
import { deleteMember, getMembers } from '@pesabooks/services/membersService';
import { BuildRemoveAdminTx } from '@pesabooks/services/transaction-builder';
import { submitTransaction } from '@pesabooks/services/transactionsServices';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  RemoveAdminFormValue,
  RemoveAdminModal,
  RemoveAdminModalRef,
} from '../settings/components/RemoveAdminModal';
import { InviteMemberFormValue, InviteMemberModal } from './components/InviteMemberModal';
import { MembersTable } from './components/MembersTable';

export const MembersPage = () => {
  const { user, provider } = useWeb3Auth();
  const { pool, isDeployed } = usePool();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { safeAdmins, threshold: currentThreshold } = useSafeAdmins();
  const isOrganizer = useIsOrganizer();
  const removeAdminModaldRef = useRef<RemoveAdminModalRef>(null);
  const reviewTxRef = useRef<ReviewAndSendTransactionModalRef>(null);
  const queryClient = useQueryClient();
  const toast = useToast();
  const signer = (provider as Web3Provider)?.getSigner();

  if (!provider) throw new Error('Provider is not set');
  if (!pool) throw new Error('Pool is not set');

  const membersKey = [pool.id, 'members'];
  const invitationsKey = [pool.id, 'invitations'];

  const { data: members, isLoading } = useQuery({
    queryKey: membersKey,
    queryFn: () => getMembers(pool.id),
    enabled: !!pool.id,
  });

  const { data: invitations } = useQuery({
    queryKey: invitationsKey,
    queryFn: () => getActiveInvitations(pool.id),
    enabled: !!pool.id,
  });

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
      queryClient.invalidateQueries(invitationsKey);
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
    queryClient.invalidateQueries(invitationsKey);
    toast({
      title: 'Invitation revoked',
      status: 'success',
      isClosable: true,
    });
  };

  const resendInvitation = async (invitation_id: string) => {
    const invitation = invitations?.find((i) => i.id === invitation_id);
    if (!invitation) throw new Error('Invitation not found');

    await sendInvitation(invitation);
    toast({
      title: `Invitation sent to ${invitation?.name}`,
      status: 'success',
      isClosable: true,
    });
  };

  const onpenRemoveAdmin = (id: string) => {
    const user = members?.find((m) => m.user_id === id);
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
        queryClient.invalidateQueries(membersKey);
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
            const tx = await submitTransaction(signer, pool, transaction);
            if (tx?.hash) {
              (await (provider as Web3Provider)?.getTransaction(tx.hash))?.wait().then(() => {
                queryClient.invalidateQueries(membersKey);
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
            members={members ?? []}
            invitations={invitations ?? []}
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
