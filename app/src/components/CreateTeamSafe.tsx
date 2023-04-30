import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Button, Card, Flex, Heading, Link, Stack, Text } from '@chakra-ui/react';
import { usePool, useWeb3Auth } from '@pesabooks/hooks';
import { useEffect, useRef, useState } from 'react';
import {
  ReviewAndSendTransactionModal,
  ReviewAndSendTransactionModalRef,
} from './ReviewAndSendTransactionModal';

import { estimateSafeCreation } from '../services/estimationService';
import { getPendingInvitationCount } from '../services/invitationService';
import { deployNewSafe } from '../services/poolsService';

export const CreateTeamSafe = () => {
  const { provider, user } = useWeb3Auth();
  const { pool, isDeployed } = usePool();
  const reviewTxRef = useRef<ReviewAndSendTransactionModalRef>(null);

  const [hasPendingInvitations, setHasPendingInvitations] = useState(false);

  const isOrganizer = pool?.organizer.id === user?.id;

  useEffect(() => {
    const fetchData = async () => {
      if (pool?.id) {
        const pendingInvitationsCount = await getPendingInvitationCount(pool.id);
        setHasPendingInvitations(pendingInvitationsCount > 0);
      }
    };
    fetchData();
  }, [pool?.id]);

  const confirmTx = () => {
    if (!provider) throw new Error('Provider not initialized');

    reviewTxRef.current?.open(
      `Create group wallet`,
      'createSafe',
      () => estimateSafeCreation(provider),
      onDeployNewSafe,
      { closeOnSuccess: true },
    );
  };

  const onDeployNewSafe = async () => {
    if (pool?.id && provider) {
      await deployNewSafe(provider, pool?.id);
    }
  };
  if (isDeployed) return null;

  return (
    <>
      {!hasPendingInvitations && (
        <Card flexDirection="column" alignItems="center" p={10}>
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

      <ReviewAndSendTransactionModal ref={reviewTxRef} />
    </>
  );
};
