'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/context/AuthContext';
import axios from '../../src/lib/axios';

export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reportedListings, setReportedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!authLoading && user && !user.is_admin) {
      router.push('/');
      return;
    }

    if (user?.is_admin) {
      fetchReportedListings();
    }
  }, [user, authLoading, router]);

  const fetchReportedListings = async () => {
    try {
      const response = await axios.get('/api/admin/reported-listings');
      setReportedListings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch reported listings:', error);
      setLoading(false);
    }
  };

  const handleDismiss = async (reportId) => {
    if (!confirm('Are you sure you want to dismiss this report?')) {
      return;
    }

    try {
      await axios.post(`/api/admin/reports/${reportId}/dismiss`);
      fetchReportedListings();
    } catch (error) {
      console.error('Failed to dismiss report:', error);
      alert(error.response?.data?.error || 'Failed to dismiss report');
    }
  };

  const handleRemoveListing = async (listingId) => {
    if (!confirm('Are you sure you want to remove this listing? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/listings/${listingId}`);
      alert('Listing removed successfully');
      fetchReportedListings();
    } catch (error) {
      console.error('Failed to remove listing:', error);
      alert(error.response?.data?.error || 'Failed to remove listing');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container" style={{ maxWidth: '72rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <h1 className="heading heading-xl">Loading...</h1>
      </div>
    );
  }

  if (!user?.is_admin) {
    return (
      <div className="container" style={{ maxWidth: '72rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <h1 className="heading heading-xl">Access Denied</h1>
        <p>You need admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '72rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <h1 className="heading heading-xl">Admin Panel</h1>

        {reportedListings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <p className="text text-base text-secondary">No reported listings at this time.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {reportedListings.map((report) => (
              <div key={report.id} className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 className="heading heading-lg">{report.title}</h3>
                      <p className="text text-base text-secondary" style={{ marginTop: '0.25rem' }}>
                        Category: {report.category} | Location: {report.location || 'Not specified'}
                      </p>
                    </div>
                    <span className="badge badge-warning">
                      {report.report_count > 0 ? report.report_count : 1} Report(s)
                    </span>
                  </div>

                  <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                    <div>
                      <strong>Reported by:</strong> {report.reporter_name} (@{report.reporter_username || 'N/A'})<br />
                      <strong>Reason:</strong> {report.reason || 'No reason provided'}<br />
                      <strong>Reported on:</strong> {new Date(report.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
                    <div>
                      <strong>Listing Owner:</strong> {report.owner_name} (@{report.owner_username || 'N/A'})<br />
                      <strong>Listing Created:</strong> {new Date(report.listing_created).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <h4 className="heading heading-md">Listing Description:</h4>
                    <p className="text text-base">{report.description}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-error"
                      onClick={() => handleRemoveListing(report.listing_id)}
                    >
                      Remove Listing
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleDismiss(report.id)}
                    >
                      Dismiss Report
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
