import { Alert, AlertIcon, Button, useDisclosure, useToast } from '@chakra-ui/react';
import { useRef } from 'react';
import { usePool } from '../hooks/usePool';
import { useWeb3Auth } from '../hooks/useWeb3Auth';
import {
  ConfirmTransactionRef, ReviewTransactionModal
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
    confirmTxRef.current?.open(`Create team safe`, 'createSafe', null, onDeployNewSafe);
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
        <Button w="100%" variant="ghost" color="white" onClick={confirmTx}>
          <Alert status="warning" justifyContent="center">
            <AlertIcon />
            Create team safe
          </Alert>
        </Button>
      )}
      <SubmittingTransactionModal
        type="createSafe"
        isOpen={isOpen}
        onClose={onClose}
        description="Wait while the group safe is created"
      />
      <ReviewTransactionModal ref={confirmTxRef}  />
    </>
  );
};
