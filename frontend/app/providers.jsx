'use client';

import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import theme from '../src/theme';

export default function Providers({ children }) {
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
}
