'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/context/AuthContext';
import axios from '../../src/lib/axios';
import RichTextEditor from '../../src/components/RichTextEditor';

export default function CreateListing() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/listings', formData);
      const slug = response.data.slug;

      // Redirect to listing detail page
      router.push(`/listing/${slug}`);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create listing');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '42rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h1 className="heading heading-lg">Create New Listing</h1>
          <p className="text text-base text-secondary">
            Cost: $5 per listing. Featured listings (pinned to top) cost $50 extra.
          </p>

          {error && (
            <div className="alert alert-error">
              <span style={{ fontSize: '1.25rem' }}>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-control">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
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
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter listing title"
                  required
                />
              </div>

              <div className="form-control">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, State"
                />
              </div>

              <div className="form-control">
                <label className="form-label">Description</label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Provide details about your listing"
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Listing ($5)'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
