import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  Text,
  FormErrorMessage,
  InputGroup,
  InputLeftAddon,
  Select,
} from '@chakra-ui/react';
import { useState } from 'react';

const ApplicationForm = ({ isSubmitted, setIsSubmitted }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    moveInDate: '',
    leaseDuration: '',
    project: '',
    builderHours: '',
    work: '',
    budget: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.moveInDate) {
      newErrors.moveInDate = 'Expected move-in date is required';
    }

    if (!formData.leaseDuration) {
      newErrors.leaseDuration = 'Lease duration is required';
    }

    if (!formData.project.trim()) {
      newErrors.project = 'Please tell us about your project';
    }

    if (!formData.builderHours.trim()) {
      newErrors.builderHours = 'Please tell us your builder hours';
    }

    if (!formData.work.trim()) {
      newErrors.work = 'Please tell us what you do for work';
    }

    if (!formData.budget) {
      newErrors.budget = 'Please select your monthly budget';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Please fill in all fields',
        description: 'All fields are required to submit your application.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        toast({
          title: 'Application Submitted! 🎉',
          description: "We'll review your application and get back to you soon.",
          status: 'success',
          duration: 6000,
          isClosable: true,
        });
        // Reset form
        setFormData({
          name: '',
          phone: '',
          email: '',
          moveInDate: '',
          leaseDuration: '',
          project: '',
          builderHours: '',
          work: '',
          budget: '',
        });
      } else {
        throw new Error(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Box
        w="full"
        bg="spotify.gray"
        p={8}
        borderRadius="xl"
        border="1px solid"
        borderColor="spotify.green"
        textAlign="center"
      >
        <Text fontSize="4xl" mb={4}>
          ✅
        </Text>
        <Text fontSize="2xl" fontWeight="bold" color="white" mb={2}>
          Application Submitted!
        </Text>
        <Text color="whiteAlpha.700">
          We'll review your application and get back to you within 48 hours.
        </Text>
        <Button
          mt={6}
          variant="outline"
          onClick={() => setIsSubmitted(false)}
        >
          Submit Another Application
        </Button>
      </Box>
    );
  }

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      w="full"
      bg="spotify.gray"
      p={{ base: 6, md: 8 }}
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
    >
      <VStack spacing={6}>
        <Box
          w="full"
          bg="spotify.darkGray"
          p={4}
          borderRadius="md"
          border="1px solid"
          borderColor="spotify.green"
          mb={2}
        >
          <Text color="spotify.green" fontWeight="600" fontSize="sm" mb={1}>
            📍 Important Note
          </Text>
          <Text color="whiteAlpha.800" fontSize="sm">
            We don't yet own or rent a house in the Orlando area. We're gauging interest first,
            then finding the perfect place when enough builders are ready to join.
          </Text>
        </Box>
        <FormControl isInvalid={errors.name}>
          <FormLabel color="white" fontWeight="600">
            Full Name
          </FormLabel>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            size="lg"
          />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.phone}>
          <FormLabel color="white" fontWeight="600">
            Phone Number
          </FormLabel>
          <InputGroup size="lg">
            <InputLeftAddon bg="spotify.darkGray" borderColor="whiteAlpha.200">
              📱
            </InputLeftAddon>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
              type="tel"
            />
          </InputGroup>
          <FormErrorMessage>{errors.phone}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.email}>
          <FormLabel color="white" fontWeight="600">
            Email Address
          </FormLabel>
          <InputGroup size="lg">
            <InputLeftAddon bg="spotify.darkGray" borderColor="whiteAlpha.200">
              📧
            </InputLeftAddon>
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              type="email"
            />
          </InputGroup>
          <FormErrorMessage>{errors.email}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.moveInDate}>
          <FormLabel color="white" fontWeight="600">
            Expected Move-in Date
          </FormLabel>
          <Input
            name="moveInDate"
            value={formData.moveInDate}
            onChange={handleChange}
            placeholder="Select date"
            size="lg"
            type="date"
          />
          <FormErrorMessage>{errors.moveInDate}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.leaseDuration}>
          <FormLabel color="white" fontWeight="600">
            Duration of Lease
          </FormLabel>
          <Select
            name="leaseDuration"
            value={formData.leaseDuration}
            onChange={handleChange}
            placeholder="Select lease duration"
            size="lg"
          >
            <option value="12 months">12 Months (1 Year)</option>
            <option value="18 months">18 Months</option>
            <option value="24 months">24 Months (2 Years)</option>
          </Select>
          <FormErrorMessage>{errors.leaseDuration}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.project}>
          <FormLabel color="white" fontWeight="600">
            What project are you working on?
          </FormLabel>
          <Textarea
            name="project"
            value={formData.project}
            onChange={handleChange}
            placeholder="Tell us about your startup, side project, or what you're building..."
            rows={4}
            resize="vertical"
          />
          <FormErrorMessage>{errors.project}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.builderHours}>
          <FormLabel color="white" fontWeight="600">
            What are your builder hours?
          </FormLabel>
          <Textarea
            name="builderHours"
            value={formData.builderHours}
            onChange={handleChange}
            placeholder="e.g., Early mornings 6-10am, Evenings 7pm-midnight, etc."
            rows={3}
            resize="vertical"
          />
          <FormErrorMessage>{errors.builderHours}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.work}>
          <FormLabel color="white" fontWeight="600">
            What do you do for work?
          </FormLabel>
          <Textarea
            name="work"
            value={formData.work}
            onChange={handleChange}
            placeholder="Your day job, freelance work, or full-time on your startup..."
            rows={3}
            resize="vertical"
          />
          <FormErrorMessage>{errors.work}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.budget}>
          <FormLabel color="white" fontWeight="600">
            Monthly Budget
          </FormLabel>
          <Select
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="Select your monthly budget"
            size="lg"
          >
            <option value="$750-$1000">$750 - $1,000</option>
            <option value="$1000-$1500">$1,000 - $1,500</option>
            <option value="$1500-$2000">$1,500 - $2,000</option>
            <option value="$2000+">$2,000+</option>
          </Select>
          <FormErrorMessage>{errors.budget}</FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          size="lg"
          w="full"
          isLoading={isLoading}
          loadingText="Submitting..."
          bg="spotify.green"
          color="black"
          fontWeight="700"
          fontSize="md"
          h="56px"
          _hover={{
            bg: 'spotify.darkGreen',
            transform: 'scale(1.02)',
          }}
          _active={{
            bg: 'spotify.darkGreen',
            transform: 'scale(0.98)',
          }}
          transition="all 0.2s"
        >
          Submit Application
        </Button>

        <Text fontSize="xs" color="whiteAlpha.600" textAlign="center">
          By submitting, you agree to be contacted about your application.
        </Text>
      </VStack>
    </Box>
  );
};

export default ApplicationForm;
