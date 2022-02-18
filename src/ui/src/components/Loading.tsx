import { Flex, Spinner } from '@chakra-ui/react';

function Loading() {
  return (
    <Flex h="100vh" w="100%" justify="center" alignItems="center">
      <Spinner thickness="4px" speed="0.65s" size="xl" />
    </Flex>
  );
}

export default Loading;
