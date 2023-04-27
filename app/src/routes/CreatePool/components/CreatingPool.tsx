import { Box, Heading, Spinner } from '@chakra-ui/react';

export const CreatingPool = () => {
  return (
    <Box textAlign="center" py={10} px={6}>
      <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
      <Heading mt={6} mb={2} size="md">
        Setting up your group.
      </Heading>
    </Box>
  );
};
