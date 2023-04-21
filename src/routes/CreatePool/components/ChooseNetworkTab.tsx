import { CheckIcon } from '@chakra-ui/icons';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Image,
  Spacer,
  Stack,
  Text
} from '@chakra-ui/react';
import { networks } from '../../../data/networks';

interface ChooseNetworkTabProps {
  onNext: () => void;
  chainId: number | null;
  onSelect: (chainId: number) => void;
}
export const ChooseNetworkTab = ({ onNext, chainId, onSelect }: ChooseNetworkTabProps) => {
  // const textColor = useColorModeValue('gray.700', 'white');
  const includeTestnets = process.env.REACT_APP_INCLUDE_TESTNETS === 'true';

  const ChainButton = ({
    chainId,
    selectedChainId,
  }: {
    chainId: number;
    selectedChainId: number | null;
  }) => {
    const network = networks[chainId];
    return (
      <Button
        variant={chainId === selectedChainId ? 'solid' : 'outline'}
        size="lg"
        display="flex"
        justifyContent="start"
        onClick={() => onSelect(chainId)}
        transition=".5s all ease"
        _hover={{ opacity: '0.8' }}
        w="300px"
      >
        <Image
          mr={4}
          w="40px"
          height="40px"
          src={`${process.env.PUBLIC_URL}/${network.logoUrl}`}
          alt={network.chainName}
        />
        {network.chainName}
        <Spacer />
        {selectedChainId === chainId && <CheckIcon />}
      </Button>
    );
  };
  return (
    <Card>
      <CardHeader>
        <Flex
          direction="column"
          align="center"
          justify="center"
          textAlign="center"
          w="80%"
          mx="auto"
        >
          {/* <Text color={textColor} fontSize="lg" fontWeight="bold" mb="4px">
            Select a network
          </Text> */}
          <Text color="gray.400" fontWeight="normal" fontSize="sm">
            Select network on which to create your group wallet.
          </Text>
        </Flex>
      </CardHeader>
      <CardBody>
        <Flex direction="column" w="100%">
          <Stack
            direction="column"
            spacing={{ sm: '20px', lg: '35px' }}
            alignSelf="center"
            justifySelf="center"
            mb="24px"
          >
            {[1, 42161, 10, 137, 56].map((key) => (
              <ChainButton chainId={key} selectedChainId={chainId} />
            ))}
            {includeTestnets && (
              <>
                <Divider />
                <Text>Testnets</Text>
                <Button
                  variant={chainId === 5 ? 'solid' : 'outline'}
                  size="lg"
                  display="flex"
                  justifyContent="start"
                  onClick={() => onSelect(5)}
                  transition=".5s all ease"
                  _hover={{ opacity: '0.8' }}
                >
                  <Image
                    mr={4}
                    w="40px"
                    height="40px"
                    src={`${process.env.PUBLIC_URL}/images/chains/ethereum.svg`}
                    alt="Goerli"
                  />
                  Goerli
                  <Spacer />
                  {chainId === 5 && <CheckIcon />}
                </Button>
              </>
            )}
          </Stack>

          <Button
            mt="24px"
            w={{ sm: '75px', lg: '100px' }}
            h="35px"
            onClick={onNext}
            isDisabled={!chainId}
            alignSelf="flex-end"
          >
            Next
          </Button>
        </Flex>
      </CardBody>
    </Card>
  );
};
