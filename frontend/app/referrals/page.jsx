'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/context/AuthContext';
import axios from '../../src/lib/axios';

export default function Referrals() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState({ totalReferrals: 0, rewardedReferrals: 0 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchReferralCode();
      fetchStats();
    }
  }, [user]);

  const fetchReferralCode = async () => {
    try {
      const response = await axios.get('/api/referrals/code');
      setReferralCode(response.data.referralCode);
    } catch (error) {
      console.error('Failed to fetch referral code:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/referrals/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="container" style={{ maxWidth: '48rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <h1 className="heading heading-lg">Referral Program</h1>
          <p className="text text-base text-secondary" style={{ marginTop: '0.5rem' }}>
            Refer a paying customer and get 1 free post (5 tokens)!
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h2 className="heading heading-md">Your Referral Code</h2>
          <div style={{ marginTop: '1rem' }}>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <code style={{ fontSize: '1.5rem', fontWeight: 'bold', flex: 1 }}>
                {referralCode || 'Loading...'}
              </code>
              <button
                onClick={copyReferralLink}
                className="btn btn-secondary"
                style={{ whiteSpace: 'nowrap' }}
              >
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
            <p className="text text-sm text-secondary">
              Share your referral link: <code>{window.location.origin}/register?ref={referralCode}</code>
            </p>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h2 className="heading heading-md">Referral Statistics</h2>
          {loading ? (
            <p className="text text-base" style={{ marginTop: '1rem' }}>Loading...</p>
          ) : (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <p className="text text-sm text-secondary">Total Referrals</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.25rem' }}>
                  {stats.totalReferrals}
                </p>
              </div>
              <div>
                <p className="text text-sm text-secondary">Rewarded Referrals</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.25rem', color: 'var(--color-success)' }}>
                  {stats.rewardedReferrals}
                </p>
              </div>
              <div>
                <p className="text text-sm text-secondary">Tokens Earned</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.25rem', color: 'var(--color-primary)' }}>
                  {stats.rewardedReferrals * 5}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--color-info-bg)' }}>
          <h3 className="heading heading-sm">How It Works</h3>
          <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
            <li className="text text-base" style={{ marginBottom: '0.5rem' }}>
              Share your referral link with friends and colleagues
            </li>
            <li className="text text-base" style={{ marginBottom: '0.5rem' }}>
              When someone signs up with your referral code and makes their first purchase, you get 5 tokens (1 free post)
            </li>
            <li className="text text-base" style={{ marginBottom: '0.5rem' }}>
              No limit on referrals - refer as many people as you want!
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
