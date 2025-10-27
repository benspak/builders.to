import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button, Box, VStack, Heading, Alert, AlertIcon } from '@chakra-ui/react';

const CheckoutForm = ({ clientSecret, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message);
      setLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <Box maxW="600px" mx="auto" p={8} bg="white" borderRadius="lg" shadow="md">
      <VStack spacing={6}>
        <Heading size="lg">Complete Payment</Heading>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <Box width="100%">
              <PaymentElement />
            </Box>

            <Button type="submit" colorScheme="blue" width="full" isLoading={loading}>
              Pay Now
            </Button>

            <Button variant="outline" width="full" onClick={onCancel}>
              Cancel
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default CheckoutForm;
