import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react';
import { forwardRef, Ref, useImperativeHandle, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransactionIcon } from '../../../components/TransactionIcon';
import { getTxScanLink } from '../../../services/transactionsServices';
import { Transaction } from '../../../types';
import { getTransactionTypeLabel } from '../../../utils';

export interface TransactionSubmittedModalRef {
  open: (tx?: Transaction) => void;
}

interface TransactionSubmittedModalProps {
  chainId?: number;
}

export const TransactionSubmittedModal = forwardRef(
  ({ chainId }: TransactionSubmittedModalProps, ref: Ref<TransactionSubmittedModalRef>) => {
    const { isOpen, onClose, onOpen } = useDisclosure();
    const [transaction, setTransaction] = useState<Transaction>();

    useImperativeHandle(ref, () => ({
      open: (tx: Transaction | undefined) => {
        setTransaction(tx);
        onOpen();
      },
    }));

    const navigate = useNavigate();
    const bgColor = useColorModeValue('white', 'gray.900');
    const txtColor = useColorModeValue('gray.700', 'gray.400');

    return (
      <Modal
        size="sm"
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        closeOnEsc={true}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader> Transaction Submitted</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {transaction && (
              <Stack gap={5}>
                <Box bg={bgColor} boxShadow={'2xl'} rounded={'lg'} p={6} textAlign={'center'}>
                  <Center>
                    <TransactionIcon type={transaction?.type} />
                  </Center>
                  <Text mt={5} color={txtColor} px={3}>
                    {getTransactionTypeLabel(transaction.type)}
                  </Text>
                </Box>

                {transaction?.id && (
                  <Button
                    variant="outline"
                    onClick={() => navigate(`../transactions?id=${transaction.id}`)}
                  >
                    View Transaction
                  </Button>
                )}
                {transaction?.hash && chainId && (
                  <Link href={getTxScanLink(transaction.hash, chainId)} isExternal>
                    <Button variant="outline" rightIcon={<ExternalLinkIcon />}>
                      View Receipt
                    </Button>
                  </Link>
                )}
              </Stack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  },
);
