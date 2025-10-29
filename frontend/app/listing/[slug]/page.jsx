'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from '../../../src/lib/axios';
import { useAuth } from '../../../src/context/AuthContext';
import CheckoutForm from '../../../src/components/CheckoutForm';
import RichTextEditor, { RichTextDisplay } from '../../../src/components/RichTextEditor';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

export default function ListingDetail() {
  const params = useParams();
  const slug = params.slug;
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentType, setPaymentType] = useState('listing');
  const [editing, setEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    category: '',
    title: '',
    location: '',
    description: ''
  });
  const [reportReason, setReportReason] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchListing = async () => {
    try {
      const response = await axios.get(`/api/listings/${slug}`);
      setListing(response.data);
      setEditFormData({
        category: response.data.category,
        title: response.data.title,
        location: response.data.location || '',
        description: response.data.description
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch listing:', error);
      setLoading(false);
    }
  };

  const handlePay = async (type = 'listing') => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      setPaymentType(type);
      const endpoint = type === 'listing'
        ? '/api/payments/create-listing-payment'
        : '/api/payments/create-featured-payment';

      const response = await axios.post(endpoint, { listingId: listing.id });

      if (response.data.clientSecret) {
        setClientSecret(response.data.clientSecret);
        setShowPayment(true);
      } else {
        console.error('Failed to initialize payment');
        alert('Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create payment');
      const errorMessage = error.response?.data?.error || 'Failed to create payment. Please try again.';
      alert(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/listings/${listing.id}`);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to delete listing:', error);
      alert(error.response?.data?.error || 'Failed to delete listing');
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditFormData({
      category: listing.category,
      title: listing.title,
      location: listing.location || '',
      description: listing.description
    });
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`/api/listings/${listing.id}`, editFormData);
      await fetchListing();
      setEditing(false);
    } catch (error) {
      console.error('Failed to update listing:', error);
      alert(error.response?.data?.error || 'Failed to update listing');
    }
  };

  const handleReport = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      await axios.post(`/api/listings/${listing.id}/report`, { reason: reportReason });
      alert('Listing reported successfully');
      setShowReportModal(false);
      setReportReason('');
    } catch (error) {
      console.error('Failed to report listing:', error);
      alert(error.response?.data?.error || 'Failed to report listing');
    }
  };

  if (loading) {
    return <div className="container" style={{ maxWidth: '56rem', paddingTop: '2rem', paddingBottom: '2rem' }}>Loading...</div>;
  }

  if (!listing) {
    return <div className="container" style={{ maxWidth: '56rem', paddingTop: '2rem', paddingBottom: '2rem' }}>Listing not found</div>;
  }

  const isOwner = user && listing.user_id === user.id;

  return (
    <div className="container" style={{ maxWidth: '56rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
      {showPayment && clientSecret ? (
        <div>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              clientSecret={clientSecret}
              onSuccess={() => {
                setShowPayment(false);
                fetchListing();
                router.push('/dashboard');
              }}
              onCancel={() => setShowPayment(false)}
            />
          </Elements>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {listing.is_featured && <span className="badge badge-primary">Featured</span>}
                  <span className={`badge ${listing.category === 'Jobs' ? 'badge-primary' : listing.category === 'Services' ? 'badge-success' : 'badge-warning'}`}>
                    {listing.category}
                  </span>
                </div>
              </div>

              <h1 className="heading heading-xl" style={{ marginBottom: '0.5rem' }}>{listing.title}</h1>
              {listing.location && <p className="text text-base text-secondary" style={{ marginBottom: '1rem' }}>📍 {listing.location}</p>}

              <div style={{ marginBottom: '1rem' }}>
                <RichTextDisplay content={listing.description} />
              </div>

              <div className="divider" />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', color: 'var(--text-secondary-light)' }}>
                <span>Posted on {new Date(listing.created_at).toLocaleDateString()}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {listing.profile_username && (
                    <Link href={`/user/${listing.profile_username}`}>
                      <button className="btn-link btn-sm">
                        View Profile
                      </button>
                    </Link>
                  )}
                  {!isOwner && (
                    <button className="btn btn-sm btn-error btn-outline" onClick={() => setShowReportModal(true)}>
                      Report
                    </button>
                  )}
                </div>
              </div>

              {isOwner && listing.payment_status === 'pending' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  <div className="alert alert-warning">
                    <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                    <div>
                      <span>Payment required to publish this listing.</span>
                    </div>
                  </div>

                  {editing ? (
                    <div style={{ width: '100%', padding: '1rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="form-control">
                          <label className="form-label">Category</label>
                          <select
                            className="form-select"
                            value={editFormData.category}
                            onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                          >
                            <option value="Jobs">Jobs</option>
                            <option value="Services">Services</option>
                            <option value="For Sale">For Sale</option>
                          </select>
                        </div>

                        <div className="form-control">
                          <label className="form-label">Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={editFormData.title}
                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                            placeholder="Enter listing title"
                          />
                        </div>

                        <div className="form-control">
                          <label className="form-label">Location</label>
                          <input
                            type="text"
                            className="form-input"
                            value={editFormData.location}
                            onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                            placeholder="City, State"
                          />
                        </div>

                        <div className="form-control">
                          <label className="form-label">Description</label>
                          <RichTextEditor
                            value={editFormData.description}
                            onChange={(value) => setEditFormData({ ...editFormData, description: value })}
                            placeholder="Provide details about your listing"
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button className="btn btn-primary" onClick={handleSaveEdit}>
                            Save Changes
                          </button>
                          <button className="btn btn-outline" onClick={handleCancelEdit}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                      <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handlePay('listing')}>
                        Pay $5 to Publish
                      </button>
                      <button className="btn btn-outline" onClick={handleEdit}>
                        Edit
                      </button>
                      <button className="btn btn-error btn-outline" onClick={handleDelete}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}

              {isOwner && listing.payment_status === 'paid' && !listing.is_featured && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button className="btn btn-secondary" onClick={() => handlePay('feature')}>
                    Feature This Listing ($50)
                  </button>
                  <button className="btn btn-error btn-outline" onClick={handleDelete}>
                    Delete Listing
                  </button>
                </div>
              )}

              {isOwner && listing.payment_status === 'featured' && (
                <div style={{ marginTop: '1rem' }}>
                  <button className="btn btn-error btn-outline" onClick={handleDelete}>
                    Delete Listing
                  </button>
                </div>
              )}
            </div>
          </div>

          {showReportModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div className="card" style={{ maxWidth: '28rem', width: '90%' }}>
                <div className="card-body">
                  <h2 className="heading heading-lg">Report Listing</h2>
                  <p className="text text-base text-secondary">Please provide a reason for reporting this listing.</p>
                  <div className="form-control" style={{ marginTop: '1rem' }}>
                    <label className="form-label">Reason</label>
                    <textarea
                      className="form-input"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder="Enter the reason for reporting..."
                      rows={4}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button className="btn btn-primary" onClick={handleReport}>
                      Submit Report
                    </button>
                    <button className="btn btn-outline" onClick={() => { setShowReportModal(false); setReportReason(''); }}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
