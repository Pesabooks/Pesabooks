import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { ConnectWalletButton } from '../../../components/Buttons/ConnectWalletButton';
import { Card, CardBody, CardHeader } from '../../../components/Card';
import { ConnectedChain } from '../../../components/ConnectedChain';

interface ConnectToYourWalletTabProps {
  onNext: () => void;
  onPrev: () => void;
  chainId: number;
}

export const ConnectToYourWalletTab = ({
  onNext,
  onPrev,
  chainId,
}: ConnectToYourWalletTabProps) => {
  const { chainId: connectedChainId } = useWeb3React();
  const connected = chainId === connectedChainId;
  return (
    <Card>
      <CardHeader mb="40px">
        <Flex
          direction="column"
          align="center"
          justify="center"
          textAlign="center"
          w="80%"
          mx="auto"
        >
          <Text fontSize="lg" fontWeight="bold" mb="4px">
            Connect to your wallet
          </Text>
          <Text color="gray.400" fontWeight="normal" fontSize="sm">
            To create a new group, a smart contract need to be deployed on chain. To interact with
            Pesabooks, please connect to your wallet
          </Text>
        </Flex>
      </CardHeader>

      <CardBody>
        <Flex direction="column" w="100%">
          {connected ? (
            <Box alignSelf="center">
              <Text mb={2}>You are connected:</Text>
              <ConnectedChain />
            </Box>
          ) : (
            <ConnectWalletButton chainId={chainId} w="200px" alignSelf="center" />
          )}
          <Flex justify="space-between" mt="24px">
            <Button
              variant="outline"
              alignSelf="flex-end"
              w={{ sm: '75px', lg: '100px' }}
              h="35px"
              onClick={onPrev}
            >
              Prev
            </Button>
            <Button w={{ sm: '75px', lg: '100px' }} h="35px" onClick={onNext} disabled={!connected}>
              Next
            </Button>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};
