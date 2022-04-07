import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import React from 'react';
import { MdOutlineBubbleChart } from 'react-icons/md';
import { Outlet } from 'react-router-dom';

export const Auth = () => {
  return (
    <Flex direction="column" alignSelf="center" justifySelf="center" overflow="hidden">
      <Box
        position="absolute"
        minH={{ base: '70vh', md: '50vh' }}
        w={{ md: 'calc(100vw - 50px)' }}
        borderRadius={{ md: '15px' }}
        left="0"
        right="0"
        bgRepeat="no-repeat"
        overflow="hidden"
        zIndex="-1"
        top="0"
        bgImage="url('/images/auth-bg.png')"
        bgSize="cover"
        mx={{ md: 'auto' }}
        mt={{ md: '14px' }}
      ></Box>
      <Flex
        direction="column"
        textAlign="center"
        justifyContent="center"
        align="center"
        mt="6.5rem"
        mb="30px"
      >
        <Flex justifyContent="start" alignItems="center">
          <Icon as={MdOutlineBubbleChart} w="32px" h="32px" me="10px" />
          <Text fontSize="4xl" color="white" fontWeight="bold">
            Pesabooks
          </Text>
        </Flex>
        <Text
          fontSize="md"
          color="white"
          fontWeight="normal"
          mt="10px"
          mb="26px"
          w={{ base: '90%', sm: '60%', lg: '40%', xl: '25%' }}
        >
          Your digital crypto-powered platform for saving groups
        </Text>
      </Flex>
      {<Outlet />}
    </Flex>
  );
};
