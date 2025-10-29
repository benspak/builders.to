import express from 'express';
import Stripe from 'stripe';
import { authenticateToken } from '../middleware/auth.js';
import db from '../database/db.js';
import { logError } from '../utils/errorLogger.js';

const router = express.Router();

// Initialize Stripe with error handling
let stripe;

const getStripe = () => {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('✓ Initializing Stripe...');
      }
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      if (process.env.NODE_ENV === 'development') {
        console.log('✓ Stripe initialized successfully');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Stripe');
    }
  } else if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️  STRIPE_SECRET_KEY not set. Payment features will not work.');
  }
  return stripe;
};

// Get user's token balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT tokens FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ tokens: result.rows[0].tokens || 0 });
  } catch (error) {
    logError('GET /balance', error, { userId: req.user?.id });
    res.status(500).json({ error: 'Failed to get token balance' });
  }
});

// Get user's token transactions
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM token_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    logError('GET /transactions', error, { userId: req.user?.id });
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Create payment intent for purchasing tokens
router.post('/purchase', authenticateToken, async (req, res) => {
  try {
    const stripeInstance = getStripe();
    if (!stripeInstance) {
      return res.status(500).json({ error: 'Payment service not configured' });
    }

    const { amount } = req.body; // amount in tokens

    if (!amount || amount < 1 || amount > 1000) {
      return res.status(400).json({ error: 'Amount must be between 1 and 1000 tokens' });
    }

    // 1 token = $1
    const amountInCents = amount * 100;

    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        userId: req.user.id,
        type: 'token_purchase',
        tokens: amount.toString()
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error) {
    logError('POST /purchase', error, { userId: req.user?.id });
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

export { router as tokenRoutes };
