'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { CacheProvider } from '@chakra-ui/next-js';
import { emotionCache } from '../src/lib/emotionCache';
import theme from '../src/theme';

export default function Providers({ children }) {
  return (
    <CacheProvider value={emotionCache}>
      <ChakraProvider theme={theme}>
        {children}
      </ChakraProvider>
    </CacheProvider>
  );
}
