'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  VStack,
  Select,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { useAuth } from '../../src/context/AuthContext';
import axios from '../../src/lib/axios';
import RichTextEditor from '../../src/components/RichTextEditor';

export default function CreateListing() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/listings', formData);
      const slug = response.data.slug;

      // Redirect to listing detail page
      router.push(`/listing/${slug}`);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create listing');
      setLoading(false);
    }
  };

  return (
    <Container maxW="2xl" py={8}>
      <Box bg="white" _dark={{ bg: 'gray.800' }} p={8} borderRadius="lg" shadow="md">
        <VStack spacing={6} align="stretch">
          <Heading size="lg">Create New Listing</Heading>
          <Box as="p" color="gray.600" _dark={{ color: 'gray.300' }}>
            Cost: $5 per listing. Featured listings (pinned to top) cost $50 extra.
          </Box>

          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <Select
                  placeholder="Select category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Jobs">Jobs</option>
                  <option value="Services">Services</option>
                  <option value="For Sale">For Sale</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter listing title"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Location</FormLabel>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, State"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Box bg="white" _dark={{ bg: 'gray.900', borderColor: 'gray.600' }} borderWidth="1px" borderColor="gray.300" borderRadius="md">
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    placeholder="Provide details about your listing"
                  />
                </Box>
              </FormControl>

              <Button type="submit" colorScheme="blue" size="lg" width="full" isLoading={loading}>
                Create Listing ($5)
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Container>
  );
}
