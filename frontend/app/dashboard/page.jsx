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
  const [activeTab, setActiveTab] = useState('listings');

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
          </div>
        </div>
      </div>
    </div>
  );
}
