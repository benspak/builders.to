'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  Card,
  CardBody,
  Text
} from '@chakra-ui/react';
import { useAuth } from '../../src/context/AuthContext';
import axios from '../../src/lib/axios';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/dashboard');
      setListings(response.data.listings);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  if (authLoading) {
    return (
      <Container maxW="6xl" py={8}>
        <Heading>Loading...</Heading>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxW="6xl" py={8}>
        <Heading>Please login to view your dashboard</Heading>
      </Container>
    );
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="xl">Dashboard</Heading>

        <Tabs>
          <TabList>
            <Tab>My Listings</Tab>
            <Tab>Transactions</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              {listings.length === 0 ? (
                <Box textAlign="center" py={12}>
                  <Text color="gray.500">No listings yet.</Text>
                  <Link href="/create-listing">
                    <Button mt={4} colorScheme="blue">Create Your First Listing</Button>
                  </Link>
                </Box>
              ) : (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Title</Th>
                      <Th>Category</Th>
                      <Th>Status</Th>
                      <Th>Featured</Th>
                      <Th>Date</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {listings.map(listing => (
                      <Tr key={listing.id}>
                        <Td>
                          <Link href={`/listing/${listing.id}`}>{listing.title}</Link>
                        </Td>
                        <Td>
                          <Badge>{listing.category}</Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={listing.payment_status === 'paid' || listing.payment_status === 'featured' ? 'green' : 'yellow'}>
                            {listing.payment_status}
                          </Badge>
                        </Td>
                        <Td>{listing.is_featured ? '⭐' : '-'}</Td>
                        <Td>{new Date(listing.created_at).toLocaleDateString()}</Td>
                        <Td>
                          <Link href={`/listing/${listing.id}`}>
                            <Button size="sm">View</Button>
                          </Link>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </TabPanel>

            <TabPanel>
              {transactions.length === 0 ? (
                <Box textAlign="center" py={12}>
                  <Text color="gray.500">No transactions yet.</Text>
                </Box>
              ) : (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Date</Th>
                      <Th>Type</Th>
                      <Th>Amount</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {transactions.map(transaction => (
                      <Tr key={transaction.id}>
                        <Td>{new Date(transaction.created_at).toLocaleDateString()}</Td>
                        <Td>
                          <Badge>{transaction.type}</Badge>
                        </Td>
                        <Td>${transaction.amount}</Td>
                        <Td>
                          <Badge colorScheme={transaction.status === 'completed' ? 'green' : transaction.status === 'failed' ? 'red' : 'yellow'}>
                            {transaction.status}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
}
