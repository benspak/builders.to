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
  useToast,
  Spinner,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  SimpleGrid,
  Flex,
  Icon,
  IconButton,
  Divider,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarIcon, TimeIcon, CheckIcon, CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import axios from 'axios';

const MeetingDetails = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votingLoading, setVotingLoading] = useState(false);
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

  useEffect(() => {
    fetchMeeting();
  }, [meetingId]);

  const fetchMeeting = async () => {
    try {
      const response = await axios.get(`/api/scheduling/${meetingId}`);
      setMeeting(response.data.meeting);
    } catch (error) {
      console.error('Error fetching meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to load meeting details',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!userData.name || !userData.email) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your name and email',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (selectedSlotIndex === null) {
      toast({
        title: 'No Slot Selected',
        description: 'Please select a time slot to vote',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setVotingLoading(true);
    try {
      await axios.post(`/api/scheduling/${meetingId}/vote`, {
        timeSlotIndex: selectedSlotIndex,
        voter: userData,
      });

      toast({
        title: 'Vote Submitted!',
        description: 'Your vote has been recorded',
        status: 'success',
        duration: 3000,
      });

      onClose();
      fetchMeeting();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to submit vote',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setVotingLoading(false);
    }
  };

  const finalizeMeeting = async (timeSlotIndex) => {
    try {
      await axios.post(`/api/scheduling/${meetingId}/finalize`, {
        timeSlotIndex,
      });

      toast({
        title: 'Meeting Scheduled!',
        description: 'All participants will be notified',
        status: 'success',
        duration: 5000,
      });

      fetchMeeting();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to finalize meeting',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const createZoomLink = async () => {
    try {
      const response = await axios.post(`/api/meetings/${meetingId}/zoom`);

      toast({
        title: 'Zoom Link Created!',
        description: 'The meeting link is now available',
        status: 'success',
        duration: 5000,
      });

      fetchMeeting();
    } catch (error) {
      toast({
        title: 'Note',
        description: 'Zoom integration requires API credentials. Check backend setup.',
        status: 'info',
        duration: 7000,
      });
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link Copied!',
      description: 'Share this link with others to let them vote',
      status: 'success',
      duration: 3000,
    });
  };

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  if (!meeting) {
    return (
      <Container maxW="container.md" py={20}>
        <VStack spacing={4}>
          <Heading>Meeting Not Found</Heading>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </VStack>
      </Container>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

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
            <HStack justify="space-between" w="full">
              <Heading size="xl">{meeting.title}</Heading>
              <Badge
                colorScheme={
                  meeting.status === 'scheduled' ? 'green' :
                  meeting.status === 'voting' ? 'blue' : 'gray'
                }
                fontSize="md"
                px={3}
                py={1}
                borderRadius="full"
              >
                {meeting.status}
              </Badge>
            </HStack>
            <Text color="dark.textSecondary">{meeting.description}</Text>
          </VStack>

          {/* Share Link */}
          {meeting.status === 'voting' && (
            <Card bg="brand.500" bgGradient="linear(to-r, brand.500, brand.600)">
              <CardBody>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" fontSize="lg">
                      Share This Session
                    </Text>
                    <Text fontSize="sm" opacity={0.9}>
                      Let others vote on the best time
                    </Text>
                  </VStack>
                  <Button
                    leftIcon={<CopyIcon />}
                    onClick={copyShareLink}
                    colorScheme="whiteAlpha"
                    variant="solid"
                  >
                    Copy Link
                  </Button>
                </HStack>
              </CardBody>
            </Card>
          )}

          {/* Time Slots - Voting Phase */}
          {meeting.status === 'voting' && (
            <Card>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Heading size="md">Proposed Time Slots</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {meeting.proposedTimeSlots.map((slot, index) => (
                      <Box
                        key={index}
                        p={4}
                        bg="dark.bg"
                        borderRadius="lg"
                        border="2px solid"
                        borderColor="dark.border"
                        transition="all 0.2s"
                        _hover={{ borderColor: 'brand.500' }}
                      >
                        <VStack align="start" spacing={2}>
                          <HStack>
                            <Icon as={CalendarIcon} color="brand.500" />
                            <Text fontWeight="bold">
                              {formatDate(slot.dateTime)}
                            </Text>
                          </HStack>
                          <HStack>
                            <Badge colorScheme="green">
                              {slot.voteCount} {slot.voteCount === 1 ? 'vote' : 'votes'}
                            </Badge>
                          </HStack>
                          {slot.votes.length > 0 && (
                            <Text fontSize="sm" color="dark.textSecondary">
                              {slot.votes.map(v => v.name).join(', ')}
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    ))}
                  </SimpleGrid>

                  <Divider />

                  <Button
                    colorScheme="brand"
                    size="lg"
                    onClick={onOpen}
                    w="full"
                  >
                    Vote for a Time
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Scheduled Meeting Info */}
          {meeting.status === 'scheduled' && (
            <Card>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="brand.500">
                    🎉 Session Scheduled!
                  </Heading>
                  <HStack>
                    <Icon as={CalendarIcon} color="brand.500" boxSize={6} />
                    <Text fontSize="xl" fontWeight="bold">
                      {formatDate(meeting.selectedTimeSlot)}
                    </Text>
                  </HStack>

                  {meeting.zoomLink ? (
                    <Button
                      as="a"
                      href={meeting.zoomLink}
                      target="_blank"
                      colorScheme="brand"
                      size="lg"
                      rightIcon={<ExternalLinkIcon />}
                    >
                      Join Zoom Meeting
                    </Button>
                  ) : (
                    <Button
                      colorScheme="brand"
                      size="lg"
                      onClick={createZoomLink}
                    >
                      Generate Zoom Link
                    </Button>
                  )}

                  {meeting.zoomPassword && (
                    <Text color="dark.textSecondary">
                      Meeting Password: <strong>{meeting.zoomPassword}</strong>
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Participants */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">
                  Participants ({meeting.participants.length})
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  {meeting.participants.map((participant, index) => (
                    <HStack key={index} p={3} bg="dark.bg" borderRadius="md">
                      <Box
                        w={10}
                        h={10}
                        borderRadius="full"
                        bg="brand.500"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontWeight="bold"
                      >
                        {participant.name.charAt(0).toUpperCase()}
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="semibold">{participant.name}</Text>
                        <Text fontSize="sm" color="dark.textSecondary">
                          {participant.email}
                        </Text>
                      </VStack>
                    </HStack>
                  ))}
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Vote Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="dark.bgSecondary">
          <ModalHeader>Vote for a Time Slot</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Your Name</FormLabel>
                <Input
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  placeholder="John Doe"
                  bg="dark.bg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Your Email</FormLabel>
                <Input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  placeholder="john@example.com"
                  bg="dark.bg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Select Time Slot</FormLabel>
                <VStack spacing={2} align="stretch">
                  {meeting.proposedTimeSlots.map((slot, index) => (
                    <Button
                      key={index}
                      variant={selectedSlotIndex === index ? 'solid' : 'outline'}
                      colorScheme={selectedSlotIndex === index ? 'brand' : 'gray'}
                      onClick={() => setSelectedSlotIndex(index)}
                      justifyContent="start"
                      h="auto"
                      py={3}
                    >
                      <VStack align="start" spacing={1}>
                        <Text>{formatDate(slot.dateTime)}</Text>
                        <Text fontSize="xs" opacity={0.7}>
                          {slot.voteCount} {slot.voteCount === 1 ? 'vote' : 'votes'}
                        </Text>
                      </VStack>
                    </Button>
                  ))}
                </VStack>
              </FormControl>

              <Button
                colorScheme="brand"
                w="full"
                onClick={handleVote}
                isLoading={votingLoading}
              >
                Submit Vote
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MeetingDetails;
