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

// Verify and fix missed token purchases
router.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
    const stripeInstance = getStripe();
    if (!stripeInstance) {
      return res.status(500).json({ error: 'Payment service not configured' });
    }

    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);

    // Verify payment belongs to this user
    if (paymentIntent.metadata.userId !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Payment intent does not belong to this user' });
    }

    // Verify payment was successful
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        error: 'Payment not completed',
        status: paymentIntent.status
      });
    }

    // Check if this is a token purchase
    if (paymentIntent.metadata.type !== 'token_purchase') {
      return res.status(400).json({ error: 'This payment is not a token purchase' });
    }

    // Check if tokens were already credited
    const existingTx = await db.query(
      'SELECT id FROM token_transactions WHERE stripe_payment_intent_id = $1',
      [paymentIntentId]
    );

    if (existingTx.rows.length > 0) {
      return res.json({
        message: 'Tokens already credited for this payment',
        tokens: parseInt(paymentIntent.metadata.tokens) || 0
      });
    }

    // Credit the tokens
    const tokensToAdd = parseInt(paymentIntent.metadata.tokens) || 0;
    if (tokensToAdd <= 0) {
      return res.status(400).json({ error: 'Invalid token amount in payment intent' });
    }

    await db.query('UPDATE users SET tokens = tokens + $1 WHERE id = $2', [tokensToAdd, req.user.id]);

    // Create token transaction record
    await db.query(`
      INSERT INTO token_transactions (user_id, type, amount, description, stripe_payment_intent_id)
      VALUES ($1, $2, $3, $4, $5)
    `, [req.user.id, 'purchase', tokensToAdd, `Purchased ${tokensToAdd} tokens (manually verified)`, paymentIntentId]);

    // Get updated balance
    const balanceResult = await db.query('SELECT tokens FROM users WHERE id = $1', [req.user.id]);
    const newBalance = balanceResult.rows[0].tokens || 0;

    // Send purchase confirmation email
    try {
      const userResult = await db.query('SELECT email FROM users WHERE id = $1', [req.user.id]);
      const userEmail = userResult.rows[0]?.email;

      if (userEmail) {
        const { sendPurchaseConfirmationEmail } = await import('../utils/email.js');
        const amountInDollars = tokensToAdd; // 1 token = $1
        await sendPurchaseConfirmationEmail(userEmail, tokensToAdd, amountInDollars, paymentIntentId);
        console.log(`✓ Purchase confirmation email sent to ${userEmail}`);
      }
    } catch (emailError) {
      // Log email error but don't fail the token credit
      console.error('Failed to send purchase confirmation email:', emailError);
      logError('Purchase confirmation email failed', emailError, { userId: req.user?.id });
    }

    res.json({
      message: `Successfully credited ${tokensToAdd} tokens`,
      tokensCredited: tokensToAdd,
      newBalance
    });
  } catch (error) {
    if (error.type === 'StripeInvalidRequestError' && error.code === 'resource_missing') {
      return res.status(404).json({ error: 'Payment intent not found' });
    }
    logError('POST /verify-payment', error, { userId: req.user?.id, paymentIntentId: req.body?.paymentIntentId });
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

export { router as tokenRoutes };
