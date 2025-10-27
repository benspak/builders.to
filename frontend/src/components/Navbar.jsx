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

  return (
    <Box bg="white" borderBottom="1px" borderColor="gray.200" mb={8}>
      <Flex maxW="1200px" mx="auto" px={6} py={4} justify="space-between" align="center">
        <Link as={RouterLink} to="/" fontSize="2xl" fontWeight="bold" color="blue.600">
          builders.to
        </Link>

        <Flex gap={4} align="center">
          <Link as={RouterLink} to="/">Browse</Link>
          {user ? (
            <>
              <Link as={RouterLink} to="/create-listing">Create Listing</Link>
              <Link as={RouterLink} to="/dashboard">Dashboard</Link>
              <Link as={RouterLink} to="/profile">Profile</Link>
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
