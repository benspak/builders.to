'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  Text,
  Alert,
  AlertIcon,
  VStack,
  useColorModeValue
} from '@chakra-ui/react';
import Link from 'next/link';
import { useAuth } from '../../src/context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const bgColor = useColorModeValue('white', 'gray.800');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <Container maxW="md" py={20}>
      <Box bg={bgColor} p={8} borderRadius="lg" shadow="md">
        <VStack spacing={6}>
          <Heading size="lg">Welcome Back</Heading>

          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                width="full"
                isLoading={loading}
              >
                Login
              </Button>
            </VStack>
          </form>

          <Text>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: 'blue' }}>Sign up</Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
}
