import {
  Box,
  Center,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { forwardRef, Ref, useImperativeHandle, useState } from 'react';
import { TransactionType } from '../../../types';
import { getTransactionTypeLabel } from '../../../utils';

interface SubmittingTxModalState {
  type: TransactionType;
  description?: string;
}

export interface SubmittingTxModalRef {
  open: (type: TransactionType, description?: string) => void;
  close: () => void;
}

export const SubmittingTransactionModal = forwardRef((_, ref: Ref<SubmittingTxModalRef>) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [state, setState] = useState<SubmittingTxModalState>();
  const bgColor = useColorModeValue('white', 'gray.900');
  const txtColor = useColorModeValue('gray.700', 'gray.400');

  useImperativeHandle(ref, () => ({
    open: (type: TransactionType, description?: string) => {
      setState({ type, description });
      onOpen();
    },
    close: () => onClose(),
  }));

  return (
    <Modal
      size="sm"
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={true}
      closeOnEsc={true}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader> Sending Transaction</ModalHeader>
        <ModalBody>
          <Stack gap={5}>
            <Box bg={bgColor} boxShadow={'2xl'} rounded={'lg'} p={6} textAlign={'center'}>
              <Center>
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="blue.500"
                  size="xl"
                ></Spinner>
              </Center>
              <Text mt={5} color={txtColor} px={3}>
                {state?.description ?? getTransactionTypeLabel(state?.type)}
              </Text>
            </Box>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});
