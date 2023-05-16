import { GlobalStyleProps, mode } from '@chakra-ui/theme-tools';

export const globalStyles = {
  colors: {
    gray: {
      700: '#1f2733',
    },
  },
  styles: {
    global: (props: GlobalStyleProps) => ({
      body: {
        bg: mode('gray.50', 'gray.800')(props),
        fontFamily: 'Helvetica, sans-serif',
      },
      html: {
        fontFamily: 'Helvetica, sans-serif',
      },
    }),
  },
};
