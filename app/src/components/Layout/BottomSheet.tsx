import { Flex } from '@chakra-ui/react';
import { NewTransactionMenu } from '../NewTransactionMenu';

export const BottomSheet = () => {
  return (
    <Flex
      align="center"
      justify="center"
      width="100%"
      position="fixed"
      p="2"
      bg="gray.700"
      bottom="0px"
      gap={2}
      display={{ sm: 'flex', xl: 'none' }}
    >
      <NewTransactionMenu />
    </Flex>
  );
};
