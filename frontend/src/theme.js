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
        color: 'white',
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
      500: '#3f9142', // Primary green - Spotify inspired
      600: '#2f7c34',
      700: '#1e6423',
      800: '#154c18',
      900: '#0c3910',
    },
    dark: {
      bg: '#121212',
      bgSecondary: '#181818',
      bgTertiary: '#282828',
      text: '#ffffff',
      textSecondary: '#b3b3b3',
      border: '#404040',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'full',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          _active: {
            bg: 'brand.700',
          },
        },
        outline: {
          borderColor: 'brand.500',
          color: 'brand.500',
          _hover: {
            bg: 'rgba(63, 145, 66, 0.1)',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'dark.bgSecondary',
          borderRadius: 'lg',
          border: '1px solid',
          borderColor: 'dark.border',
        },
      },
    },
  },
  fonts: {
    heading: `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    body: `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  },
});

export default theme;
