'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Button,
  Link,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  useDisclosure,
  useBreakpointValue
} from '@chakra-ui/react';
import { HiMenuAlt3 } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import NextLink from 'next/link';

const Navbar = () => {
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
    onClose();
  };

  // Return a simple skeleton while not mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Box borderBottom="1px" borderColor="chakra-border-color">
        <Flex maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={4} justify="space-between" align="center">
          <Box fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
            builders.to
          </Box>
          <Box width="40px" height="40px" bg="gray.200" borderRadius="md" />
        </Flex>
      </Box>
    );
  }

  const navLinks = (
    <>
      <Link href="/" color="chakra-body-text" fontWeight="medium" _hover={{ opacity: 0.7 }}>
        Browse
      </Link>
      {user ? (
        <>
          <Link href="/create-listing" color="chakra-body-text" fontWeight="medium" _hover={{ opacity: 0.7 }}>
            Create Listing
          </Link>
          <Link href="/dashboard" color="chakra-body-text" fontWeight="medium" _hover={{ opacity: 0.7 }}>
            Dashboard
          </Link>
          <Link href="/profile" color="chakra-body-text" fontWeight="medium" _hover={{ opacity: 0.7 }}>
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
    </>
  );

  return (
    <Box
      bg="chakra-body-bg"
      borderBottom="1px"
      borderColor="chakra-border-color"
      mb={8}
      position="sticky"
      top={0}
      zIndex={1000}
      boxShadow="sm"
    >
      <Flex maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 3, md: 4 }} justify="space-between" align="center">
        <Link
          href="/"
          as={NextLink}
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="bold"
          color="blue.500"
          _dark={{ color: "blue.400" }}
          _hover={{ opacity: 0.8 }}
        >
          builders.to
        </Link>

        {/* Desktop Navigation */}
        <Flex gap={{ base: 2, md: 4 }} align="center" display={{ base: 'none', md: 'flex' }}>
          {navLinks}
        </Flex>

        {/* Mobile Hamburger Menu */}
        <IconButton
          aria-label="Open menu"
          icon={<HiMenuAlt3 />}
          onClick={onOpen}
          variant="ghost"
          display={{ base: 'flex', md: 'none' }}
          size="lg"
        />
      </Flex>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton size="lg" />
          <DrawerHeader fontSize="xl">Menu</DrawerHeader>

          <DrawerBody py={6}>
            <VStack spacing={2} align="stretch">
              <Link
                href="/"
                as={NextLink}
                onClick={onClose}
                color="chakra-body-text"
                fontWeight="medium"
                py={3}
                px={4}
                borderRadius="md"
                _hover={{ bg: "chakra-subtle-bg" }}
              >
                Browse
              </Link>
              {user ? (
                <>
                  <Link
                    href="/create-listing"
                    as={NextLink}
                    onClick={onClose}
                    color="chakra-body-text"
                    fontWeight="medium"
                    py={3}
                    px={4}
                    borderRadius="md"
                    _hover={{ bg: "chakra-subtle-bg" }}
                  >
                    Create Listing
                  </Link>
                  <Link
                    href="/dashboard"
                    as={NextLink}
                    onClick={onClose}
                    color="chakra-body-text"
                    fontWeight="medium"
                    py={3}
                    px={4}
                    borderRadius="md"
                    _hover={{ bg: "chakra-subtle-bg" }}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    as={NextLink}
                    onClick={onClose}
                    color="chakra-body-text"
                    fontWeight="medium"
                    py={3}
                    px={4}
                    borderRadius="md"
                    _hover={{ bg: "chakra-subtle-bg" }}
                  >
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" as={NextLink} onClick={onClose}>
                    <Button size="md" variant="outline" width="100%" py={6}>Login</Button>
                  </Link>
                  <Link href="/register" as={NextLink} onClick={onClose}>
                    <Button size="md" colorScheme="blue" width="100%" py={6}>Sign Up</Button>
                  </Link>
                </>
              )}
            </VStack>
          </DrawerBody>

          {user && (
            <DrawerFooter borderTopWidth="1px" pt={4}>
              <Button variant="ghost" colorScheme="red" onClick={handleLogout} width="100%" size="md" py={6}>
                Logout
              </Button>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Navbar;
