import { Alert, AlertDescription, AlertTitle, Box, Progress, useToast } from '@chakra-ui/react';
import { ContractTransaction } from 'ethers';

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

  const notify = async (tx: ContractTransaction, description: string) => {
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

  return { notify };
};
