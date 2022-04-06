import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { InjectedConnector } from '@web3-react/injected-connector';
import { networks } from '../../data/networks';

export interface SwitchNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwith: () => void;
  activatingConnector: AbstractConnector | undefined;
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
          To continue you must switch the network your wallet is on to Polygon, or connect another
          wallet.
        </ModalBody>

        <ModalFooter>
          {activatingConnector instanceof InjectedConnector && (
            <Button mr={3} onClick={onSwith}>
              Switch to {networks[chainId].chainName}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
