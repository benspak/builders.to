import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: `Inter, "Helvetica Neue", Arial, sans-serif`,
    body: `Inter, "Helvetica Neue", Arial, sans-serif`,
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  semanticTokens: {
    colors: {
      'chakra-body-text': {
        _light: 'gray.800',
        _dark: 'gray.100',
      },
      'chakra-body-bg': {
        _light: 'white',
        _dark: 'gray.900',
      },
      'chakra-border-color': {
        _light: 'gray.200',
        _dark: 'gray.700',
      },
      'chakra-placeholder-color': {
        _light: 'gray.500',
        _dark: 'gray.400',
      },
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'white',
        color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
      },
    }),
  },
  components: {
    FormControl: {
      parts: ['label'],
      baseStyle: {
        label: {
          fontSize: 'sm',
          fontWeight: 'medium',
          mb: 2,
          color: 'inherit',
        },
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'blue.500',
      },
      baseStyle: {
        field: {
          _dark: {
            bg: 'gray.800',
            borderColor: 'gray.700',
            color: 'white',
            _hover: {
              borderColor: 'gray.600',
            },
            _focus: {
              borderColor: 'blue.500',
              boxShadow: '0 0 0 1px #3182ce',
            },
          },
        },
      },
    },
    Button: {
      defaultProps: {
        colorScheme: 'blue',
      },
      baseStyle: {
        _dark: {
          bg: 'blue.500',
          color: 'white',
          _hover: {
            bg: 'blue.600',
          },
          _active: {
            bg: 'blue.700',
          },
        },
      },
    },
    Text: {
      baseStyle: {
        color: 'inherit',
      },
    },
    Heading: {
      baseStyle: {
        color: 'inherit',
      },
    },
  },
});

export default theme;
