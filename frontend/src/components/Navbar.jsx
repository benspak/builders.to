import { Box, Flex, Button, Link, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const linkColor = useColorModeValue('gray.800', 'gray.100');
  const logoColor = useColorModeValue('blue.600', 'blue.400');

  return (
    <Box bg={bg} borderBottom="1px" borderColor={borderColor} mb={8}>
      <Flex maxW="1200px" mx="auto" px={6} py={4} justify="space-between" align="center">
        <Link as={RouterLink} to="/" fontSize="2xl" fontWeight="bold" color={logoColor}>
          builders.to
        </Link>

        <Flex gap={4} align="center">
          <Link as={RouterLink} to="/" color={linkColor} fontWeight="medium">Browse</Link>
          {user ? (
            <>
              <Link as={RouterLink} to="/create-listing" color={linkColor} fontWeight="medium">Create Listing</Link>
              <Link as={RouterLink} to="/dashboard" color={linkColor} fontWeight="medium">Dashboard</Link>
              <Link as={RouterLink} to="/profile" color={linkColor} fontWeight="medium">Profile</Link>
              <Button size="sm" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Link as={RouterLink} to="/login">
                <Button size="sm" variant="outline">Login</Button>
              </Link>
              <Link as={RouterLink} to="/register">
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
