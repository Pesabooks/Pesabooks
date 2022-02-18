import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Flex,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from '@chakra-ui/react';
import { AbstractConnector } from '@web3-react/abstract-connector';
import React from 'react';
import { ConnectorNames } from '../../types/ConnectorNames';

const connectors = [
  {
    name: ConnectorNames.Injected,
    description:
      'Connect using a browser plugin or mobile app. Best supported on Chrome or Firefox.',
  },
  {
    name: ConnectorNames.WalletConnect,
    description:
      'Connect by scanning a QR code with any mobile wallet that supports wallet connect (i.e Trust, Argent, Rainbow + more)',
  },
];

interface SelectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (name: ConnectorNames, currentConnector: AbstractConnector) => void;
  connectorsByName: {
    [connectorName in ConnectorNames]: AbstractConnector;
  };
}

export const SelectWalletModal = ({
  isOpen,
  onConnect,
  onClose,
  connectorsByName,
}: SelectWalletModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select a Wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex p="8" direction="column" gap="4">
            {connectors.map(({ name, description }) => {
              return (
                <Button
                  height="150px"
                  p="4"
                  size="lg"
                  display="flex"
                  justifyContent="start"
                  key={name}
                  onClick={() => onConnect(name, connectorsByName[name])}
                  variant="outline"
                  style={{
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                  }}
                >
                  <Stack direction={'row'} spacing={4} align={'center'}>
                    <Avatar
                      size="lg"
                      p="2"
                      src={`${process.env.PUBLIC_URL}/images/wallet/${name}.png`}
                    />
                    <Stack direction={'column'} align="start" spacing={2}>
                      <Text fontSize={'md'} fontWeight={600}>
                        {name}
                      </Text>
                      <Text align="left" fontSize={'sm'} color={'gray.500'}>
                        {description}
                      </Text>
                    </Stack>
                  </Stack>
                </Button>
              );
            })}
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
