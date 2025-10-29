import express from 'express';
import Stripe from 'stripe';
import { authenticateToken } from '../middleware/auth.js';
import db from '../database/db.js';
import { logError } from '../utils/errorLogger.js';

const router = express.Router();

// Initialize Stripe with error handling
let stripe;

// Lazy initialization function
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

// Create payment intent for listing
router.post('/create-listing-payment', authenticateToken, async (req, res) => {
  try {
    const stripeInstance = getStripe();
    if (!stripeInstance) {
      console.error('Stripe not initialized - check STRIPE_SECRET_KEY');
      return res.status(500).json({ error: 'Payment service not configured' });
    }

    const { listingId } = req.body;

    if (!listingId) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    // Check if listing exists and belongs to user
    const result = await db.query(
      'SELECT * FROM listings WHERE id = $1 AND user_id = $2',
      [listingId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found or unauthorized' });
    }

    const listing = result.rows[0];

    // Check if already paid
    const alreadyPaid = listing.payment_status === 'paid' || listing.payment_status === 'featured';

    if (alreadyPaid) {
      return res.status(400).json({ error: 'Listing already paid' });
    }

    const amount = 500; // $5 in cents

    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { listingId, userId: req.user.id, type: 'listing' }
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error) {
    logError('POST /create-listing-payment', error, { listingId: req.body.listingId, userId: req.user?.id });
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Create payment intent for featured listing
router.post('/create-featured-payment', authenticateToken, async (req, res) => {
  try {
    const stripeInstance = getStripe();
    if (!stripeInstance) {
      console.error('Stripe not initialized - check STRIPE_SECRET_KEY');
      return res.status(500).json({ error: 'Payment service not configured' });
    }

    const { listingId } = req.body;

    if (!listingId) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    // Check if listing exists and belongs to user
    const result = await db.query(
      'SELECT * FROM listings WHERE id = $1 AND user_id = $2',
      [listingId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found or unauthorized' });
    }

    const listing = result.rows[0];

    // Prevent double payment for featured
    if (listing.is_featured) {
      return res.status(400).json({ error: 'Listing is already featured' });
    }

    const amount = 5000; // $50 in cents

    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { listingId, userId: req.user.id, type: 'feature' }
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error) {
    logError('POST /create-featured-payment', error, { listingId: req.body.listingId, userId: req.user?.id });
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Webhook handler for Stripe (needs special middleware)
const webhookRouter = express.Router();
webhookRouter.use(express.raw({ type: 'application/json' }));

webhookRouter.post('/', async (req, res) => {
  const stripeInstance = getStripe();
  if (!stripeInstance) {
    console.error('Stripe not initialized - webhook handler unavailable');
    return res.status(503).send('Payment service not configured');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      // In development, accept webhooks without verification
      if (process.env.NODE_ENV === 'development') {
        console.log('Webhook received without verification (development mode)');
      }
      event = req.body;
    }

    await handleWebhookEvent(event);
    res.json({ received: true });
  } catch (err) {
    logError('POST /webhook', err);
    return res.status(400).send('Webhook Error');
  }
});

const handleWebhookEvent = async (event) => {
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { listingId, userId, type, tokens } = paymentIntent.metadata;

    if (type === 'token_purchase') {
      // Add tokens to user account
      const tokensToAdd = parseInt(tokens) || 0;
      await db.query('UPDATE users SET tokens = tokens + $1 WHERE id = $2', [tokensToAdd, userId]);

      // Create token transaction record
      await db.query(`
        INSERT INTO token_transactions (user_id, type, amount, description, stripe_payment_intent_id)
        VALUES ($1, $2, $3, $4, $5)
      `, [userId, 'purchase', tokensToAdd, `Purchased ${tokensToAdd} tokens`, paymentIntent.id]);
    } else if (type === 'listing') {
      // Mark listing as paid
      await db.query('UPDATE listings SET payment_status = $1 WHERE id = $2', ['paid', listingId]);

      // Create transaction record
      await db.query(`
        INSERT INTO transactions (user_id, listing_id, type, amount, stripe_payment_intent_id, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [userId, listingId, 'listing', 5.00, paymentIntent.id, 'completed']);
    } else if (type === 'feature') {
      // Mark listing as featured
      await db.query(
        'UPDATE listings SET is_featured = 1, payment_status = $1 WHERE id = $2',
        ['featured', listingId]
      );

      // Create transaction record
      await db.query(`
        INSERT INTO transactions (user_id, listing_id, type, amount, stripe_payment_intent_id, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [userId, listingId, 'feature', 50.00, paymentIntent.id, 'completed']);
    }
  }
};

export { router as paymentRoutes, webhookRouter };
