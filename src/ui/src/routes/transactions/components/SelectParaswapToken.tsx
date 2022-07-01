import { Box, Flex, Image, Text } from '@chakra-ui/react';
import { chakraComponents, GroupBase, OptionProps, Select } from 'chakra-react-select';
import { Token } from 'paraswap';

interface SelectParaswapTokenProps {
  onChange?: (token: Token) => void;
  value?: Token;
  tokens: Token[];
}

const IconOption = (props: OptionProps<Token, boolean, GroupBase<Token>>) => {
  return (
    <chakraComponents.Option {...props}>
      <Flex align="center">
        <Image w="20px" h="20px" src={props.data.img} alt={props.data.symbol} />
        <Text ml="10px">{props.data.symbol}</Text>
      </Flex>
    </chakraComponents.Option>
  );
};

export const SelectParaswapToken = ({ value, tokens, onChange }: SelectParaswapTokenProps) => {
  return (
    <Box w={300}>
      <Select
        onChange={(e: any) => onChange?.(e)}
        value={value}
        options={tokens}
        getOptionLabel={(t) => `${t.symbol}`}
        getOptionValue={(t) => t.address}
        components={{ Option: IconOption }}
      />
    </Box>
  );
};
