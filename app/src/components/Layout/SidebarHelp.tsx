import { QuestionIcon } from '@chakra-ui/icons';
import { Button, Flex, FlexProps, Link, Text } from '@chakra-ui/react';
import { IconBox } from '../Icons';

interface SidebarHelpProps extends FlexProps {}
export function SidebarHelp(props: SidebarHelpProps) {
  // Pass the computed styles into the `__css` prop
  return (
    <Flex
      borderRadius="15px"
      flexDirection="column"
      backgroundImage="url('/images/SidebarHelpImage.png')"
      justifyContent="flex-start"
      alignItems="start"
      boxSize="border-box"
      p="16px"
      h="170px"
      w="100%"
    >
      <IconBox width="35px" h="35px" bg="white" mb="auto">
        <QuestionIcon color="teal.300" h="18px" w="18px" />
      </IconBox>
      <Text fontSize="sm" color="white" fontWeight="bold">
        Need help?
      </Text>
      <Text fontSize="xs" color="white" mb="10px">
        Please check our docs
      </Text>
      <Link w="100%" isExternal href="https://docs.pesabooks.com">
        <Button
          fontSize="10px"
          fontWeight="bold"
          w="100%"
          bg="white"
          _hover={{}}
          _active={{
            bg: 'white',
            transform: 'none',
            borderColor: 'transparent',
          }}
          _focus={{
            boxShadow: 'none',
          }}
          color="black"
        >
          DOCUMENTATION
        </Button>
      </Link>
    </Flex>
  );
}
