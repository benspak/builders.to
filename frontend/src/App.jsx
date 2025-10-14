import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  useToast,
  Flex,
  Image,
  AspectRatio,
} from '@chakra-ui/react';
import { useState } from 'react';
import ApplicationForm from './components/ApplicationForm';

const FeatureCard = ({ icon, title, description }) => (
  <Box
    bg="spotify.gray"
    p={6}
    borderRadius="xl"
    border="1px solid"
    borderColor="whiteAlpha.200"
    transition="all 0.3s"
    _hover={{
      borderColor: 'spotify.green',
      transform: 'translateY(-4px)',
      shadow: 'xl',
    }}
  >
    <VStack align="start" spacing={3}>
      <Box
        fontSize="3xl"
        bg="spotify.darkGray"
        p={3}
        borderRadius="lg"
        border="1px solid"
        borderColor="whiteAlpha.100"
      >
        {icon}
      </Box>
      <Heading size="md" color="white">
        {title}
      </Heading>
      <Text color="whiteAlpha.700" fontSize="sm">
        {description}
      </Text>
    </VStack>
  </Box>
);

function App() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <Box minH="100vh" bg="#121212">
      {/* Hero Section */}
      <Box
        bgGradient="linear(to-b, spotify.darkGray, #121212)"
        pt={{ base: 16, md: 24 }}
        pb={{ base: 12, md: 16 }}
        position="relative"
        overflow="hidden"
      >
        {/* Background Image */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.1}
          zIndex={0}
        >
          <Image
            src="/images/orlando.png"
            alt="Orlando skyline"
            w="full"
            h="full"
            objectFit="cover"
          />
        </Box>

        <Container maxW="container.xl" position="relative" zIndex={1}>
          <VStack spacing={6} textAlign="center">
            <Heading
              as="h1"
              fontSize={{ base: '4xl', md: '6xl', lg: '7xl' }}
              fontWeight="900"
              bgGradient="linear(to-r, white, spotify.green)"
              bgClip="text"
              lineHeight="1.2"
            >
              builders.to
            </Heading>
            <Text
              fontSize={{ base: 'xl', md: '2xl' }}
              color="spotify.lightGray"
              maxW="2xl"
              fontWeight="500"
            >
              A hacker house for motivated founders and builders
            </Text>
            <HStack
              spacing={2}
              color="whiteAlpha.600"
              fontSize={{ base: 'md', md: 'lg' }}
            >
              <Text>📍</Text>
              <Text>Orlando, Florida • Near UCF</Text>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Location Showcase Section */}
      <Box bg="spotify.darkGray" py={{ base: 12, md: 16 }}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading
                as="h2"
                fontSize={{ base: '3xl', md: '4xl' }}
                color="white"
              >
                Why Orlando?
              </Heading>
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                color="whiteAlpha.700"
                maxW="2xl"
              >
                Orlando isn't just theme parks. It's a growing tech hub with UCF,
                a vibrant startup scene, and the perfect environment for builders.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="full">
              {/* Orlando Skyline */}
              <Box
                borderRadius="xl"
                overflow="hidden"
                border="1px solid"
                borderColor="whiteAlpha.200"
                transition="all 0.3s"
                _hover={{
                  borderColor: 'spotify.green',
                  transform: 'translateY(-4px)',
                  shadow: 'xl',
                }}
              >
                <AspectRatio ratio={16/9}>
                  <Image
                    src="/images/orlando.png"
                    alt="Beautiful Orlando skyline with lake"
                    objectFit="cover"
                  />
                </AspectRatio>
                <Box p={6}>
                  <Heading size="md" color="white" mb={2}>
                    Beautiful City, Better Lifestyle
                  </Heading>
                  <Text color="whiteAlpha.700" fontSize="sm">
                    Work from a city that balances urban energy with natural beauty.
                    Orlando's skyline reflects the innovation happening here.
                  </Text>
                </Box>
              </Box>

              {/* Universal Studios */}
              <Box
                borderRadius="xl"
                overflow="hidden"
                border="1px solid"
                borderColor="whiteAlpha.200"
                transition="all 0.3s"
                _hover={{
                  borderColor: 'spotify.green',
                  transform: 'translateY(-4px)',
                  shadow: 'xl',
                }}
              >
                <AspectRatio ratio={16/9}>
                  <Image
                    src="/images/universal.png"
                    alt="Universal Studios theme park"
                    objectFit="cover"
                  />
                </AspectRatio>
                <Box p={6}>
                  <Heading size="md" color="white" mb={2}>
                    Entertainment Capital
                  </Heading>
                  <Text color="whiteAlpha.700" fontSize="sm">
                    When you need a break from building, world-class entertainment
                    is minutes away. Perfect for team bonding and inspiration.
                  </Text>
                </Box>
              </Box>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="container.xl" py={{ base: 12, md: 16 }}>
        <VStack spacing={12}>
          <VStack spacing={4} textAlign="center">
            <Heading
              as="h2"
              fontSize={{ base: '3xl', md: '4xl' }}
              color="white"
            >
              Why Join builders.to?
            </Heading>
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color="whiteAlpha.700"
              maxW="2xl"
            >
              Live alongside ambitious builders who share your drive to create
              and ship.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
            <FeatureCard
              icon="🚀"
              title="Ship Faster"
              description="Surrounded by builders who understand the grind. Get instant feedback, accountability, and motivation."
            />
            <FeatureCard
              icon="🤝"
              title="Network Effect"
              description="Connect with founders, developers, and creators. Find co-founders, early users, and collaborators."
            />
            <FeatureCard
              icon="🎯"
              title="Deep Focus"
              description="Dedicated space designed for deep work. No distractions, just building."
            />
            <FeatureCard
              icon="💡"
              title="Daily Standups"
              description="Share progress, get feedback, and stay accountable with daily check-ins."
            />
            <FeatureCard
              icon="🏢"
              title="Prime Location"
              description="Near UCF in Orlando, FL. Easy access to talent, coffee shops, and the startup scene."
            />
            <FeatureCard
              icon="⚡"
              title="High-Speed Everything"
              description="Gigabit internet, standing desks, monitors, and all the tools you need to build."
            />
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Application Form Section */}
      <Box bg="spotify.darkGray" py={{ base: 12, md: 16 }}>
        <Container maxW="container.md">
          <VStack spacing={8}>
            <VStack spacing={4} textAlign="center">
              <Heading
                as="h2"
                fontSize={{ base: '3xl', md: '4xl' }}
                color="white"
              >
                Apply to Join
              </Heading>
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                color="whiteAlpha.700"
                maxW="xl"
              >
                We're looking for motivated builders who are serious about
                shipping. Tell us about yourself and your project.
              </Text>
            </VStack>

            <ApplicationForm
              isSubmitted={isSubmitted}
              setIsSubmitted={setIsSubmitted}
            />
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={8} borderTop="1px solid" borderColor="whiteAlpha.100">
        <Container maxW="container.xl">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            gap={4}
          >
            <Text color="whiteAlpha.600" fontSize="sm">
              © 2025 builders.to • Orlando, Florida
            </Text>
            <Text color="whiteAlpha.600" fontSize="sm">
              Building the future, one founder at a time
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
