import express from 'express';
import Stripe from 'stripe';
import { authenticateToken } from '../middleware/auth.js';
import db from '../database/db.js';

const router = express.Router();

// Initialize Stripe with error handling
let stripe;

// Lazy initialization function
const getStripe = () => {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    try {
      console.log('✓ Initializing Stripe...');
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      console.log('✓ Stripe initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Stripe:', error.message);
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
    const listing = db.prepare('SELECT * FROM listings WHERE id = ? AND user_id = ?').get(listingId, req.user.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found or unauthorized' });
    }

    // Check if already paid
    if (listing.payment_status === 'paid' || listing.payment_status === 'featured') {
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
    console.error('Error creating listing payment:', error);
    res.status(500).json({ error: error.message || 'Server error' });
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
    const listing = db.prepare('SELECT * FROM listings WHERE id = ? AND user_id = ?').get(listingId, req.user.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found or unauthorized' });
    }

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
    console.error('Error creating featured payment:', error);
    res.status(500).json({ error: error.message || 'Server error' });
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
      console.log('Webhook received without verification (development mode)');
      event = req.body;
    }

    handleWebhookEvent(event);
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

const handleWebhookEvent = (event) => {
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { listingId, userId, type } = paymentIntent.metadata;

    if (type === 'listing') {
      // Mark listing as paid
      db.prepare('UPDATE listings SET payment_status = ? WHERE id = ?').run('paid', listingId);

      // Create transaction record
      db.prepare(`
        INSERT INTO transactions (user_id, listing_id, type, amount, stripe_payment_intent_id, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, listingId, 'listing', 5.00, paymentIntent.id, 'completed');
    } else if (type === 'feature') {
      // Mark listing as featured
      db.prepare('UPDATE listings SET is_featured = 1, payment_status = ? WHERE id = ?').run('featured', listingId);

      // Create transaction record
      db.prepare(`
        INSERT INTO transactions (user_id, listing_id, type, amount, stripe_payment_intent_id, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, listingId, 'feature', 50.00, paymentIntent.id, 'completed');
    }
  }
};

export { router as paymentRoutes, webhookRouter };
