import {
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import QRCode from 'qrcode.react';
import { WalletAddress } from '../../../components/WalletAddress';

export interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  chainId: number;
}

export const ReceiveModal = ({ isOpen, onClose, address, chainId }: ReceiveModalProps) => {
  return (
    <Modal size="lg" isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Reiceive Funds</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex mt={10} direction="column" alignItems="center">
            <Box>
              <QRCode size={200} value={address} />
            </Box>
            <Text mt={5} mb={5}>
              Scan address to receive payment
            </Text>
            <WalletAddress chainId={chainId} address={address} type="address" />
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
