import { Box, Button, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { ConnectWalletButton } from '../Buttons/ConnectWalletButton';
import { Card, CardBody, CardHeader } from '../Card';
import { ConnectedChain } from '../ConnectedChain';

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
  const bgPrevButton = useColorModeValue('gray.100', 'gray.100');
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
          <Flex justify="space-between">
            <Button
              variant="no-hover"
              bg={bgPrevButton}
              alignSelf="flex-end"
              mt="24px"
              w={{ sm: '75px', lg: '100px' }}
              h="35px"
              onClick={onPrev}
            >
              <Text fontSize="xs" color="gray.700" fontWeight="bold">
                PREV
              </Text>
            </Button>
            <Button
              variant="no-hover"
              bg="linear-gradient(81.62deg, #313860 2.25%, #151928 79.87%)"
              alignSelf="flex-end"
              mt="24px"
              w={{ sm: '75px', lg: '100px' }}
              h="35px"
              onClick={onNext}
              disabled={!connected}
            >
              <Text fontSize="xs" color="#fff" fontWeight="bold">
                NEXT
              </Text>
            </Button>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};
