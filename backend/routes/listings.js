import express from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import db from '../database/db.js';
import { logError } from '../utils/errorLogger.js';
import { generateSlug } from '../utils/slug.js';

const router = express.Router();

// Report a listing
router.post('/:id/report', authenticateToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const listingId = req.params.id;

    // Check if listing exists
    const listingResult = await db.query('SELECT * FROM listings WHERE id = $1', [listingId]);
    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = listingResult.rows[0];

    // Prevent users from reporting their own listings
    if (listing.user_id === req.user.id) {
      return res.status(400).json({ error: 'You cannot report your own listing' });
    }

    // Check if user has already reported this listing
    const existingReport = await db.query(
      'SELECT * FROM listing_reports WHERE listing_id = $1 AND reporter_id = $2',
      [listingId, req.user.id]
    );

    if (existingReport.rows.length > 0) {
      return res.status(400).json({ error: 'You have already reported this listing' });
    }

    // Create report
    await db.query(
      'INSERT INTO listing_reports (listing_id, reporter_id, reason) VALUES ($1, $2, $3)',
      [listingId, req.user.id, reason || 'No reason provided']
    );

    res.json({ message: 'Listing reported successfully' });
  } catch (error) {
    logError('POST /:id/report', error, { id: req.params.id, userId: req.user?.id });
    res.status(500).json({ error: 'Server error' });
  }
});

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

    let query = `
      SELECT
        l.*,
        p.username as profile_username
      FROM listings l
      LEFT JOIN profiles p ON l.user_id = p.user_id
      WHERE (l.payment_status = $1 OR l.payment_status = $2)
    `;
    const params = ['paid', 'featured'];

    if (featured === 'true') {
      query += ' AND l.is_featured = 1';
    } else if (location) {
      query += ' AND l.location = $' + (params.length + 1);
      params.push(location);
    } else if (category) {
      query += ' AND l.category = $' + (params.length + 1);
      params.push(category);
    }

    query += ' ORDER BY l.is_featured DESC, l.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    logError('GET /', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get listing by ID or slug
router.get('/:identifier', optionalAuth, async (req, res) => {
  try {
    const { identifier } = req.params;

    // Try to get by slug first, fallback to id for backward compatibility
    let result;
    if (isNaN(identifier)) {
      // It's a slug
      result = await db.query(`
        SELECT l.*, p.username as profile_username
        FROM listings l
        LEFT JOIN profiles p ON l.user_id = p.user_id
        WHERE l.slug = $1
      `, [identifier]);
    } else {
      // It's an ID (backward compatibility)
      result = await db.query(`
        SELECT l.*, p.username as profile_username
        FROM listings l
        LEFT JOIN profiles p ON l.user_id = p.user_id
        WHERE l.id = $1
      `, [identifier]);
    }

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
    logError('GET /:identifier', error, { identifier: req.params.identifier, userId: req.user?.id });
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

    // Generate a unique slug from the title
    const baseSlug = generateSlug(title);
    let uniqueSlug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    while (true) {
      const existing = await db.query('SELECT id FROM listings WHERE slug = $1', [uniqueSlug]);
      if (existing.rows.length === 0) break;
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const result = await db.query(`
      INSERT INTO listings (user_id, category, title, location, description, slug)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, slug
    `, [req.user.id, category, title, location, description, uniqueSlug]);

    res.status(201).json({ message: 'Listing created successfully', id: result.rows[0].id, slug: result.rows[0].slug });
  } catch (error) {
    logError('POST /', error, { userId: req.user?.id });
    res.status(500).json({ error: 'Failed to create listing' });
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

    // Generate a new slug if the title has changed
    let uniqueSlug = listing.slug;
    if (title !== listing.title) {
      const baseSlug = generateSlug(title);
      uniqueSlug = baseSlug;
      let counter = 1;

      // Ensure slug is unique (excluding current listing)
      while (true) {
        const existing = await db.query('SELECT id FROM listings WHERE slug = $1 AND id != $2', [uniqueSlug, req.params.id]);
        if (existing.rows.length === 0) break;
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    await db.query(`
      UPDATE listings SET
        category = $1, title = $2, location = $3, description = $4, slug = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
    `, [category, title, location, description, uniqueSlug, req.params.id]);

    res.json({ message: 'Listing updated successfully' });
  } catch (error) {
    logError('PUT /:id', error, { id: req.params.id, userId: req.user?.id });
    res.status(500).json({ error: 'Failed to update listing' });
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
    logError('DELETE /:id', error, { id: req.params.id, userId: req.user?.id });
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
    logError('GET /user/my-listings', error, { userId: req.user?.id });
    res.status(500).json({ error: 'Server error' });
  }
});

// Get listings by user_id (public)
router.get('/user/:userId', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        l.*,
        p.username as profile_username
      FROM listings l
      LEFT JOIN profiles p ON l.user_id = p.user_id
      WHERE l.user_id = $1 AND (l.payment_status = 'paid' OR l.payment_status = 'featured')
      ORDER BY l.created_at DESC
    `, [req.params.userId]);

    res.json(result.rows);
  } catch (error) {
    logError('GET /user/:userId', error, { userId: req.params.userId });
    res.status(500).json({ error: 'Server error' });
  }
});

export { router as listingRoutes };
