'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from '../../src/lib/axios';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('No reset token provided');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      setLoading(false);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '28rem', paddingTop: '5rem', paddingBottom: '5rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h1 className="heading heading-lg">Set New Password</h1>

          {success ? (
            <div className="alert alert-success">
              <span style={{ fontSize: '1.25rem' }}>✓</span>
              Password has been reset successfully! Redirecting to login...
            </div>
          ) : (
            <>
              {error && (
                <div className="alert alert-error">
                  <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-control">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="form-control">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={loading || !token}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>

              <p className="text text-sm" style={{ textAlign: 'center' }}>
                Remember your password?{' '}
                <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Back to Login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
