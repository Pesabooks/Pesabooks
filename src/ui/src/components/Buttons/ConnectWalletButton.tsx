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
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector';
import { useEffect, useState } from 'react';
import { injected, walletconnect } from '../../connectors';
import { useEagerConnect, useInactiveListener } from '../../hooks/web3';
import { getNetwork } from '../../services/blockchainServices';
import { ConnectorNames } from '../../types/ConnectorNames';
import { SelectWalletModal } from '../Modals/SelectWalletModal';
import { SwitchNetworkModal } from '../Modals/SwithNetworkModal';

function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return "You'll need to open or install MetaMask to continue.";
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network.";
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect
  ) {
    return 'Please authorize this website to access your Ethereum account.';
  } else {
    console.error(error);
    return 'An unknown error occurred. Check the console for more details.';
  }
}

interface ConnectWalletButtonProps extends ButtonProps {
  chainId: number;
}
export const ConnectWalletButton = ({ chainId, ...buttonProps }: ConnectWalletButtonProps) => {
  const { connector, activate, active, chainId: connectedChainId } = useWeb3React();
  const connectorsByName = {
    [ConnectorNames.Injected]: injected(chainId),
    [ConnectorNames.WalletConnect]: walletconnect(chainId),
  };

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = useState<AbstractConnector>();

  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect(chainId);

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(chainId, !triedEager || !!activatingConnector);

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

  const toast = useToast();

  const switchNetwork = async () => {
    const ethereum = (window as any).ethereum;
    let supportedNetwork = getNetwork(chainId);

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: supportedNetwork.chainId }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      //if (switchError.code === 4902) {

      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [supportedNetwork],
      });

      // } else {
      //   throw switchError;
      // }
    } finally {
      onCloseSwitchNetworkModal();
    }
  };

  const connect = (name: ConnectorNames, currentConnector: AbstractConnector) => {
    setActivatingConnector(currentConnector);
    activate(connectorsByName[name], (error) => {
      if (error instanceof UnsupportedChainIdError) {
        onOpenSwitchNetworkModal();
      } else if (error instanceof NoEthereumProviderError) {
        onOpenInstallMetamaskModal();
      } else {
        toast({
          title: getErrorMessage(error),
          status: 'error',
          isClosable: true,
        });
        throw error;
      }
    });
    onCloseWalletModal();
  };

  return (
    <>
      {(!active || chainId !== connectedChainId) && (
        <Button onClick={onOpenWalletModal} {...buttonProps}>
          Connect Wallet
        </Button>
      )}
      <SelectWalletModal
        isOpen={isOpenWalletModal}
        onClose={onCloseWalletModal}
        onConnect={connect}
        connectorsByName={connectorsByName}
      />
      <SwitchNetworkModal
        chainId={chainId}
        isOpen={isOpenSwitchNetworkModal}
        onClose={onCloseSwitchNetworkModal}
        onSwith={switchNetwork}
        activatingConnector={activatingConnector}
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
