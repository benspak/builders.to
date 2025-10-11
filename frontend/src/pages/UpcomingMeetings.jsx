import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Card,
  CardBody,
  Badge,
  SimpleGrid,
  Spinner,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, TimeIcon } from '@chakra-ui/icons';
import axios from 'axios';

const UpcomingMeetings = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await axios.get('/api/meetings/upcoming');
      setMeetings(response.data.meetings || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  return (
    <Box minH="100vh" py={12}>
      <Container maxW="container.lg">
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
            <Heading size="xl">Upcoming Sessions</Heading>
            <Text color="dark.textSecondary">
              Join scheduled coworking sessions with fellow builders
            </Text>
          </VStack>

          {/* Meetings List */}
          {meetings.length === 0 ? (
            <Card>
              <CardBody py={12}>
                <VStack spacing={4}>
                  <Text fontSize="lg" color="dark.textSecondary">
                    No upcoming sessions scheduled yet
                  </Text>
                  <Button colorScheme="brand" onClick={() => navigate('/create')}>
                    Schedule a Session
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {meetings.map((meeting) => (
                <Card
                  key={meeting._id}
                  cursor="pointer"
                  onClick={() => navigate(`/meeting/${meeting._id}`)}
                  transition="all 0.2s"
                  _hover={{
                    transform: 'translateY(-4px)',
                    boxShadow: 'lg',
                    borderColor: 'brand.500',
                  }}
                >
                  <CardBody>
                    <VStack align="start" spacing={4}>
                      <HStack justify="space-between" w="full">
                        <Badge colorScheme="green">Scheduled</Badge>
                        <Text fontSize="sm" color="dark.textSecondary">
                          {meeting.participants.length} participants
                        </Text>
                      </HStack>

                      <Heading size="md">{meeting.title}</Heading>

                      <HStack color="brand.500">
                        <Icon as={CalendarIcon} />
                        <Text fontWeight="semibold">
                          {formatDate(meeting.selectedTimeSlot)}
                        </Text>
                      </HStack>

                      <HStack color="dark.textSecondary">
                        <Icon as={TimeIcon} />
                        <Text fontSize="sm">{meeting.duration} minutes</Text>
                      </HStack>

                      <Button
                        w="full"
                        variant="outline"
                        colorScheme="brand"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/meeting/${meeting._id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}

          {/* CTA */}
          <Card bg="dark.bgSecondary">
            <CardBody py={8}>
              <VStack spacing={4}>
                <Heading size="md">Want to create your own session?</Heading>
                <Button
                  colorScheme="brand"
                  size="lg"
                  onClick={() => navigate('/create')}
                >
                  Schedule a Session
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default UpcomingMeetings;
