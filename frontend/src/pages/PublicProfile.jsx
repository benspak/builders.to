import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Avatar,
  Divider,
  Link,
  HStack,
  Alert,
  AlertIcon,
  Skeleton,
  SkeletonText,
  Flex
} from '@chakra-ui/react';
import axios from '../lib/axios';

const PublicProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      // Fetch profile by user_id
      const profileResponse = await axios.get(`/api/profiles/user/${userId}`);
      setProfile(profileResponse.data);

      // Fetch user's listings
      const listingsResponse = await axios.get(`/api/listings/user/${userId}`);
      setListings(listingsResponse.data);

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Profile not found');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="4xl" py={8}>
        <Skeleton height="200px" mb={4} />
        <SkeletonText mt="4" noOfLines={6} spacing="4" />
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container maxW="4xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error || 'Profile not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Profile Header */}
        <Card>
          <CardBody>
            <HStack spacing={6}>
              <Avatar size="2xl" name={profile.name} />
              <VStack align="start" spacing={2} flex={1}>
                <Heading size="lg">{profile.name || 'Builder'}</Heading>
                {profile.sub_heading && (
                  <Text color="gray.600">{profile.sub_heading}</Text>
                )}
                <HStack spacing={4}>
                  {profile.current_role && (
                    <Badge colorScheme="blue">{profile.current_role}</Badge>
                  )}
                  {profile.location && (
                    <Text color="gray.500">📍 {profile.location}</Text>
                  )}
                </HStack>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* About Section */}
        {profile.about && (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>About</Heading>
              <Text>{profile.about}</Text>
            </CardBody>
          </Card>
        )}

        {/* Key Achievements */}
        {profile.key_achievements && (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Key Achievements</Heading>
              <Text whiteSpace="pre-wrap">{profile.key_achievements}</Text>
            </CardBody>
          </Card>
        )}

        {/* Philosophy */}
        {profile.philosophy && (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Philosophy</Heading>
              <Text whiteSpace="pre-wrap">{profile.philosophy}</Text>
            </CardBody>
          </Card>
        )}

        {/* Skills */}
        {profile.skills && (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Skills</Heading>
              <Flex gap={2} flexWrap="wrap">
                {profile.skills.split(',').map((skill, index) => (
                  <Badge key={index} colorScheme="green" p={2}>
                    {skill.trim()}
                  </Badge>
                ))}
              </Flex>
            </CardBody>
          </Card>
        )}

        {/* Additional Details */}
        {profile.additional_details && (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Additional Details</Heading>
              <Text whiteSpace="pre-wrap">{profile.additional_details}</Text>
            </CardBody>
          </Card>
        )}

        {/* Links */}
        {profile.links && (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Links</Heading>
              <VStack align="start" spacing={2}>
                {profile.links.split(',').map((link, index) => (
                  <Link key={index} href={link.trim()} isExternal color="blue.500">
                    {link.trim()}
                  </Link>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Listings Section */}
        {listings.length > 0 && (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Active Listings ({listings.length})</Heading>
              <VStack spacing={3} align="stretch">
                {listings.map(listing => (
                  <Box key={listing.id} p={3} border="1px" borderColor="gray.200" borderRadius="md">
                    <HStack justify="space-between">
                      <Box flex={1}>
                        <Text fontWeight="bold">{listing.title}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {listing.category} • {listing.location}
                        </Text>
                      </Box>
                      <Button as="a" href={`/listing/${listing.id}`} size="sm">
                        View
                      </Button>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  );
};

export default PublicProfile;
