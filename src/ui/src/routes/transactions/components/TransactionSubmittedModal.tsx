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
import { TransactionType } from '../../../types';
import { getTransactionTypeLabel } from '../../../utils';

export type openTxSubmittedModal = (type: TransactionType, hash: string|null, internalTxId?: number) => void;

export interface TransactionSubmittedModalRef {
  open: openTxSubmittedModal;
}

interface TransactionSubmittedModalProps {
  chainId?: number;
}

export const TransactionSubmittedModal = forwardRef(
  ({ chainId }: TransactionSubmittedModalProps, ref: Ref<TransactionSubmittedModalRef>) => {
    const { isOpen, onClose, onOpen } = useDisclosure();
    const [state, setState] =
      useState<{ type: TransactionType; internalTxId?: number; hash: string|null }>();

    useImperativeHandle(ref, () => ({
      open: (type: TransactionType, hash: string|null, internalTxId?: number) => {
        setState({ type, hash, internalTxId });
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
            {state && (
              <Stack gap={5}>
                <Box bg={bgColor} boxShadow={'2xl'} rounded={'lg'} p={6} textAlign={'center'}>
                  <Center>
                    <TransactionIcon type={state?.type} />
                  </Center>
                  <Text mt={5} color={txtColor} px={3}>
                    {getTransactionTypeLabel(state.type)}
                  </Text>
                </Box>

                {state?.internalTxId && (
                  <Button
                    variant="outline"
                    onClick={() => navigate(`../transactions?id=${state.internalTxId}`)}
                  >
                    View Transaction
                  </Button>
                )}
                {state?.hash && chainId && (
                  <Link href={getTxScanLink(state.hash, chainId)} isExternal>
                    <Button variant="outline" rightIcon={<ExternalLinkIcon />} w="100%">
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
