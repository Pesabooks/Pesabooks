import {
  Button,
  ButtonProps,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure
} from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { NoMetaMaskError } from '@web3-react/metamask';
import { Connector } from '@web3-react/types';
import { WalletConnect } from '@web3-react/walletconnect';
import { useEffect } from 'react';
import { metaMask } from '../../connectors/metaMask';
import { walletConnect } from '../../connectors/walletConnect';
import { getAddChainParameters } from '../../data/networks';
import { SelectWalletModal } from '../Modals/SelectWalletModal';
import { SwitchNetworkModal } from '../Modals/SwithNetworkModal';

interface ConnectWalletButtonProps extends ButtonProps {
  chainId: number;
}
export const ConnectWalletButton = ({ chainId, ...buttonProps }: ConnectWalletButtonProps) => {
  const { connector, isActive, chainId: connectedChainId, error } = useWeb3React();

  const {
    isOpen: isOpenWalletModal,
    onOpen: onOpenWalletModal,
    onClose: onCloseWalletModal,
  } = useDisclosure();

  const {
    isOpen: isOpenSwitchNetworkModal,
    onOpen: onOpenSwitchNetworkModal,
    onClose: onCloseSwitchNetworkModal,
  } = useDisclosure();

  const {
    isOpen: isOpenInstallMetamaskModal,
    onOpen: onOpenInstallMetamaskModal,
    onClose: onCloseInstallMetamaskModal,
  } = useDisclosure();

  const connect = async (connector: Connector) => {
    connector instanceof WalletConnect
      ? await connector.activate(chainId)
      : connector.activate(getAddChainParameters(chainId));

    onCloseWalletModal();
  };

  const switchNetwork = async () => {
    await connect(connector);
    onCloseSwitchNetworkModal();
  };

  // attempt to connect eagerly on mount
  useEffect(() => {
    void walletConnect.connectEagerly();
    void metaMask.connectEagerly();
  }, []);

  useEffect(() => {
    if (error) {
      if (error instanceof NoMetaMaskError) {
        onOpenInstallMetamaskModal();
      }
    }
  }, [error, onOpenInstallMetamaskModal]);


  
  return (
    <>
      {!isActive && (
        <Button onClick={onOpenWalletModal} {...buttonProps}>
          Connect Wallet
        </Button>
      )}

      {isActive && chainId !== connectedChainId && (
        <Button onClick={onOpenSwitchNetworkModal} {...buttonProps}>
          Switch Network
        </Button>
      )}

      <SelectWalletModal
        chainId={chainId}
        isOpen={isOpenWalletModal}
        onClose={onCloseWalletModal}
        onConnect={connect}
      />
      <SwitchNetworkModal
        chainId={chainId}
        isOpen={isOpenSwitchNetworkModal}
        onClose={onCloseSwitchNetworkModal}
        onSwith={switchNetwork}
        activatingConnector={connector}
      />

      <Modal isOpen={isOpenInstallMetamaskModal} onClose={onCloseInstallMetamaskModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select a wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>You'll need to open or install MetaMask to continue.</ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCloseInstallMetamaskModal}>
              Close
            </Button>
            <Link href="https://metamask.app.link/dapp/app.pesabooks.com" isExternal>
              <Button variant="outline">Open or install Metamask</Button>
            </Link>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
