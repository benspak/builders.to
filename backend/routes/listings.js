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
router.get('/', (req, res) => {
  try {
    const { location, category, featured } = req.query;

    // Check what columns exist in the listings table
    let tableInfo;
    try {
      tableInfo = db.prepare("PRAGMA table_info(listings)").all();
    } catch (pragmaError) {
      console.error('❌ Error running PRAGMA table_info:', pragmaError);
      throw new Error('Database schema error: Unable to read table structure');
    }

    const columns = tableInfo.map(col => col.name);
    const hasPaymentStatus = columns.includes('payment_status');
    const hasPaid = columns.includes('paid');

    console.log('📋 Listing columns:', columns.join(', '));
    console.log('🔍 hasPaymentStatus:', hasPaymentStatus, 'hasPaid:', hasPaid);

    let query;
    const params = [];

    // Build query based on what columns exist
    if (hasPaymentStatus) {
      // New schema: use payment_status
      query = 'SELECT * FROM listings WHERE (payment_status = "paid" OR payment_status = "featured")';
    } else if (hasPaid) {
      // Old schema: use paid column
      query = 'SELECT * FROM listings WHERE paid = 1';
    } else {
      // Fallback: show all listings if neither column exists (shouldn't happen but be defensive)
      console.warn('⚠️  Neither payment_status nor paid column found, showing all listings');
      query = 'SELECT * FROM listings';
    }

    if (featured === 'true') {
      query += ' AND is_featured = 1';
    } else if (location) {
      query += ' AND location = ?';
      params.push(location);
    } else if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY is_featured DESC, created_at DESC';

    console.log('📝 Executing query:', query);
    const listings = db.prepare(query).all(...params);
    res.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get listing by ID
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check if listing is visible - handle both old and new schema
    let isVisible;
    if ('payment_status' in listing) {
      isVisible = listing.payment_status === 'paid' || listing.payment_status === 'featured';
    } else if ('paid' in listing) {
      isVisible = listing.paid === 1;
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
router.post('/', authenticateToken, createListingLimiter, (req, res) => {
  try {
    const { category, title, location, description } = req.body;

    if (!category || !title || !description) {
      return res.status(400).json({ error: 'Category, title, and description are required' });
    }

    // Check for duplicate posts from the same user
    // Look for similar listings by the same user in the last 24 hours
    const existingListing = db.prepare(`
      SELECT * FROM listings
      WHERE user_id = ?
        AND title = ?
        AND description = ?
        AND created_at > datetime('now', '-24 hours')
    `).get(req.user.id, title, description);

    if (existingListing) {
      return res.status(409).json({
        error: 'Duplicate listing detected. You cannot post the same listing within 24 hours.'
      });
    }

    // Additional check: Look for any exact match in the last 7 days
    const similarListing = db.prepare(`
      SELECT * FROM listings
      WHERE user_id = ?
        AND title = ?
        AND created_at > datetime('now', '-7 days')
    `).get(req.user.id, title);

    if (similarListing) {
      return res.status(409).json({
        error: 'You have already posted a similar listing. Please wait or modify your post.'
      });
    }

    const result = db.prepare(`
      INSERT INTO listings (user_id, category, title, location, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.user.id, category, title, location, description);

    res.status(201).json({ message: 'Listing created successfully', id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update listing
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { category, title, location, description } = req.body;

    // Check if listing belongs to user
    const listing = db.prepare('SELECT * FROM listings WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found or unauthorized' });
    }

    // Only allow editing of pending listings (not paid or featured)
    // Handle both old and new schema
    let isPaid = false;
    if ('payment_status' in listing) {
      isPaid = listing.payment_status !== 'pending';
    } else if ('paid' in listing) {
      isPaid = listing.paid === 1;
    }

    if (isPaid) {
      return res.status(400).json({
        error: 'Cannot edit a listing that has already been paid. Only pending listings can be edited.'
      });
    }

    db.prepare(`
      UPDATE listings SET
        category = ?, title = ?, location = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(category, title, location, description, req.params.id);

    res.json({ message: 'Listing updated successfully' });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Delete listing
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const listing = db.prepare('SELECT * FROM listings WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found or unauthorized' });
    }

    db.prepare('DELETE FROM listings WHERE id = ?').run(req.params.id);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's listings
router.get('/user/my-listings', authenticateToken, (req, res) => {
  try {
    const listings = db.prepare('SELECT * FROM listings WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get listings by user_id (public)
router.get('/user/:userId', (req, res) => {
  try {
    // Check what columns exist in the listings table
    const tableInfo = db.prepare("PRAGMA table_info(listings)").all();
    const columns = tableInfo.map(col => col.name);
    const hasPaymentStatus = columns.includes('payment_status');
    const hasPaid = columns.includes('paid');

    let listings;
    if (hasPaymentStatus) {
      // New schema: use payment_status
      listings = db.prepare(`
        SELECT * FROM listings
        WHERE user_id = ? AND (payment_status = 'paid' OR payment_status = 'featured')
        ORDER BY created_at DESC
      `).all(req.params.userId);
    } else if (hasPaid) {
      // Old schema: use paid column
      listings = db.prepare(`
        SELECT * FROM listings
        WHERE user_id = ? AND paid = 1
        ORDER BY created_at DESC
      `).all(req.params.userId);
    } else {
      // Fallback: show all listings if neither column exists
      listings = db.prepare(`
        SELECT * FROM listings
        WHERE user_id = ?
        ORDER BY created_at DESC
      `).all(req.params.userId);
    }

    res.json(listings);
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export { router as listingRoutes };
