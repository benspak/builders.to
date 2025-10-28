'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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
      <div className="container" style={{ maxWidth: '56rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div style={{ height: '200px', background: 'var(--bg-secondary-light)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }} />
        <div style={{ height: '20px', background: 'var(--bg-secondary-light)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }} />
        <div style={{ height: '20px', background: 'var(--bg-secondary-light)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }} />
        <div style={{ height: '20px', background: 'var(--bg-secondary-light)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container" style={{ maxWidth: '56rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="alert alert-error">
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          {error || 'Profile not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '56rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Profile Header */}
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div className="avatar avatar-xl">{profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <h2 className="heading heading-lg">{profile.name || 'Builder'}</h2>
                {profile.username && (
                  <p className="text text-sm text-secondary">@{profile.username}</p>
                )}
                {profile.sub_heading && (
                  <p className="text text-base text-secondary">{profile.sub_heading}</p>
                )}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.5rem' }}>
                  {profile.current_role && (
                    <span className="badge badge-primary">{profile.current_role}</span>
                  )}
                  {profile.location && (
                    <span className="text text-sm text-secondary">📍 {profile.location}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        {profile.about && (
          <div className="card">
            <div className="card-body">
              <h3 className="heading heading-md" style={{ marginBottom: '1rem' }}>About</h3>
              <p className="text">{profile.about}</p>
            </div>
          </div>
        )}

        {/* Key Achievements */}
        {profile.key_achievements && (
          <div className="card">
            <div className="card-body">
              <h3 className="heading heading-md" style={{ marginBottom: '1rem' }}>Key Achievements</h3>
              <p className="text" style={{ whiteSpace: 'pre-wrap' }}>{profile.key_achievements}</p>
            </div>
          </div>
        )}

        {/* Philosophy */}
        {profile.philosophy && (
          <div className="card">
            <div className="card-body">
              <h3 className="heading heading-md" style={{ marginBottom: '1rem' }}>Philosophy</h3>
              <p className="text" style={{ whiteSpace: 'pre-wrap' }}>{profile.philosophy}</p>
            </div>
          </div>
        )}

        {/* Skills */}
        {profile.skills && (
          <div className="card">
            <div className="card-body">
              <h3 className="heading heading-md" style={{ marginBottom: '1rem' }}>Skills</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {profile.skills.split(',').map((skill, index) => (
                  <span key={index} className="badge badge-success" style={{ padding: '0.5rem' }}>
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Additional Details */}
        {profile.additional_details && (
          <div className="card">
            <div className="card-body">
              <h3 className="heading heading-md" style={{ marginBottom: '1rem' }}>Additional Details</h3>
              <p className="text" style={{ whiteSpace: 'pre-wrap' }}>{profile.additional_details}</p>
            </div>
          </div>
        )}

        {/* Links */}
        {profile.links && (
          <div className="card">
            <div className="card-body">
              <h3 className="heading heading-md" style={{ marginBottom: '1rem' }}>Links</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                {profile.links.split(',').map((link, index) => (
                  <a key={index} href={link.trim()} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                    {link.trim()}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Listings Section */}
        {listings.length > 0 && (
          <div className="card">
            <div className="card-body">
              <h3 className="heading heading-md" style={{ marginBottom: '1rem' }}>Active Listings ({listings.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {listings.map(listing => (
                  <div key={listing.id} style={{ padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <p className="text" style={{ fontWeight: 600 }}>{listing.title}</p>
                        <p className="text text-sm text-secondary">
                          {listing.category} • {listing.location}
                        </p>
                      </div>
                      <Link href={`/listing/${listing.slug}`}>
                        <button className="btn btn-sm">View</button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
