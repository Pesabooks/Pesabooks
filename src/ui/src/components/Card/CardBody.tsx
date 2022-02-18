import { Box, BoxProps, ThemingProps, useStyleConfig } from '@chakra-ui/react';

export interface CardBodyProps extends BoxProps, ThemingProps {}

export const CardBody = (props: CardBodyProps) => {
  const { variant, children, ...rest } = props;

  const styles = useStyleConfig('CardBody', { variant });
  // Pass the computed styles into the `__css` prop
  return (
    <Box __css={styles} {...rest}>
      {children}
    </Box>
  );
};
