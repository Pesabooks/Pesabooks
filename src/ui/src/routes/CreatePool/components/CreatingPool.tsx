import { Box, Heading, Spinner, Text } from '@chakra-ui/react';
import React from 'react';

export const CreatingPool = () => {
  return (
    <Box textAlign="center" py={10} px={6}>
     <Spinner
  thickness='4px'
  speed='0.65s'
  emptyColor='gray.200'
  color='blue.500'
  size='xl'
/>
      <Heading  mt={6} mb={2} size='md'>
        Waiting for transaction confirmation
      </Heading>
      <Text color={'gray.500'}>
       Please confirm the group creation in your wallet
      </Text>
    </Box>
  );
};
