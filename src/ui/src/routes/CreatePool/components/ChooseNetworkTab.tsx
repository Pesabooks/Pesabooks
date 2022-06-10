import { CheckIcon } from '@chakra-ui/icons';
import {
  Button,
  Divider,
  Flex,
  Image,
  Spacer,
  Stack,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import React from 'react';
import { Card, CardBody, CardHeader } from '../../../components/Card';

interface ChooseNetworkTabProps {
  onNext: () => void;
  chainId: number | null;
  onSelect: (chainId: number) => void;
}
export const ChooseNetworkTab = ({ onNext, chainId, onSelect }: ChooseNetworkTabProps) => {
  const textColor = useColorModeValue('gray.700', 'white');
  const includeTestnets = process.env.REACT_APP_INCLUDE_TESTNETS;

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
          <Text color={textColor} fontSize="lg" fontWeight="bold" mb="4px">
            Select a network
          </Text>
          <Text color="gray.400" fontWeight="normal" fontSize="sm">
            Select network on which to create your group safe.
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
            <Button
              variant={chainId === 137 ? 'solid' : 'outline'}
              size="lg"
              display="flex"
              justifyContent="start"
              onClick={() => onSelect(137)}
              transition=".5s all ease"
              _hover={{ opacity: '0.8' }}
              w="300px"
            >
              <Image
                mr={4}
                w="40px"
                height="40px"
                src={`${process.env.PUBLIC_URL}/images/chains/polygon-matic-logo.svg`}
                alt="polygon"
              />
              Polygon
              <Spacer />
              {chainId === 137 && <CheckIcon />}
            </Button>
            <Text>More coming soon...</Text>
            {includeTestnets && (
              <>
                <Divider />
                <Text>Testnets</Text>
                <Button
                  variant={chainId === 4 ? 'solid' : 'outline'}
                  size="lg"
                  display="flex"
                  justifyContent="start"
                  onClick={() => onSelect(4)}
                  transition=".5s all ease"
                  _hover={{ opacity: '0.8' }}
                >
                  <Image
                    mr={4}
                    w="40px"
                    height="40px"
                    src={`${process.env.PUBLIC_URL}/images/chains/ethereum.svg`}
                    alt="Rinkeby"
                  />
                  Rinkeby
                  <Spacer />
                  {chainId === 4 && <CheckIcon />}
                </Button>
              </>
            )}
          </Stack>

          <Button
            mt="24px"
            w={{ sm: '75px', lg: '100px' }}
            h="35px"
            onClick={onNext}
            disabled={!chainId}
            alignSelf="flex-end"
          >
            Next
          </Button>
        </Flex>
      </CardBody>
    </Card>
  );
};
