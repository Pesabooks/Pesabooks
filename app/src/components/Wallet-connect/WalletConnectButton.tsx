import { Button } from '@chakra-ui/react';

interface IProps {
  onOpen: () => void;
  isConnected: boolean;
}

export const WalletConnectButton = ({ onOpen, isConnected }: IProps) => {
  return (
    <Button
      pl={0}
      variant="outline"
      onClick={onOpen}
      w={160}
      _after={
        isConnected
          ? {
              content: '""',
              w: 4,
              h: 4,
              bg: 'green.300',
              border: '2px solid white',
              rounded: 'full',
              pos: 'absolute',
              bottom: 3,
              right: 2,
            }
          : {}
      }
    >
      Wallet connect
    </Button>
  );
};
