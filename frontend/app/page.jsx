'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from '../src/lib/axios';
import { stripHtml } from '../src/components/RichTextEditor';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchListings();
  }, []);

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

  // Segment listings by category
  const featuredListings = listings.filter(l => l.is_featured);
  const servicesListings = listings.filter(l => l.category === 'Services' && !l.is_featured);
  const jobsListings = listings.filter(l => l.category === 'Jobs' && !l.is_featured);
  const forSaleListings = listings.filter(l => l.category === 'For Sale' && !l.is_featured);

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
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        <div>
          <h1 className="heading heading-lg">List Jobs, Offer Services, Sell Businesses</h1>
          <p className="text text-base text-secondary" style={{ marginTop: '0.5rem' }}>Cost: $5 per listing</p>
        </div>

        {renderCategorySection('Featured', featuredListings, '⭐')}
        {renderCategorySection('Jobs', jobsListings, '💼')}
        {renderCategorySection('Services', servicesListings, '🔧')}
        {renderCategorySection('For Sale', forSaleListings, '💰')}

        {listings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <p className="text text-base text-secondary">No listings found. Be the first to create one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
