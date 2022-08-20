export const linkStyles = {
  components: {
    Link: {
      variants: {
        'no-decoration': {
          _hover: {
            textDecoration: 'none',
          },
        },
        decoration: {
          textDecoration: 'underline',
        },
      },
      // 3. We can add a new visual variant
      decoration: 'none',
      baseStyle: {
        _focus: {
          boxShadow: 'none',
        },
      },
    },
  },
};
