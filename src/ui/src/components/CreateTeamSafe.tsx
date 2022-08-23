import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Alert,
  AlertDescription,
  Button,
  Link,
  Text,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { useRef } from 'react';
import { usePool } from '../hooks/usePool';
import { useWeb3Auth } from '../hooks/useWeb3Auth';
import {
  ConfirmTransactionRef,
  ReviewTransactionModal
} from '../routes/transactions/components/ReviewTransactionModal';
import { SubmittingTransactionModal } from '../routes/transactions/components/SubmittingTransactionModal';
import { deployNewSafe } from '../services/poolsService';

export const CreateTeamSafe = () => {
  const { provider } = useWeb3Auth();
  const { pool, refresh } = usePool();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const confirmTxRef = useRef<ConfirmTransactionRef>(null);
  const toast = useToast();

  const confirmTx = () => {
    confirmTxRef.current?.open(`Create group wallet`, 'createSafe', null, onDeployNewSafe);
  };

  const onDeployNewSafe = async (confirmed: boolean) => {
    if (confirmed && pool?.id && provider) {
      try {
        onOpen();
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
        onClose();
      }
    }
  };

  return (
    <>
      {!pool?.gnosis_safe_address && (
        <Alert
          status="warning"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="150px"
        >
          <Button mb={4} variant="outline" onClick={confirmTx}>
            Create Group Wallet
          </Button>
          <AlertDescription maxWidth="sm">Setup a new Gnosis safe to get started</AlertDescription>
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
        </Alert>
      )}

      <SubmittingTransactionModal
        type="createSafe"
        isOpen={isOpen}
        onClose={onClose}
        description="Wait while the group wallet is created"
      />
      <ReviewTransactionModal ref={confirmTxRef} />
    </>
  );
};
