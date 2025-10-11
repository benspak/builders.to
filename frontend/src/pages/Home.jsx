import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  Flex,
  Badge,
  useDisclosure,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { TimeIcon, CalendarIcon, ChatIcon } from '@chakra-ui/icons';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: ChatIcon,
      title: '5 Minutes: Connect',
      description: 'Quick intros to get to know your fellow builders',
      color: 'brand.400',
    },
    {
      icon: TimeIcon,
      title: '30 Minutes: Build',
      description: 'Heads down focused work session with accountability',
      color: 'brand.500',
    },
    {
      icon: CalendarIcon,
      title: '10 Minutes: Recap',
      description: 'Share progress, wins, and learnings with the group',
      color: 'brand.600',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        bgGradient="linear(to-br, dark.bg, dark.bgSecondary)"
        borderBottom="1px solid"
        borderColor="dark.border"
      >
        <Container maxW="container.xl" py={20}>
          <VStack spacing={6} align="center" textAlign="center">
            <Badge
              colorScheme="green"
              fontSize="sm"
              px={4}
              py={2}
              borderRadius="full"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              Video Coworking for Builders
            </Badge>

            <Heading
              as="h1"
              size="3xl"
              fontWeight="bold"
              bgGradient="linear(to-r, brand.400, brand.600)"
              bgClip="text"
              maxW="800px"
            >
              Build Together. Ship Faster.
            </Heading>

            <Text
              fontSize="xl"
              color="dark.textSecondary"
              maxW="600px"
              lineHeight="tall"
            >
              Join focused 45-minute coworking sessions with fellow founders.
              Get accountability, momentum, and ship your ideas faster.
            </Text>

            <HStack spacing={4} pt={4}>
              <Button
                size="lg"
                colorScheme="brand"
                onClick={() => navigate('/create')}
                px={8}
                py={6}
                fontSize="lg"
              >
                Schedule a Session
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/upcoming')}
                px={8}
                py={6}
                fontSize="lg"
              >
                View Upcoming Sessions
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxW="container.xl" py={20}>
        <VStack spacing={12}>
          <VStack spacing={3} textAlign="center">
            <Heading size="xl">How It Works</Heading>
            <Text color="dark.textSecondary" fontSize="lg">
              A simple 45-minute structure designed for maximum productivity
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
            {features.map((feature, index) => (
              <Box
                key={index}
                p={8}
                bg="dark.bgSecondary"
                borderRadius="xl"
                border="1px solid"
                borderColor="dark.border"
                transition="all 0.3s"
                _hover={{
                  transform: 'translateY(-4px)',
                  borderColor: 'brand.500',
                  boxShadow: '0 8px 30px rgba(63, 145, 66, 0.2)',
                }}
              >
                <VStack align="start" spacing={4}>
                  <Flex
                    w={12}
                    h={12}
                    align="center"
                    justify="center"
                    borderRadius="lg"
                    bg={`${feature.color}20`}
                  >
                    <Icon as={feature.icon} w={6} h={6} color={feature.color} />
                  </Flex>
                  <Heading size="md">{feature.title}</Heading>
                  <Text color="dark.textSecondary">{feature.description}</Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Why Cowork Section */}
      <Box bg="dark.bgSecondary" borderY="1px solid" borderColor="dark.border">
        <Container maxW="container.xl" py={20}>
          <VStack spacing={8}>
            <Heading size="xl" textAlign="center">
              Why Video Coworking?
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
              <FeatureCard
                title="Beat Isolation"
                description="Working solo? Join a community of builders who get it. No more lonely grind."
              />
              <FeatureCard
                title="Stay Accountable"
                description="Knowing others are watching (and building) keeps you focused and on track."
              />
              <FeatureCard
                title="Ship Faster"
                description="45-minute sprints help you make real progress. Small wins compound into big results."
              />
              <FeatureCard
                title="Network Authentically"
                description="Build genuine relationships with other founders while working on your projects."
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxW="container.xl" py={20}>
        <Box
          bg="dark.bgSecondary"
          borderRadius="2xl"
          border="1px solid"
          borderColor="brand.500"
          p={12}
          textAlign="center"
        >
          <VStack spacing={6}>
            <Heading size="xl">Ready to Build?</Heading>
            <Text fontSize="lg" color="dark.textSecondary" maxW="600px">
              Schedule your first coworking session and experience the power of
              building together.
            </Text>
            <Button
              size="lg"
              colorScheme="brand"
              onClick={() => navigate('/create')}
              px={10}
              py={6}
              fontSize="lg"
            >
              Get Started Now
            </Button>
          </VStack>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        borderTop="1px solid"
        borderColor="dark.border"
        py={8}
        bg="dark.bgSecondary"
      >
        <Container maxW="container.xl">
          <Text textAlign="center" color="dark.textSecondary">
            © 2025 Builders.to. Built by builders, for builders.
          </Text>
        </Container>
      </Box>
    </Box>
  );
};

const FeatureCard = ({ title, description }) => (
  <Box
    p={6}
    bg="dark.bg"
    borderRadius="lg"
    border="1px solid"
    borderColor="dark.border"
  >
    <VStack align="start" spacing={3}>
      <Heading size="md" color="brand.400">
        {title}
      </Heading>
      <Text color="dark.textSecondary">{description}</Text>
    </VStack>
  </Box>
);

export default Home;
