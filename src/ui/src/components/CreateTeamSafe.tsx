import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Button, Flex, Heading, Link, Stack, Text, useToast } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { usePool } from '../hooks/usePool';
import { useWeb3Auth } from '../hooks/useWeb3Auth';
import {
  ReviewTransactionModal,
  ReviewTransactionModalRef
} from '../routes/transactions/components/ReviewTransactionModal';
import {
  SubmittingTransactionModal,
  SubmittingTxModalRef
} from '../routes/transactions/components/SubmittingTransactionModal';
import { getPendingInvitationCount } from '../services/invitationService';
import { deployNewSafe } from '../services/poolsService';
import { Card } from './Card';

export const CreateTeamSafe = () => {
  const { provider, user } = useWeb3Auth();
  const { pool, refresh, isDeployed } = usePool();
  const confirmTxRef = useRef<ReviewTransactionModalRef>(null);
  const submittingRef = useRef<SubmittingTxModalRef>(null);
  const toast = useToast();
  const [hasPendingInvitations, setHasPendingInvitations] = useState(false);

  const isOrganizer = pool?.organizer.id === user?.id;

  useEffect(() => {
    const fetchData = async () => {
      if (pool?.id) {
        const pendingInvitationsCount = await getPendingInvitationCount(pool.id);
        setHasPendingInvitations(pendingInvitationsCount! > 0);
      }
    };
    fetchData();
  }, [pool?.id]);

  const confirmTx = () => {
    confirmTxRef.current?.open(`Create group wallet`, 'createSafe', null, onDeployNewSafe);
  };

  const onDeployNewSafe = async (confirmed: boolean) => {
    if (confirmed && pool?.id && provider) {
      try {
        submittingRef.current?.open('createSafe', 'Wait while the group wallet is created');
        await deployNewSafe(provider, pool?.id);
        refresh();
      } catch (e: any) {
        const message = typeof e === 'string' ? e : e?.data?.message ?? e.message;
        toast({
          title: message,
          status: 'error',
          isClosable: true,
        });
        throw e;
      } finally {
        submittingRef.current?.close();
      }
    }
  };
  if (isDeployed) return null;

  return (
    <>
      {!hasPendingInvitations && (
        <Card flexDirection="column" alignItems="center">
          <Button mb={4} variant="outline" onClick={confirmTx} w={200}>
            Create Group Wallet
          </Button>
          <Text color={'gray.500'}>Setup a new Gnosis safe to get started</Text>
          <Text as="u">
            <Link
              color="gray.400"
              href="https://help.gnosis-safe.io/en/articles/3876456-what-is-gnosis-safe"
              isExternal
              fontSize="sm"
            >
              What is a Gnosis Safe? <ExternalLinkIcon mx="2px" />
            </Link>
          </Text>
          <Flex mt={10}>
            <Text color={'gray.500'}>
              Once the wallet is deployed, adding or removing a member requires a vote 
            </Text>
          </Flex>
        </Card>
      )}

      {hasPendingInvitations && isOrganizer && (
        <Card>
          <Stack>
            {/* <CheckCircleIcon boxSize={'50px'} color={'green.500'} /> */}
            <Heading as="h2" size="lg" mb={2}>
              What's next
            </Heading>
            <Text>
              <b> All members must accept their invitations </b> before the group wallet can be
              created
            </Text>
            <Text>
              <b>As the organizer, is up to you to get everyone to join.</b> Please reach out to
              everyone and let them know.
            </Text>
            <br />
            <Text fontSize="md" textDecoration="underline">
              What happen if some invitees don't join?
            </Text>
            <Text>
              As the organizer, you can remove invitees who are not ready to join and invite new
              members
            </Text>
          </Stack>
        </Card>
      )}

      {hasPendingInvitations && !isOrganizer && (
        <Card>
          <Heading as="h2" size="lg" mb={2}>
            What's next
          </Heading>
          <Text>
            <b> Sit tight for now.</b>
          </Text>
          <Text>
            The orgnaniser is getting everyone to accept their invitation. Once everyone has joined,
            the organizer can create the group wallet.
          </Text>
        </Card>
      )}

      <SubmittingTransactionModal ref={submittingRef} />
      <ReviewTransactionModal ref={confirmTxRef} />
    </>
  );
};
