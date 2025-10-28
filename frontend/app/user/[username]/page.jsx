'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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
  Link as ChakraLink,
  HStack,
  Alert,
  AlertIcon,
  Skeleton,
  SkeletonText,
  Flex
} from '@chakra-ui/react';
import axios from '../../../src/lib/axios';

export default function PublicProfile() {
  const params = useParams();
  const username = params.username;
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const fetchProfile = async () => {
    try {
      // Fetch profile by username
      const profileResponse = await axios.get(`/api/profiles/username/${username}`);
      setProfile(profileResponse.data);

      // Fetch user's listings by user_id
      const listingsResponse = await axios.get(`/api/listings/user/${profileResponse.data.user_id}`);
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
                {profile.username && (
                  <Text color="gray.500">@{profile.username}</Text>
                )}
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
                  <ChakraLink key={index} href={link.trim()} isExternal color="blue.500">
                    {link.trim()}
                  </ChakraLink>
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
                      <Link href={`/listing/${listing.slug}`}>
                        <Button size="sm">
                          View
                        </Button>
                      </Link>
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
}
