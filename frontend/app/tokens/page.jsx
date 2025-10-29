'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/context/AuthContext';
import axios from '../../src/lib/axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../../src/components/CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function Tokens() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(25); // Default 25 tokens ($25)
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchBalance();
      fetchTransactions();
    }
  }, [user]);

  const fetchBalance = async () => {
    try {
      const response = await axios.get('/api/tokens/balance');
      setBalance(response.data.tokens);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/tokens/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiatePurchase = async (e) => {
    e.preventDefault();
    setPurchasing(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/tokens/purchase', {
        amount: purchaseAmount
      });

      setClientSecret(response.data.clientSecret);
      setShowPaymentForm(true);
      setPurchasing(false);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to initialize purchase');
      setPurchasing(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setClientSecret('');
    setSuccess(`Successfully purchased ${purchaseAmount} tokens!`);
    setPurchaseAmount(25);
    fetchBalance();
    fetchTransactions();
    // Clear success message after 5 seconds
    setTimeout(() => setSuccess(''), 5000);
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setClientSecret('');
  };

  if (authLoading || !user) {
    return null;
  }

  // Show payment form when clientSecret is set
  if (showPaymentForm && clientSecret) {
    return (
      <div className="container" style={{ maxWidth: '48rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            clientSecret={clientSecret}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </Elements>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '48rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <h1 className="heading heading-lg">Token Balance</h1>
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
              {balance} Tokens
            </p>
            <p className="text text-sm text-secondary" style={{ marginTop: '0.5rem' }}>
              1 Token = $1 | 1 Post = 5 Tokens
            </p>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h2 className="heading heading-md">Purchase Tokens</h2>
          <p className="text text-base text-secondary" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Buy tokens to create listings. Get 1 free post for every 5 posts you purchase!
          </p>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.25rem' }}>⚠️</span>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.25rem' }}>✓</span>
              {success}
            </div>
          )}

          <form onSubmit={handleInitiatePurchase}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-control">
                <label className="form-label">Amount (tokens)</label>
                <select
                  className="form-select"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(parseInt(e.target.value))}
                  required
                  disabled={purchasing}
                >
                  <option value={5}>5 tokens - $5</option>
                  <option value={10}>10 tokens - $10</option>
                  <option value={25}>25 tokens - $25</option>
                  <option value={50}>50 tokens - $50</option>
                  <option value={100}>100 tokens - $100</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={purchasing || showPaymentForm}
              >
                {purchasing ? 'Processing...' : `Purchase ${purchaseAmount} Tokens ($${purchaseAmount})`}
              </button>
            </div>
          </form>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h2 className="heading heading-md">Transaction History</h2>
          {loading ? (
            <p className="text text-base" style={{ marginTop: '1rem' }}>Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text text-base text-secondary" style={{ marginTop: '1rem' }}>
              No transactions yet
            </p>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0' }}>Type</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0' }}>Amount</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0' }}>Description</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.75rem 0' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          backgroundColor: tx.type === 'purchase' || tx.type === 'reward' || tx.type === 'refund'
                            ? 'var(--color-success-bg)'
                            : 'var(--color-error-bg)',
                          color: tx.type === 'purchase' || tx.type === 'reward' || tx.type === 'refund'
                            ? 'var(--color-success)'
                            : 'var(--color-error)'
                        }}>
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0', fontWeight: tx.type === 'spent' ? 'normal' : 'bold' }}>
                        {tx.type === 'spent' ? '-' : '+'}{tx.amount} tokens
                      </td>
                      <td style={{ padding: '0.75rem 0' }}>{tx.description || '-'}</td>
                      <td style={{ padding: '0.75rem 0', color: 'var(--color-text-secondary)' }}>
                        {new Date(tx.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
