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
    useColorModeValue
} from '@chakra-ui/react';
import { TransactionType } from '../../../types';
import { getTransactionTypeLabel } from '../../../utils';

interface SubmittingTransactionModalProps {
  isOpen: boolean;
  onClose: () => void; 
  type: TransactionType;
  description?:string
}

export const SubmittingTransactionModal = ({
  isOpen,
  onClose,
  type,
  description
}: SubmittingTransactionModalProps) => {
  const bgColor = useColorModeValue('white', 'gray.900');
  const txtColor = useColorModeValue('gray.700', 'gray.400');

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
                >
                </Spinner>
              </Center>
              <Text mt={5} color={txtColor} px={3}>
                {description ?? getTransactionTypeLabel(type)}
              </Text>
            </Box>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
