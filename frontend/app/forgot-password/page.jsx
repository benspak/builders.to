'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '../../src/lib/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '28rem', paddingTop: '5rem', paddingBottom: '5rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h1 className="heading heading-lg">Reset Your Password</h1>

          {success ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="alert alert-success">
                <span style={{ fontSize: '1.25rem' }}>✓</span>
                Check your email for password reset instructions. If you don&apos;t see it, check your spam folder.
              </div>
              <Link href="/login" className="btn btn-primary btn-full">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="alert alert-error">
                  <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                  {error}
                </div>
              )}

              <p className="text text-sm">Enter your email address and we&apos;ll send you a link to reset your password.</p>

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-control">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p className="text text-sm" style={{ textAlign: 'center' }}>
                  Remember your password?{' '}
                  <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Back to Login</Link>
                </p>
                <p className="text text-sm" style={{ textAlign: 'center' }}>
                  Don&apos;t have an account?{' '}
                  <Link href="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign up</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
