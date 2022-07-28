import { Tag, TagLabel, TagLeftIcon, TagProps } from '@chakra-ui/react';
import { BsSquareFill } from 'react-icons/bs';
import { networks } from '../data/networks';

export const ChainTag = ({
  variant,
  chainId,
  size
}: TagProps & {
  chainId: number;
}) => {
  let color;
  switch (chainId) {
    case 137:
      color = '#8248E5';
      break;
    case 56:
      color = '#f0b90b';
      break;

    default:
      break;
  }

  return (
    <Tag size={size} variant={variant} >
      <TagLeftIcon boxSize="12px" as={BsSquareFill} color={color} />
      <TagLabel >{networks[chainId]?.chainName}</TagLabel>
    </Tag>
  );
};
