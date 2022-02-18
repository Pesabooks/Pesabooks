import { Box, BoxProps, ThemingProps, useStyleConfig } from '@chakra-ui/react';
export interface CardOptions {}

export interface CardProps extends BoxProps, CardOptions, ThemingProps {}

export const Card = (props: CardProps) => {
  const { variant, children, ...rest } = props;

  const styles = useStyleConfig('Card', { variant });
  // Pass the computed styles into the `__css` prop
  return (
    <Box __css={styles} {...rest}>
      {children}
    </Box>
  );
};
