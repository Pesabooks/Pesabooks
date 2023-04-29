import {
  Alert,
  AlertDescription,
  AlertTitle,
  Box,
  createStandaloneToast,
  Progress,
} from '@chakra-ui/react';
import { defaultProvider } from '../services/blockchainServices';
import { eventBus, TransactionMessage } from '../services/events/eventBus';
import theme from '../theme/theme';

const PendingNotification = ({ description }: any) => {
  return (
    <>
      <Progress size="sm" isIndeterminate />
      <Alert status="info">
        <Box>
          <AlertTitle>Your transaction has started!</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Box>
      </Alert>
    </>
  );
};

export const notifyTransaction = async (chain_id: number, txHash: string, description?: string) => {
  const { toast } = createStandaloneToast({ theme, colorMode: 'dark' });

  toast({
    id: txHash,
    status: 'info',
    duration: null,
    isClosable: false,
    position: 'bottom-right',
    render: () => <PendingNotification description={description} />,
  });

  const provider = defaultProvider(chain_id);
  var tx = await provider.getTransaction(txHash);

  tx?.wait().then(
    (receipt) => {
      toast.update(tx.hash, {
        title: 'Your transaction has succeeded',
        description: description,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    },
    (reason) => {
      toast.update(tx.hash, {
        title: 'Your transaction failed',
        description: description,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  );
};

eventBus
  .channel('transaction')
  .on<TransactionMessage>('execution_sent', ({ payload: { chainId, blockchainTransaction } }) => {
    notifyTransaction(chainId, blockchainTransaction.hash);
  });
