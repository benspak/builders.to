import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Card,
  CardBody,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import axios from 'axios';

const CreateMeeting = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    creatorName: '',
    creatorEmail: '',
    title: 'Builders.to Coworking Session',
  });

  const [timeSlots, setTimeSlots] = useState([
    { dateTime: '' },
    { dateTime: '' },
    { dateTime: '' },
  ]);

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { dateTime: '' }]);
  };

  const removeTimeSlot = (index) => {
    if (timeSlots.length > 1) {
      setTimeSlots(timeSlots.filter((_, i) => i !== index));
    }
  };

  const updateTimeSlot = (index, value) => {
    const updated = [...timeSlots];
    updated[index].dateTime = value;
    setTimeSlots(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.creatorName || !formData.creatorEmail) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in your name and email',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    const validTimeSlots = timeSlots.filter(slot => slot.dateTime);
    if (validTimeSlots.length === 0) {
      toast({
        title: 'No Time Slots',
        description: 'Please add at least one time slot',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/scheduling/create', {
        title: formData.title,
        description: '5 min intro → 30 min focused work → 10 min recap',
        createdBy: {
          name: formData.creatorName,
          email: formData.creatorEmail,
        },
        proposedTimeSlots: validTimeSlots,
        maxParticipants: 10,
      });

      toast({
        title: 'Session Created!',
        description: 'Your coworking session is ready. Share the link with others!',
        status: 'success',
        duration: 5000,
      });

      navigate(`/meeting/${response.data.meeting._id}`);
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create session',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" py={12}>
      <Container maxW="container.md">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={3} align="start">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              size="sm"
              color="dark.textSecondary"
            >
              ← Back to Home
            </Button>
            <Heading size="xl">Schedule a Coworking Session</Heading>
            <Text color="dark.textSecondary">
              Propose multiple time slots and let participants vote on what works best
            </Text>
          </VStack>

          {/* Form */}
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6} align="stretch">
                  {/* Session Title */}
                  <FormControl isRequired>
                    <FormLabel>Session Title</FormLabel>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Builders.to Coworking Session"
                      bg="dark.bg"
                      borderColor="dark.border"
                    />
                  </FormControl>

                  {/* Creator Info */}
                  <FormControl isRequired>
                    <FormLabel>Your Name</FormLabel>
                    <Input
                      value={formData.creatorName}
                      onChange={(e) =>
                        setFormData({ ...formData, creatorName: e.target.value })
                      }
                      placeholder="John Doe"
                      bg="dark.bg"
                      borderColor="dark.border"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Your Email</FormLabel>
                    <Input
                      type="email"
                      value={formData.creatorEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, creatorEmail: e.target.value })
                      }
                      placeholder="john@example.com"
                      bg="dark.bg"
                      borderColor="dark.border"
                    />
                  </FormControl>

                  {/* Time Slots */}
                  <Box>
                    <Flex justify="space-between" align="center" mb={3}>
                      <FormLabel mb={0}>Proposed Time Slots</FormLabel>
                      <Button
                        size="sm"
                        leftIcon={<AddIcon />}
                        onClick={addTimeSlot}
                        variant="outline"
                        colorScheme="brand"
                      >
                        Add Slot
                      </Button>
                    </Flex>
                    <VStack spacing={3}>
                      {timeSlots.map((slot, index) => (
                        <HStack key={index} w="full">
                          <Input
                            type="datetime-local"
                            value={slot.dateTime}
                            onChange={(e) => updateTimeSlot(index, e.target.value)}
                            bg="dark.bg"
                            borderColor="dark.border"
                            flex={1}
                          />
                          {timeSlots.length > 1 && (
                            <IconButton
                              icon={<DeleteIcon />}
                              onClick={() => removeTimeSlot(index)}
                              colorScheme="red"
                              variant="ghost"
                              aria-label="Remove time slot"
                            />
                          )}
                        </HStack>
                      ))}
                    </VStack>
                    <Text fontSize="sm" color="dark.textSecondary" mt={2}>
                      Add 2-5 time options for participants to vote on
                    </Text>
                  </Box>

                  {/* Submit */}
                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    isLoading={loading}
                    w="full"
                  >
                    Create Session
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default CreateMeeting;
