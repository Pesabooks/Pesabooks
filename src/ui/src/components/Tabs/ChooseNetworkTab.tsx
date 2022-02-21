import { CheckIcon } from '@chakra-ui/icons';
import {
  Button,
  Checkbox,
  Divider,
  Flex,
  Image,
  Spacer,
  Stack,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { Card, CardBody, CardHeader } from '../Card';

interface ChooseNetworkTabProps {
  onNext: () => void;
  chainId: number | null;
  onSelect: (chainId: number) => void;
}
export const ChooseNetworkTab = ({ onNext, chainId, onSelect }: ChooseNetworkTabProps) => {
  const textColor = useColorModeValue('gray.700', 'white');
  const [includeTestnets, setIncludeTestnets] = useState(false);

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
            <Divider />
            <Checkbox alignSelf="end" onChange={(e) => setIncludeTestnets(e.target.checked)}>
              Include testnets
            </Checkbox>
            {includeTestnets && (
              <Button
                variant={chainId === 80001 ? 'solid' : 'outline'}
                size="lg"
                display="flex"
                justifyContent="start"
                onClick={() => onSelect(80001)}
                transition=".5s all ease"
                _hover={{ opacity: '0.8' }}
              >
                <Image
                  mr={4}
                  w="40px"
                  height="40px"
                  src={`${process.env.PUBLIC_URL}/images/chains/polygon-matic-logo.svg`}
                  alt="polygon"
                />
                Polygon Mumbai
                <Spacer />
                {chainId === 80001 && <CheckIcon />}
              </Button>
            )}
          </Stack>

          <Button
            variant="no-hover"
            bg="linear-gradient(81.62deg, #313860 2.25%, #151928 79.87%)"
            alignSelf="flex-end"
            mt="24px"
            w={{ sm: '75px', lg: '100px' }}
            h="35px"
            onClick={onNext}
            disabled={!chainId}
          >
            <Text fontSize="xs" color="#fff" fontWeight="bold">
              NEXT
            </Text>
          </Button>
        </Flex>
      </CardBody>
    </Card>
  );
};
