'use client';

import { Box } from '@chakra-ui/react';
import Navbar from '../src/components/Navbar';

export default function ClientLayout({ children }) {
  return (
    <Box minH="100vh" suppressHydrationWarning>
      <Navbar />
      {children}
    </Box>
  );
}
