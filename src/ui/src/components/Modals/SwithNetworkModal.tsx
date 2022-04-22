import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay
} from '@chakra-ui/react';
import { Connector } from '@web3-react/types';
import { networks } from '../../data/networks';
export interface SwitchNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwith: () => void;
  activatingConnector: Connector;
  chainId: number;
}
export const SwitchNetworkModal = ({
  chainId,
  isOpen,
  onClose,
  onSwith,
  activatingConnector,
}: SwitchNetworkModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Wrong Network</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          To continue you must switch the network your wallet is on to{' '}
          <b>{networks[chainId].chainName}</b>, or connect another wallet.
        </ModalBody>

        <ModalFooter>
          <Button onClick={onSwith}>Switch to {networks[chainId].chainName}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
