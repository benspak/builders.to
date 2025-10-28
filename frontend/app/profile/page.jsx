'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/context/AuthContext';
import axios from '../../src/lib/axios';

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    username: '',
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
      router.push('/login');
    }
  }, [user, authLoading, router]);

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
    <div className="container" style={{ maxWidth: '48rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h1 className="heading heading-lg">Your Profile</h1>

          {success && (
            <div className="alert alert-success">
              <span style={{ fontSize: '1.25rem' }}>✓</span>
              {success}
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <span style={{ fontSize: '1.25rem' }}>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-control">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>

              <div className="form-control">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  placeholder="Your username (used in your profile URL)"
                  required
                />
                <p className="text text-sm text-secondary" style={{ marginTop: '0.25rem' }}>
                  Your profile will be at /user/{profile.username || 'username'}
                </p>
              </div>

              <div className="form-control">
                <label className="form-label">Sub heading</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.sub_heading}
                  onChange={(e) => setProfile({ ...profile, sub_heading: e.target.value })}
                  placeholder="Brief tagline or headline"
                />
              </div>

              <div className="form-control">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="City, State"
                />
              </div>

              <div className="form-control">
                <label className="form-label">Current Role</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.current_role}
                  onChange={(e) => setProfile({ ...profile, current_role: e.target.value })}
                  placeholder="Your current position"
                />
              </div>

              <div className="form-control">
                <label className="form-label">About</label>
                <textarea
                  className="form-textarea"
                  value={profile.about}
                  onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              </div>

              <div className="form-control">
                <label className="form-label">Key Achievements</label>
                <textarea
                  className="form-textarea"
                  value={profile.key_achievements}
                  onChange={(e) => setProfile({ ...profile, key_achievements: e.target.value })}
                  placeholder="What you've accomplished"
                  rows={3}
                />
              </div>

              <div className="form-control">
                <label className="form-label">Philosophy</label>
                <textarea
                  className="form-textarea"
                  value={profile.philosophy}
                  onChange={(e) => setProfile({ ...profile, philosophy: e.target.value })}
                  placeholder="Your professional philosophy or approach"
                  rows={3}
                />
              </div>

              <div className="form-control">
                <label className="form-label">Skills</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.skills}
                  onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                  placeholder="React, Node.js, Design, etc."
                />
              </div>

              <div className="form-control">
                <label className="form-label">Additional Details</label>
                <textarea
                  className="form-textarea"
                  value={profile.additional_details}
                  onChange={(e) => setProfile({ ...profile, additional_details: e.target.value })}
                  placeholder="Any additional information"
                  rows={3}
                />
              </div>

              <div className="form-control">
                <label className="form-label">Links</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.links}
                  onChange={(e) => setProfile({ ...profile, links: e.target.value })}
                  placeholder="https://portfolio.com, https://github.com"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
