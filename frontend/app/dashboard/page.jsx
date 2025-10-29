'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../src/context/AuthContext';
import axios from '../../src/lib/axios';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('listings');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [dashboardResponse, savedResponse, contactsResponse] = await Promise.all([
        axios.get('/api/dashboard'),
        axios.get('/api/listings/user/saved'),
        axios.get('/api/listings/contacts/received')
      ]);
      setListings(dashboardResponse.data.listings);
      setTransactions(dashboardResponse.data.transactions);
      setSavedListings(savedResponse.data);
      setContactRequests(contactsResponse.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const handleDismiss = async (contactId) => {
    try {
      await axios.put(`/api/listings/contacts/${contactId}/dismiss`);
      // Remove the dismissed contact from the list
      setContactRequests(prev => prev.filter(req => req.id !== contactId));
    } catch (error) {
      console.error('Failed to dismiss contact request:', error);
    }
  };

  const handleUnsave = async (listingId) => {
    try {
      await axios.post(`/api/listings/${listingId}/save`);
      // Remove the unsaved listing from the list
      setSavedListings(prev => prev.filter(listing => listing.id !== listingId));
    } catch (error) {
      console.error('Failed to unsave listing:', error);
      alert('Failed to unsave listing. Please try again.');
    }
  };

  if (authLoading) {
    return (
      <div className="container" style={{ maxWidth: '72rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <h1 className="heading heading-xl">Loading...</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ maxWidth: '72rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <h1 className="heading heading-xl">Please login to view your dashboard</h1>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '72rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <h1 className="heading heading-xl">Dashboard</h1>

        <div className="tabs">
          <div className="tab-list">
            <button
              className={`tab ${activeTab === 'listings' ? 'active' : ''}`}
              onClick={() => setActiveTab('listings')}
            >
              My Listings
            </button>
            <button
              className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions')}
            >
              Transactions
            </button>
            <button
              className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              Saved Listings
            </button>
            <button
              className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              Messages {contactRequests.filter(c => c.status === 'pending').length > 0 && `(${contactRequests.filter(c => c.status === 'pending').length})`}
            </button>
          </div>

          <div>
            {activeTab === 'listings' && (
              <div>
                {listings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <p className="text text-base text-secondary">No listings yet.</p>
                    <Link href="/create-listing">
                      <button className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        Create Your First Listing
                      </button>
                    </Link>
                  </div>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Featured</th>
                        <th>Views</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map(listing => (
                        <tr key={listing.id}>
                          <td>
                            <Link href={`/listing/${listing.slug}`}>{listing.title}</Link>
                          </td>
                          <td><span className="badge badge-primary">{listing.category}</span></td>
                          <td>
                            <span className={`badge ${listing.payment_status === 'paid' || listing.payment_status === 'featured' ? 'badge-success' : 'badge-warning'}`}>
                              {listing.payment_status}
                            </span>
                          </td>
                          <td>{listing.is_featured ? '⭐' : '-'}</td>
                          <td>{listing.view_count || 0}</td>
                          <td>{new Date(listing.created_at).toLocaleDateString()}</td>
                          <td>
                            <Link href={`/listing/${listing.slug}`}>
                              <button className="btn btn-sm">View</button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'transactions' && (
              <div>
                {transactions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <p className="text text-base text-secondary">No transactions yet.</p>
                  </div>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(transaction => (
                        <tr key={transaction.id}>
                          <td>{new Date(transaction.created_at).toLocaleDateString()}</td>
                          <td><span className="badge badge-primary">{transaction.type}</span></td>
                          <td>${transaction.amount}</td>
                          <td>
                            <span className={`badge ${
                              transaction.status === 'completed' ? 'badge-success' :
                              transaction.status === 'failed' ? 'badge-error' : 'badge-warning'
                            }`}>
                              {transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'saved' && (
              <div>
                {savedListings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <p className="text text-base text-secondary">No saved listings yet.</p>
                    <Link href="/">
                      <button className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        Browse Listings
                      </button>
                    </Link>
                  </div>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Location</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedListings.map(listing => (
                        <tr key={listing.id}>
                          <td>
                            <Link href={`/listing/${listing.slug}`}>{listing.title}</Link>
                          </td>
                          <td><span className="badge badge-primary">{listing.category}</span></td>
                          <td>{listing.location || '-'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <Link href={`/listing/${listing.slug}`}>
                                <button className="btn btn-sm">View</button>
                              </Link>
                              <button className="btn btn-sm btn-outline" onClick={() => handleUnsave(listing.id)}>
                                Unsave
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'messages' && (
              <div>
                {contactRequests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <p className="text text-base text-secondary">No messages yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {contactRequests.map(request => (
                      <div key={request.id} className="card">
                        <div className="card-body">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                              <h3 className="heading heading-sm">
                                <Link href={`/listing/${request.listing_slug}`}>{request.listing_title}</Link>
                              </h3>
                              <span className="badge badge-primary" style={{ marginTop: '0.5rem' }}>{request.listing_category}</span>
                            </div>
                            {request.status === 'pending' && (
                              <span className="badge badge-warning">New</span>
                            )}
                          </div>
                          <div style={{ marginBottom: '0.75rem' }}>
                            <p className="text text-sm"><strong>From:</strong> {request.sender_name} ({request.sender_email})</p>
                            <p className="text text-sm text-secondary">{new Date(request.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="divider" />
                          <p className="text text-base" style={{ marginTop: '0.75rem', whiteSpace: 'pre-wrap' }}>{request.message}</p>
                          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleDismiss(request.id)}
                              className="btn btn-sm"
                              style={{ marginLeft: 'auto' }}
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
