import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    body: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  components: {
    FormControl: {
      parts: ['label'],
      baseStyle: {
        label: {
          fontSize: 'sm',
          fontWeight: 'medium',
          mb: 2,
        },
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'blue.500',
      },
    },
    Button: {
      defaultProps: {
        colorScheme: 'blue',
      },
    },
  },
});

export default theme;
