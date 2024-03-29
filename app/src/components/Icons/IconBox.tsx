import { Flex, FlexProps } from '@chakra-ui/react';

type IconBoxProps = FlexProps;
export const IconBox = (props: IconBoxProps) => {
  const { children, ...rest } = props;

  return (
    <Flex
      alignItems={'center'}
      justifyContent={'center'}
      borderRadius={'12px'}
      bg="teal.300"
      color="white"
      {...rest}
    >
      {children}
    </Flex>
  );
};
