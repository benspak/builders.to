'use client';

import { useEffect, useState } from 'react';
import { Box, Flex, Button, Link } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Return a simple skeleton while not mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Box borderBottom="1px" borderColor="gray.200" mb={8}>
        <Flex maxW="1200px" mx="auto" px={6} py={4} justify="space-between" align="center">
          <Box fontSize="2xl" fontWeight="bold">
            builders.to
          </Box>
          <Flex gap={4} align="center">
            <Box width="100px" height="20px" bg="gray.200" borderRadius="md" />
            <Box width="80px" height="20px" bg="gray.200" borderRadius="md" />
          </Flex>
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      bg="chakra-body-bg"
      borderBottom="1px"
      borderColor="chakra-border-color"
      mb={8}
    >
      <Flex maxW="1200px" mx="auto" px={6} py={4} justify="space-between" align="center">
        <Link
          href="/"
          fontSize="2xl"
          fontWeight="bold"
          color="blue.500"
          _dark={{ color: "blue.400" }}
        >
          builders.to
        </Link>

        <Flex gap={4} align="center">
          <Link href="/" color="chakra-body-text" fontWeight="medium">
            Browse
          </Link>
          {user ? (
            <>
              <Link href="/create-listing" color="chakra-body-text" fontWeight="medium">
                Create Listing
              </Link>
              <Link href="/dashboard" color="chakra-body-text" fontWeight="medium">
                Dashboard
              </Link>
              <Link href="/profile" color="chakra-body-text" fontWeight="medium">
                Profile
              </Link>
              <Button size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button size="sm" variant="outline">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" colorScheme="blue">Sign Up</Button>
              </Link>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
