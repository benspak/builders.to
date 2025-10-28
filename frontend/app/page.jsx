'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Text,
  Badge,
  Button,
  Select,
  Input,
  Flex,
  VStack,
  HStack
} from '@chakra-ui/react';
import Link from 'next/link';
import axios from '../src/lib/axios';
import { stripHtml } from '../src/components/RichTextEditor';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filterListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings, selectedCategory, selectedLocation]);

  const fetchListings = async () => {
    try {
      const response = await axios.get('/api/listings');
      setListings(response.data);
      const uniqueLocations = [...new Set(response.data.map(l => l.location).filter(Boolean))];
      setLocations(uniqueLocations);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    }
  };

  const filterListings = () => {
    let filtered = listings;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(l => l.category === selectedCategory);
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(l => l.location === selectedLocation);
    }

    setFilteredListings(filtered);
  };

  return (
    <Container maxW="1200px" py={{ base: 4, md: 8 }} px={{ base: 4, md: 6 }}>
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        <Heading size={{ base: "lg", md: "xl" }}>List Jobs, Offer Services, Sell Businesses</Heading>
        <Heading size={{ base: "sm", md: "md" }} color="gray.600">Cost: $5 per listing</Heading>
        <Flex
          gap={4}
          flexWrap="wrap"
          direction={{ base: "column", sm: "row" }}
        >
          <Select
            placeholder="All Categories"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            size={{ base: "md", md: "sm" }}
            width={{ base: "100%", sm: "200px" }}
          >
            <option value="all">All Categories</option>
            <option value="Jobs">Jobs</option>
            <option value="Services">Services</option>
            <option value="For Sale">For Sale</option>
          </Select>

          <Select
            placeholder="All Locations"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            size={{ base: "md", md: "sm" }}
            width={{ base: "100%", sm: "200px" }}
          >
            <option value="all">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </Select>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 4, md: 6 }}>
          {filteredListings.map(listing => (
            <Card key={listing.id} variant="outline" _hover={{ shadow: 'md' }}>
              <CardHeader>
                <Flex justify="space-between" align="start" wrap="wrap" gap={2}>
                  <VStack align="start" spacing={2}>
                    {listing.is_featured && <Badge colorScheme="purple" fontSize={{ base: "xs", md: "sm" }}>Featured</Badge>}
                    <Badge
                      colorScheme={listing.category === 'Jobs' ? 'blue' : listing.category === 'Services' ? 'green' : 'orange'}
                      fontSize={{ base: "xs", md: "sm" }}
                    >
                      {listing.category}
                    </Badge>
                  </VStack>
                </Flex>
                <Heading size={{ base: "xs", md: "sm" }} mt={2}>
                  <Link href={`/listing/${listing.slug}`}>{listing.title}</Link>
                </Heading>
                <HStack justify="space-between" align="center" mt={2} width="100%" spacing={2}>
                  {listing.location && (
                    <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" noOfLines={1}>{listing.location}</Text>
                  )}
                  {listing.profile_username && (
                    <Link href={`/user/${listing.profile_username}`}>
                      <Button size="xs" variant="link" colorScheme="blue">
                        Profile →
                      </Button>
                    </Link>
                  )}
                </HStack>
              </CardHeader>
              <CardBody>
                <Text noOfLines={3} fontSize={{ base: "xs", md: "sm" }}>{stripHtml(listing.description)}</Text>
                <Text fontSize="xs" color="gray.500" mt={2}>
                  {new Date(listing.created_at).toLocaleDateString()}
                </Text>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {filteredListings.length === 0 && (
          <Box textAlign="center" py={{ base: 8, md: 12 }}>
            <Text color="gray.500" fontSize={{ base: "sm", md: "md" }}>No listings found. Be the first to create one!</Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
}
