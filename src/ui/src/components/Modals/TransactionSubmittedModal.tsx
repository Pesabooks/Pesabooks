import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
    Button,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay
} from '@chakra-ui/react';
import React from 'react';
import { getTxScanLink } from '../../services/transactionsServices';

interface TransactionSubmittedModalProps {
  isOpen: boolean;
  onClose: () => void;
  description: string;
  hash: string;
  chainId: number;
}
export const TransactionSubmittedModal = ({
  description,
  isOpen,
  onClose,
  hash,
  chainId,
}: TransactionSubmittedModalProps) => {
  const link = getTxScanLink(hash, chainId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Transaction Pending</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{description}</ModalBody>

        <ModalFooter>
          <Link href={link} isExternal>
            <Button rightIcon={<ExternalLinkIcon />}>View Receipt</Button>
          </Link>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
