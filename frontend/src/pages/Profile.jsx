import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Heading,
  VStack,
  Alert,
  AlertIcon,
  Divider
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import axios from '../lib/axios';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    sub_heading: '',
    location: '',
    about: '',
    current_role: '',
    additional_details: '',
    key_achievements: '',
    philosophy: '',
    skills: '',
    links: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/profiles/me');
        if (response.data) {
          setProfile(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/profiles', profile);
      setSuccess('Profile saved successfully!');
      setLoading(false);
    } catch (error) {
      setError('Failed to save profile');
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return null;
  }

  return (
    <Container maxW="3xl" py={8}>
      <Box bg="white" p={8} borderRadius="lg" shadow="md">
        <VStack spacing={6} align="stretch">
          <Heading size="lg">Your Profile</Heading>

          {success && (
            <Alert status="success">
              <AlertIcon />
              {success}
            </Alert>
          )}

          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Your name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Sub heading</FormLabel>
                <Input
                  value={profile.sub_heading}
                  onChange={(e) => setProfile({ ...profile, sub_heading: e.target.value })}
                  placeholder="Brief tagline or headline"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Location</FormLabel>
                <Input
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="City, State"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Current Role</FormLabel>
                <Input
                  value={profile.current_role}
                  onChange={(e) => setProfile({ ...profile, current_role: e.target.value })}
                  placeholder="Your current position"
                />
              </FormControl>

              <FormControl>
                <FormLabel>About</FormLabel>
                <Textarea
                  value={profile.about}
                  onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Key Achievements</FormLabel>
                <Textarea
                  value={profile.key_achievements}
                  onChange={(e) => setProfile({ ...profile, key_achievements: e.target.value })}
                  placeholder="What you've accomplished"
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Philosophy</FormLabel>
                <Textarea
                  value={profile.philosophy}
                  onChange={(e) => setProfile({ ...profile, philosophy: e.target.value })}
                  placeholder="Your professional philosophy or approach"
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Skills</FormLabel>
                <Input
                  value={profile.skills}
                  onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                  placeholder="React, Node.js, Design, etc."
                />
              </FormControl>

              <FormControl>
                <FormLabel>Additional Details</FormLabel>
                <Textarea
                  value={profile.additional_details}
                  onChange={(e) => setProfile({ ...profile, additional_details: e.target.value })}
                  placeholder="Any additional information"
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Links</FormLabel>
                <Input
                  value={profile.links}
                  onChange={(e) => setProfile({ ...profile, links: e.target.value })}
                  placeholder="https://portfolio.com, https://github.com"
                />
              </FormControl>

              <Button type="submit" colorScheme="blue" isLoading={loading}>
                Save Profile
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Container>
  );
};

export default Profile;
