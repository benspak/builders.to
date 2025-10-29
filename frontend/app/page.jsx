'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from '../src/lib/axios';
import { stripHtml } from '../src/components/RichTextEditor';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [locations, setLocations] = useState([]);
  const [featuredUsers, setFeaturedUsers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  useEffect(() => {
    fetchListings();
    fetchFeaturedUsers();
  }, []);

  const fetchFeaturedUsers = async () => {
    try {
      const response = await axios.get('/api/profiles/featured');
      setFeaturedUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch featured users:', error);
    }
  };

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

  // Filter listings by selected category and location
  const getFilteredListings = () => {
    let filtered = listings;

    // Filter by category
    if (selectedCategory === 'featured') {
      filtered = filtered.filter(l => l.is_featured);
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter(l => l.category === selectedCategory);
    }

    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(l => l.location === selectedLocation);
    }

    return filtered;
  };

  const filteredListings = getFilteredListings();

  // Segment filtered listings by category
  const featuredListings = filteredListings.filter(l => l.is_featured);
  const servicesListings = filteredListings.filter(l => l.category === 'Services' && !l.is_featured);
  const jobsListings = filteredListings.filter(l => l.category === 'Jobs' && !l.is_featured);
  const forSaleListings = filteredListings.filter(l => l.category === 'For Sale' && !l.is_featured);

  // Render a listing card
  const renderListing = (listing) => (
    <div key={listing.id} className="card">
      <div className="card-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {listing.is_featured && <span className="badge badge-primary">Featured</span>}
            <span className={`badge ${listing.category === 'Jobs' ? 'badge-primary' : listing.category === 'Services' ? 'badge-success' : 'badge-warning'}`}>
              {listing.category}
            </span>
          </div>
        </div>
        <h2 className="heading heading-sm" style={{ marginTop: '1rem' }}>
          <Link href={`/listing/${listing.slug}`}>{listing.title}</Link>
        </h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          {listing.location && (
            <span className="text text-sm text-secondary">📍 {listing.location}</span>
          )}
          {listing.profile_username && (
            <Link href={`/user/${listing.profile_username}`} className="btn-link text-sm">
              Profile →
            </Link>
          )}
        </div>
      </div>
      <div className="card-body">
        <p className="text text-sm" style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {stripHtml(listing.description)}
        </p>
        <p className="text text-xs text-secondary" style={{ marginTop: '0.5rem' }}>
          {new Date(listing.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );

  // Render a category section
  const renderCategorySection = (title, items, icon = '📋') => {
    if (items.length === 0) return null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 className="heading heading-md category-section-header">
          <span>{icon}</span>
          {title}
        </h2>
        <div className="grid grid-responsive">
          {items.map(renderListing)}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 3fr 1fr',
      gap: '2rem',
      paddingTop: '2rem',
      paddingBottom: '2rem',
      maxWidth: '1400px',
      margin: '0 auto',
      paddingLeft: '1rem',
      paddingRight: '1rem'
    }}>
      {/* Left Column */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'sticky',
        top: '1rem',
        height: 'fit-content'
      }}>
        <div style={{ padding: '1rem', backgroundColor: 'var(--background-secondary)', borderRadius: '8px' }}>
          <h3 className="heading heading-sm">Filter by Category</h3>
          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.5rem',
                background: selectedCategory === 'all'
                  ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                  : '#e5e7eb',
                color: selectedCategory === 'all' ? 'white' : '#374151',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== 'all') {
                  e.target.style.background = '#d1d5db';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== 'all') {
                  e.target.style.background = '#e5e7eb';
                }
              }}
            >
              All Listings
            </button>
            <button
              onClick={() => setSelectedCategory('featured')}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.5rem',
                background: selectedCategory === 'featured'
                  ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                  : '#e5e7eb',
                color: selectedCategory === 'featured' ? 'white' : '#374151',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== 'featured') {
                  e.target.style.background = '#d1d5db';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== 'featured') {
                  e.target.style.background = '#e5e7eb';
                }
              }}
            >
              ⭐ Featured
            </button>
            <button
              onClick={() => setSelectedCategory('Jobs')}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.5rem',
                background: selectedCategory === 'Jobs'
                  ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                  : '#e5e7eb',
                color: selectedCategory === 'Jobs' ? 'white' : '#374151',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== 'Jobs') {
                  e.target.style.background = '#d1d5db';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== 'Jobs') {
                  e.target.style.background = '#e5e7eb';
                }
              }}
            >
              💼 Jobs
            </button>
            <button
              onClick={() => setSelectedCategory('Services')}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.5rem',
                background: selectedCategory === 'Services'
                  ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                  : '#e5e7eb',
                color: selectedCategory === 'Services' ? 'white' : '#374151',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== 'Services') {
                  e.target.style.background = '#d1d5db';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== 'Services') {
                  e.target.style.background = '#e5e7eb';
                }
              }}
            >
              🔧 Services
            </button>
            <button
              onClick={() => setSelectedCategory('For Sale')}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.5rem',
                background: selectedCategory === 'For Sale'
                  ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                  : '#e5e7eb',
                color: selectedCategory === 'For Sale' ? 'white' : '#374151',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== 'For Sale') {
                  e.target.style.background = '#d1d5db';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== 'For Sale') {
                  e.target.style.background = '#e5e7eb';
                }
              }}
            >
              💰 For Sale
            </button>
          </div>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="btn-link text-xs"
              style={{ marginTop: '0.5rem' }}
            >
              Clear Filter
            </button>
          )}
        </div>

        {locations.length > 0 && (
          <div style={{ padding: '1rem', backgroundColor: 'var(--background-secondary)', borderRadius: '8px' }}>
            <h3 className="heading heading-sm">📍 Filter by Location</h3>
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => setSelectedLocation('all')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  background: selectedLocation === 'all'
                    ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                    : '#e5e7eb',
                  color: selectedLocation === 'all' ? 'white' : '#374151',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => {
                  if (selectedLocation !== 'all') {
                    e.target.style.background = '#d1d5db';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedLocation !== 'all') {
                    e.target.style.background = '#e5e7eb';
                  }
                }}
              >
                All Locations
              </button>
              {locations.slice(0, 10).map((location, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedLocation(location)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    background: selectedLocation === location
                      ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                      : '#e5e7eb',
                    color: selectedLocation === location ? 'white' : '#374151',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontSize: '0.875rem'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedLocation !== location) {
                      e.target.style.background = '#d1d5db';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedLocation !== location) {
                      e.target.style.background = '#e5e7eb';
                    }
                  }}
                >
                  {location}
                </button>
              ))}
            </div>
            {selectedLocation !== 'all' && (
              <button
                onClick={() => setSelectedLocation('all')}
                className="btn-link text-xs"
                style={{ marginTop: '0.5rem' }}
              >
                Clear Location Filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Middle Column - All Listings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        <div>
          <h1 className="heading heading-lg">List Jobs, Offer Services, Sell Businesses</h1>
          <p className="text text-base text-secondary" style={{ marginTop: '0.5rem' }}>Cost: $5 per listing</p>
        </div>

        {selectedCategory === 'all' && (
          <>
            {renderCategorySection('Featured', featuredListings, '⭐')}
            {renderCategorySection('Jobs', jobsListings, '💼')}
            {renderCategorySection('Services', servicesListings, '🔧')}
            {renderCategorySection('For Sale', forSaleListings, '💰')}
          </>
        )}

        {selectedCategory === 'featured' && renderCategorySection('Featured', featuredListings, '⭐')}
        {selectedCategory === 'Jobs' && renderCategorySection('Jobs', jobsListings, '💼')}
        {selectedCategory === 'Services' && renderCategorySection('Services', servicesListings, '🔧')}
        {selectedCategory === 'For Sale' && renderCategorySection('For Sale', forSaleListings, '💰')}

        {filteredListings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <p className="text text-base text-secondary">
              {(() => {
                if (selectedCategory === 'all' && selectedLocation === 'all') {
                  return 'No listings found. Be the first to create one!';
                }

                let message = 'No ';

                if (selectedCategory !== 'all') {
                  message += selectedCategory === 'featured' ? 'featured ' : selectedCategory.toLowerCase() + ' ';
                }

                if (selectedLocation !== 'all') {
                  message += selectedCategory !== 'all' ? 'in ' : '';
                  message += selectedLocation + ' ';
                }

                return message.trim() + ' listings found.';
              })()}
            </p>
          </div>
        )}
      </div>

      {/* Right Column */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'sticky',
        top: '1rem',
        height: 'fit-content'
      }}>
        {featuredUsers.length > 0 && (
          <div style={{ padding: '1rem', backgroundColor: 'var(--background-secondary)', borderRadius: '8px' }}>
            <h3 className="heading heading-sm">⭐ Featured Users</h3>
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {featuredUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/user/${user.username}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#ffffff',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.15s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 className="heading heading-xs" style={{ margin: 0, color: '#111827' }}>
                          {user.name || 'Anonymous'}
                        </h4>
                        {user.sub_heading && (
                          <p className="text text-xs text-secondary" style={{ margin: '0.25rem 0 0 0' }}>
                            {user.sub_heading.length > 30 ? user.sub_heading.substring(0, 30) + '...' : user.sub_heading}
                          </p>
                        )}
                        {user.listing_count && (
                          <p className="text text-xs" style={{ margin: '0.25rem 0 0 0', color: '#6366f1' }}>
                            {user.listing_count} {user.listing_count === 1 ? 'listing' : 'listings'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
