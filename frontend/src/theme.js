import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: '#121212',
        color: 'whiteAlpha.900',
      },
    },
  },
  colors: {
    brand: {
      50: '#e3f9e5',
      100: '#c1eac5',
      200: '#a3d9a5',
      300: '#7bc47f',
      400: '#57ae5b',
      500: '#3e9142',
      600: '#2e7031',
      700: '#1e4f21',
      800: '#0e3010',
      900: '#001800',
    },
    spotify: {
      green: '#1DB954',
      darkGreen: '#1aa34a',
      black: '#121212',
      darkGray: '#181818',
      gray: '#282828',
      lightGray: '#b3b3b3',
    },
  },
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'full',
      },
      variants: {
        solid: {
          bg: 'spotify.green',
          color: 'black',
          _hover: {
            bg: 'spotify.darkGreen',
            transform: 'scale(1.02)',
          },
          _active: {
            bg: 'spotify.darkGreen',
          },
        },
        outline: {
          borderColor: 'whiteAlpha.300',
          color: 'white',
          _hover: {
            bg: 'whiteAlpha.100',
            borderColor: 'whiteAlpha.500',
          },
        },
      },
      defaultProps: {
        variant: 'solid',
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: 'spotify.gray',
            borderRadius: 'md',
            border: '1px solid',
            borderColor: 'transparent',
            _hover: {
              bg: 'spotify.gray',
              borderColor: 'whiteAlpha.300',
            },
            _focus: {
              bg: 'spotify.darkGray',
              borderColor: 'spotify.green',
            },
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
    Textarea: {
      variants: {
        filled: {
          bg: 'spotify.gray',
          borderRadius: 'md',
          border: '1px solid',
          borderColor: 'transparent',
          _hover: {
            bg: 'spotify.gray',
            borderColor: 'whiteAlpha.300',
          },
          _focus: {
            bg: 'spotify.darkGray',
            borderColor: 'spotify.green',
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
  },
});

export default theme;
