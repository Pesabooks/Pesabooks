import React from 'react';
import { Flex, Text } from '@chakra-ui/react';

export const Footer = () => {
  return (
    <Flex justifyContent="center" px="30px" pb="20px">
      <Text
        color="gray.400"
        textAlign={{
          base: 'center',
          xl: 'start',
        }}
        mb={{ base: '20px', xl: '0px' }}
      >
        &copy; Pesabooks.com
      </Text>
    </Flex>
  );
};
