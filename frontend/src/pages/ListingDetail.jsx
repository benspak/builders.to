import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Heading,
  Text,
  Badge,
  Button,
  VStack,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  Divider,
  HStack,
  Input,
  Select,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import CheckoutForm from '../components/CheckoutForm';
import RichTextEditor, { RichTextDisplay } from '../components/RichTextEditor';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentType, setPaymentType] = useState('listing');
  const [editing, setEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    category: '',
    title: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await axios.get(`/api/listings/${id}`);
      setListing(response.data);
      setEditFormData({
        category: response.data.category,
        title: response.data.title,
        location: response.data.location || '',
        description: response.data.description
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch listing:', error);
      setLoading(false);
    }
  };

  const handlePay = async (type = 'listing') => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setPaymentType(type);
      const endpoint = type === 'listing'
        ? '/api/payments/create-listing-payment'
        : '/api/payments/create-featured-payment';

      console.log('Creating payment with listing ID:', id);
      const response = await axios.post(endpoint, { listingId: id });
      console.log('Payment response:', response.data);

      if (response.data.clientSecret) {
        setClientSecret(response.data.clientSecret);
        setShowPayment(true);
      } else {
        console.error('No clientSecret in response:', response.data);
        alert('Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create payment:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create payment. Please try again.';
      alert(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/listings/${id}`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete listing:', error);
      alert(error.response?.data?.error || 'Failed to delete listing');
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditFormData({
      category: listing.category,
      title: listing.title,
      location: listing.location || '',
      description: listing.description
    });
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`/api/listings/${id}`, editFormData);
      await fetchListing();
      setEditing(false);
    } catch (error) {
      console.error('Failed to update listing:', error);
      alert(error.response?.data?.error || 'Failed to update listing');
    }
  };

  if (loading) {
    return <Container maxW="4xl" py={8}>Loading...</Container>;
  }

  if (!listing) {
    return <Container maxW="4xl" py={8}>Listing not found</Container>;
  }

  const isOwner = user && listing.user_id === user.id;

  // For now, we'll just show the listing data without payment

  return (
    <Container maxW="4xl" py={8}>
      {showPayment && clientSecret ? (
        <Box>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              clientSecret={clientSecret}
              onSuccess={() => {
                setShowPayment(false);
                fetchListing();
                navigate('/dashboard');
              }}
              onCancel={() => setShowPayment(false)}
            />
          </Elements>
        </Box>
      ) : (
        <VStack spacing={6} align="stretch">
          <Card>
            <CardBody>
              <HStack justify="space-between" mb={4}>
                <HStack spacing={3}>
                  {listing.is_featured && <Badge colorScheme="purple">Featured</Badge>}
                  <Badge colorScheme={listing.category === 'Jobs' ? 'blue' : listing.category === 'Services' ? 'green' : 'orange'}>
                    {listing.category}
                  </Badge>
                </HStack>
              </HStack>

              <Heading size="xl" mb={2}>{listing.title}</Heading>
              {listing.location && <Text color="gray.600" mb={4}>📍 {listing.location}</Text>}

              <Box mb={4}>
                <RichTextDisplay content={listing.description} />
              </Box>

              <Divider my={4} />

              <HStack justify="space-between" fontSize="sm" color="gray.500">
                <Text>Posted on {new Date(listing.created_at).toLocaleDateString()}</Text>
                <Button as={RouterLink} to={`/user/${listing.user_id}`} size="sm" variant="link" colorScheme="blue">
                  View Profile
                </Button>
              </HStack>

              {isOwner && listing.payment_status === 'pending' && (
                <VStack spacing={4} mt={4}>
                  <Alert status="warning" width="100%">
                    <AlertIcon />
                    <Box flex="1">
                      <Text>Payment required to publish this listing.</Text>
                    </Box>
                  </Alert>

                  {editing ? (
                    <Box width="100%" p={4} border="1px" borderColor="gray.200" borderRadius="md">
                      <VStack spacing={4} align="stretch">
                        <FormControl isRequired>
                          <FormLabel>Category</FormLabel>
                          <Select
                            value={editFormData.category}
                            onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                          >
                            <option value="Jobs">Jobs</option>
                            <option value="Services">Services</option>
                            <option value="For Sale">For Sale</option>
                          </Select>
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Title</FormLabel>
                          <Input
                            value={editFormData.title}
                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                            placeholder="Enter listing title"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Location</FormLabel>
                          <Input
                            value={editFormData.location}
                            onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                            placeholder="City, State"
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Description</FormLabel>
                          <Box bg="white" borderWidth="1px" borderRadius="md">
                            <RichTextEditor
                              value={editFormData.description}
                              onChange={(value) => setEditFormData({ ...editFormData, description: value })}
                              placeholder="Provide details about your listing"
                            />
                          </Box>
                        </FormControl>

                        <HStack spacing={3}>
                          <Button colorScheme="blue" onClick={handleSaveEdit}>
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </HStack>
                      </VStack>
                    </Box>
                  ) : (
                    <HStack spacing={3} width="100%">
                      <Button colorScheme="blue" onClick={() => handlePay('listing')} flex={1}>
                        Pay $5 to Publish
                      </Button>
                      <Button colorScheme="yellow" variant="outline" onClick={handleEdit}>
                        Edit
                      </Button>
                      <Button colorScheme="red" variant="outline" onClick={handleDelete}>
                        Delete
                      </Button>
                    </HStack>
                  )}
                </VStack>
              )}

              {isOwner && listing.payment_status === 'paid' && !listing.is_featured && (
                <HStack spacing={3} mt={4}>
                  <Button colorScheme="purple" onClick={() => handlePay('feature')}>
                    Feature This Listing ($50)
                  </Button>
                  <Button colorScheme="red" variant="outline" onClick={handleDelete}>
                    Delete Listing
                  </Button>
                </HStack>
              )}

              {isOwner && listing.payment_status === 'featured' && (
                <Box mt={4}>
                  <Button colorScheme="red" variant="outline" onClick={handleDelete}>
                    Delete Listing
                  </Button>
                </Box>
              )}
            </CardBody>
          </Card>
        </VStack>
      )}
    </Container>
  );
};

export default ListingDetail;
