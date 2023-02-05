import { Box, Flex, Text } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Logo } from '../../components/Layout/Logo';

export const Auth = () => {
  return (
    <Flex
      h="100vh"
      w="100%"
      maxW="1044px"
      mx="auto"
      justifyContent="space-between"
      pt={{ sm: '100px', md: '0px' }}
    >
      <Flex
        alignItems="center"
        justifyContent="start"
        style={{ userSelect: 'none' }}
        w={{ base: '100%', md: '50%', lg: '42%' }}
      >
        {<Outlet />}
      </Flex>
      <Box
        display={{ base: 'none', md: 'block' }}
        overflowX="hidden"
        h="100%"
        w="40vw"
        position="absolute"
        right="0px"
      >
        <Box
          bgImage="url('/images/auth-bg.png')"
          w="100%"
          h="100%"
          bgSize="cover"
          bgPosition="50%"
          position="absolute"
          borderBottomLeftRadius="20px"
        >
          <Flex
            h="100%"
            direction="column"
            textAlign="center"
            justifyContent="center"
            align="center"
          >
            <Logo theme="light" />
            <Text fontSize="lg" color="white" fontWeight="bold" mt="10px" mb="26px">
              Save and invest together with crypto
            </Text>
          </Flex>
        </Box>
      </Box>
    </Flex>
  );
};
