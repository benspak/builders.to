'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from '../../src/lib/axios';

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.trim() || locationFilter.trim() || skillsFilter.trim()) {
      setIsSearching(true);
      const timeoutId = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setIsSearching(false);
      fetchProfiles();
    }
  }, [searchQuery, locationFilter, skillsFilter]);

  const fetchProfiles = async () => {
    try {
      const response = await axios.get('/api/profiles');
      setProfiles(response.data);
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    }
  };

  const performSearch = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (locationFilter.trim()) params.append('location', locationFilter.trim());
      if (skillsFilter.trim()) params.append('skills', skillsFilter.trim());

      const response = await axios.get(`/api/profiles/search?${params.toString()}`);
      setProfiles(response.data);
      setIsSearching(false);
    } catch (error) {
      console.error('Search failed:', error);
      setIsSearching(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '72rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 className="heading heading-xl">Browse Builders</h1>
          <p className="text text-base text-secondary" style={{ marginTop: '0.5rem' }}>
            Discover talented builders and founders
          </p>
        </div>

        {/* Search and Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by name, skills, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingTop: '0.75rem',
                paddingRight: isSearching ? '3rem' : '2.5rem',
                paddingBottom: '0.75rem',
                paddingLeft: '1rem',
                fontSize: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '2px solid #e5e7eb',
                width: '100%',
                backgroundColor: 'white',
                color: '#111827',
                transition: 'all var(--transition-fast)'
              }}
            />
            <div style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6b7280',
              fontSize: '1.25rem'
            }}>
              {isSearching ? '⏳' : '🔍'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Filter by skills..."
              value={skillsFilter}
              onChange={(e) => setSkillsFilter(e.target.value)}
            />
          </div>

          {(searchQuery || locationFilter || skillsFilter) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="text text-sm text-secondary">
                Active filters
              </span>
              <button
                className="btn-link text-xs"
                onClick={() => {
                  setSearchQuery('');
                  setLocationFilter('');
                  setSkillsFilter('');
                }}
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {profiles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <p className="text text-base text-secondary">No profiles found.</p>
          </div>
        ) : (
          <div className="grid grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {profiles.map((profile) => (
              <Link key={profile.id} href={`/user/${profile.username}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ height: '100%', cursor: 'pointer', transition: 'transform 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div className="avatar" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                        {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 className="heading heading-sm" style={{ margin: 0, color: '#ffffff' }}>
                          {profile.name || 'Anonymous'}
                        </h3>
                        {profile.sub_heading && (
                          <p className="text text-xs text-secondary" style={{ margin: '0.25rem 0 0 0' }}>
                            {profile.sub_heading}
                          </p>
                        )}
                      </div>
                    </div>

                    {profile.current_role && (
                      <p className="text text-sm" style={{ marginBottom: '0.5rem' }}>
                        <strong>Role:</strong> {profile.current_role}
                      </p>
                    )}

                    {profile.location && (
                      <p className="text text-sm text-secondary" style={{ marginBottom: '0.5rem' }}>
                        📍 {profile.location}
                      </p>
                    )}

                    {profile.skills && (
                      <p className="text text-xs" style={{ marginTop: '0.75rem', color: '#6366f1' }}>
                        {profile.skills}
                      </p>
                    )}

                    {profile.listing_count > 0 && (
                      <p className="text text-xs text-secondary" style={{ marginTop: '0.75rem' }}>
                        {profile.listing_count} {profile.listing_count === 1 ? 'listing' : 'listings'}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
