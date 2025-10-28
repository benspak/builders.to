import express from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import db from '../database/db.js';

const router = express.Router();

// Stricter rate limiting for listing creation to prevent spam
const createListingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 listings per 15 minutes
  message: 'Too many listings created. Please wait 15 minutes before posting again.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Get all listings
router.get('/', async (req, res) => {
  try {
    const { location, category, featured } = req.query;

    let query = 'SELECT * FROM listings WHERE (payment_status = $1 OR payment_status = $2)';
    const params = ['paid', 'featured'];

    if (featured === 'true') {
      query += ' AND is_featured = 1';
    } else if (location) {
      query += ' AND location = $' + (params.length + 1);
      params.push(location);
    } else if (category) {
      query += ' AND category = $' + (params.length + 1);
      params.push(category);
    }

    query += ' ORDER BY is_featured DESC, created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching listings:', error);
    } else {
      console.error('Error fetching listings');
    }
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get listing by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM listings WHERE id = $1', [req.params.id]);
    const listing = result.rows[0];

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check if listing is visible - handle both old and new schema
    let isVisible;
    if ('payment_status' in listing) {
      isVisible = listing.payment_status === 'paid' || listing.payment_status === 'featured';
    } else {
      // Fallback: if neither column exists, make it visible
      isVisible = true;
    }

    // Check if user is authenticated and is the owner
    let isOwner = false;
    if (req.user) {
      isOwner = listing.user_id === req.user.id;
    }

    if (!isOwner && !isVisible) {
      return res.status(403).json({ error: 'This listing is not yet published. Payment required.' });
    }

    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create listing
router.post('/', authenticateToken, createListingLimiter, async (req, res) => {
  try {
    const { category, title, location, description } = req.body;

    if (!category || !title || !description) {
      return res.status(400).json({ error: 'Category, title, and description are required' });
    }

    // Check for duplicate posts from the same user
    // Look for similar listings by the same user in the last 24 hours
    const existingResult = await db.query(`
      SELECT * FROM listings
      WHERE user_id = $1
        AND title = $2
        AND description = $3
        AND created_at > NOW() - INTERVAL '24 hours'
    `, [req.user.id, title, description]);

    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        error: 'Duplicate listing detected. You cannot post the same listing within 24 hours.'
      });
    }

    // Additional check: Look for any exact match in the last 7 days
    const similarResult = await db.query(`
      SELECT * FROM listings
      WHERE user_id = $1
        AND title = $2
        AND created_at > NOW() - INTERVAL '7 days'
    `, [req.user.id, title]);

    if (similarResult.rows.length > 0) {
      return res.status(409).json({
        error: 'You have already posted a similar listing. Please wait or modify your post.'
      });
    }

    const result = await db.query(`
      INSERT INTO listings (user_id, category, title, location, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [req.user.id, category, title, location, description]);

    res.status(201).json({ message: 'Listing created successfully', id: result.rows[0].id });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating listing:', error);
    } else {
      console.error('Error creating listing');
    }
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update listing
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { category, title, location, description } = req.body;

    // Check if listing belongs to user
    const result = await db.query(
      'SELECT * FROM listings WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found or unauthorized' });
    }

    const listing = result.rows[0];

    // Only allow editing of pending listings (not paid or featured)
    let isPaid = false;
    if ('payment_status' in listing) {
      isPaid = listing.payment_status !== 'pending';
    }

    if (isPaid) {
      return res.status(400).json({
        error: 'Cannot edit a listing that has already been paid. Only pending listings can be edited.'
      });
    }

    await db.query(`
      UPDATE listings SET
        category = $1, title = $2, location = $3, description = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
    `, [category, title, location, description, req.params.id]);

    res.json({ message: 'Listing updated successfully' });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating listing:', error);
    } else {
      console.error('Error updating listing');
    }
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Delete listing
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const listingResult = await db.query(
      'SELECT * FROM listings WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found or unauthorized' });
    }

    await db.query('DELETE FROM listings WHERE id = $1', [req.params.id]);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's listings
router.get('/user/my-listings', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM listings WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get listings by user_id (public)
router.get('/user/:userId', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM listings
      WHERE user_id = $1 AND (payment_status = 'paid' OR payment_status = 'featured')
      ORDER BY created_at DESC
    `, [req.params.userId]);

    res.json(result.rows);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching user listings:', error);
    } else {
      console.error('Error fetching user listings');
    }
    res.status(500).json({ error: 'Server error' });
  }
});

export { router as listingRoutes };
