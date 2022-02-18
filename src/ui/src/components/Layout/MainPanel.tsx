import { Box, BoxProps, ThemingProps, useStyleConfig } from '@chakra-ui/react';
import React from 'react';

export interface Props extends BoxProps, ThemingProps {}

export const MainPanel = (props: Props) => {
  const { variant, children, ...rest } = props;

  const styles = useStyleConfig('MainPanel', { variant });

  return (
    <Box __css={styles} {...rest}>
      {children}
    </Box>
  );
};
