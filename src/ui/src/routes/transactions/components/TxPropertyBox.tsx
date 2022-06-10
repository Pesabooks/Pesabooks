import { Flex, FlexboxProps, Text, useColorModeValue } from '@chakra-ui/react';
import React, { ReactNode } from 'react';

interface TxPropertyBoxProps extends FlexboxProps {
  label: string;
  value?: string;
  children?: ReactNode;
}
export const TxPropertyBox = (props: TxPropertyBoxProps) => {
  const textColor = useColorModeValue('gray.700', 'white');
  const borderBg = useColorModeValue('gray.700', 'whiteAlpha.300');

  const { label, value, children, ...flexBoxProps } = props;

  return (
    <Flex
      justifyContent="center"
      direction="column"
      gap={1}
      {...flexBoxProps}
      rounded={'md'}
      border="1px"
      borderColor={borderBg}
      py={1} px={2}
    >
      <Text color="gray.400" fontSize="sm" fontWeight="bold">
        {label}:
      </Text>
      {children ? children : <Text color={textColor}>{value}</Text>}
    </Flex>
  );
};
