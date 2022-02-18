import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React from 'react';

interface ApproveTokenModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onApprove: () => void;
  isApproving: boolean;
}

export const ApproveTokenModal = ({
  isOpen,
  onOpen,
  onClose,
  onApprove,
  isApproving,
}: ApproveTokenModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Approve deposits</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Your account contract require you to send an approval transaction before depositing.
          </Text>
          <Text mt={4}>This is necessary once per account</Text>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onApprove} isLoading={isApproving}>
            Confirm Approval
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
