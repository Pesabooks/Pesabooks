import { Image, Tag, TagLabel, TagProps } from '@chakra-ui/react';
import { networks } from '../data/networks';

export const ChainTag = ({
  variant,
  chainId,
  size,
}: TagProps & {
  chainId: number;
}) => {
  const network = networks[chainId];

  return (
    <Tag size={size} variant={variant}>
      <Image
        boxSize="1rem"
        borderRadius="full"
        src={`${process.env.PUBLIC_URL}/${network.logoUrl}`}
        alt="Fluffybuns the destroyer"
        mr="12px"
      />
      <TagLabel>{networks[chainId]?.chainName}</TagLabel>
    </Tag>
  );
};
