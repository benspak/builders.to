'use client';

import Navbar from '../src/components/Navbar';
import { Box } from '@chakra-ui/react';

export default function ClientLayout({ children }) {
  return (
    <Box minH="100vh">
      <Navbar />
      {children}
    </Box>
  );
}
