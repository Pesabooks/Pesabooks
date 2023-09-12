import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';

import { SessionTypes } from '@walletconnect/types';
import { useState } from 'react';
import { SessionCard } from './SessionCard';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SessionTypes.Struct[];
  disconnect: (topic: string) => void;
  connect: (uri: string) => void;
  connecting: boolean;
}

export const WalletConnectDrawer = ({
  isOpen,
  connect,
  connecting,
  disconnect,
  onClose,
  sessions,
}: IProps) => {
  const [uri, setUri] = useState('');

  const onConnect = async () => {
    await connect(uri);
    setUri('');
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Wallet Connect </DrawerHeader>

        <DrawerBody>
          {sessions.length
            ? sessions.map((session) => {
                const { name, icons, url } = session.peer.metadata;

                return (
                  <SessionCard
                    key={session.topic}
                    topic={session.topic}
                    name={name}
                    logo={icons[0]}
                    url={url}
                    disconnect={() => disconnect(session.topic)}
                  />
                );
              })
            : null}

          <FormControl marginTop={5}>
            <FormLabel>Walletconnect uri</FormLabel>
            <InputGroup size="md">
              <Input
                pr="4.5rem"
                placeholder="e.g. wc:a281567bb3e4..."
                value={uri}
                onChange={(e) => setUri(e.target.value)}
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="1.75rem"
                  size="sm"
                  isDisabled={!uri}
                  type="submit"
                  isLoading={connecting}
                  onClick={onConnect}
                >
                  Connect
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
