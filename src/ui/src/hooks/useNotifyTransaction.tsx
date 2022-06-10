import {
  Alert,
  AlertDescription,
  AlertTitle,
  Box,
  createStandaloneToast,
  Progress,
  useToast
} from '@chakra-ui/react';
import { ContractTransaction } from 'ethers';
import theme from '../theme/theme';

const PendingNotification = ({ description }: any) => {
  return (
    <>
      <Progress size="sm" isIndeterminate />
      <Alert status="info">
        <Box>
          <AlertTitle>Operation pending!</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Box>
      </Alert>
    </>
  );
};

export const useNotifyTransaction = () => {
  const toast = useToast();

  return {
    notify: (tx: ContractTransaction, description: string) => notify(toast, tx, description),
  };
};

// Create a notification from outside of React Components
export const notifyTransaction = (tx: ContractTransaction, description: string) => {
  const toast = createStandaloneToast({theme});
  notify(toast, tx, description);
};

const notify = (toast: any, tx: ContractTransaction, description: string) => {
  toast({
    id: tx.hash,
    title: 'Operation pending',
    description: description,
    status: 'info',
    duration: null,
    isClosable: false,
    position: 'bottom-right',
    render: () => <PendingNotification description={description} />,
  });

  tx.wait().then(
    (receipt) => {
      toast.update(tx.hash, {
        title: 'Transaction Confirmed',
        description: description,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    },
    (reason) => {
      toast.update(tx.hash, {
        title: 'Transaction rejected',
        description: description,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  );
};
