import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Box,
  Flex,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text
} from '@chakra-ui/react';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';
import { ConnectWithMetamask } from '../Connectors/ConnectWithMetamask';
import { ConnectWithWalletConnect } from '../Connectors/ConnectWithWalletConnect';

interface SelectWalletModalProps {
  chainId: number;
  isOpen: boolean;
  onClose: () => void;
  onConnect: (connector: MetaMask | WalletConnect) => void;
}

export const SelectWalletModal = ({
  chainId,
  isOpen,
  onConnect,
  onClose,
}: SelectWalletModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select a Wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex p="8" direction="column" gap="4">
            <ConnectWithMetamask onConnect={(connector) => onConnect(connector)} />
            <ConnectWithWalletConnect onConnect={(connector) => onConnect(connector)} />
          </Flex>
          <Box mt="8">
            <Text fontWeight="bold">New to Ethereum?</Text>
            <Text fontSize="sm">
              Pesabooks is a DeFi app on Ethereum. To invest and trade here, you'll first need to
              set up an Ethereum Wallet.
              <Link color="teal.500" href="https://ethereum.org/en/wallets" isExternal>
                Learn More <ExternalLinkIcon mx="2px" />
              </Link>
            </Text>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
