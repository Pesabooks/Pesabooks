import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <Flex minH="100vh" justify="center" alignItems="center">
      <Box textAlign="center" py={10} px={6}>
        <Heading
          display="inline-block"
          as="h2"
          size="2xl"
          bgGradient="linear(to-r, teal.400, teal.600)"
          backgroundClip="text"
        >
          403
        </Heading>
        <Text fontSize="18px" mt={3} mb={2}>
          Unauthorized
        </Text>
        <Text color={'gray.500'} mb={6}>
          You are not authorized to view this page
        </Text>

        <Button
          onClick={() => navigate('/')}
          colorScheme="teal"
          bgGradient="linear(to-r, teal.400, teal.500, teal.600)"
          color="white"
          variant="solid"
        >
          Go to Home
        </Button>
      </Box>
    </Flex>
  );
};
