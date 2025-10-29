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

// Search listings
router.get('/search', async (req, res) => {
  try {
    const { q, location, category, featured } = req.query;

    let query = `
      SELECT
        l.*,
        p.username as profile_username
      FROM listings l
      LEFT JOIN profiles p ON l.user_id = p.user_id
      WHERE (l.payment_status = $1 OR l.payment_status = $2)
    `;
    const params = ['paid', 'featured'];

    // Add search query
    if (q && q.trim()) {
      query += ' AND (l.title ILIKE $' + (params.length + 1) + ' OR l.description ILIKE $' + (params.length + 1) + ')';
      params.push(`%${q.trim()}%`);
    }

    // Add filters
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
    logError('GET /search', error);
    res.status(500).json({ error: 'Server error' });
  }
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

// NOTE: Specific routes must come BEFORE the generic /:identifier route

// Get user's saved listings
router.get('/user/saved', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        l.*,
        p.username as profile_username
      FROM saved_listings sl
      JOIN listings l ON sl.listing_id = l.id
      LEFT JOIN profiles p ON l.user_id = p.user_id
      WHERE sl.user_id = $1 AND (l.payment_status = 'paid' OR l.payment_status = 'featured')
      ORDER BY sl.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    logError('GET /user/saved', error, { userId: req.user?.id });
    res.status(500).json({ error: 'Server error' });
  }
});

// Get contact requests for user's listings
router.get('/contacts/received', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        cr.id,
        cr.listing_id,
        cr.sender_id,
        cr.sender_name,
        cr.sender_email,
        cr.message,
        cr.status,
        cr.created_at,
        l.title as listing_title,
        l.slug as listing_slug,
        l.category as listing_category
      FROM contact_requests cr
      JOIN listings l ON cr.listing_id = l.id
      WHERE l.user_id = $1 AND cr.status != 'archived'
      ORDER BY cr.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contact requests:', error);
    logError('GET /contacts/received', error, { userId: req.user?.id });
    res.status(500).json({ error: 'Server error' });
  }
});

// Dismiss (archive) a contact request - must come before :identifier route
router.put('/contacts/:id/dismiss', authenticateToken, async (req, res) => {
  try {
    const contactId = req.params.id;

    // Verify the contact request belongs to user's listing
    const result = await db.query(`
      SELECT cr.* FROM contact_requests cr
      JOIN listings l ON cr.listing_id = l.id
      WHERE cr.id = $1 AND l.user_id = $2
    `, [contactId, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact request not found' });
    }

    await db.query(
      "UPDATE contact_requests SET status = 'archived' WHERE id = $1",
      [contactId]
    );

    res.json({ message: 'Contact request dismissed' });
  } catch (error) {
    logError('PUT /contacts/:id/dismiss', error, { id: req.params.id, userId: req.user?.id });
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark contact request as read - must come before :identifier route
router.put('/contacts/:id/read', authenticateToken, async (req, res) => {
  try {
    const contactId = req.params.id;

    // Verify the contact request belongs to user's listing
    const result = await db.query(`
      SELECT cr.* FROM contact_requests cr
      JOIN listings l ON cr.listing_id = l.id
      WHERE cr.id = $1 AND l.user_id = $2
    `, [contactId, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact request not found' });
    }

    await db.query(
      "UPDATE contact_requests SET status = 'read' WHERE id = $1",
      [contactId]
    );

    res.json({ message: 'Contact request marked as read' });
  } catch (error) {
    logError('PUT /contacts/:id/read', error, { id: req.params.id, userId: req.user?.id });
    res.status(500).json({ error: 'Server error' });
  }
});

// Get listing by ID or slug (must come last after all specific routes)
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

    // Track view (don't track owner views)
    if (!isOwner) {
      try {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userId = req.user ? req.user.id : null;
        await db.query(
          'INSERT INTO listing_views (listing_id, ip_address, user_id) VALUES ($1, $2, $3)',
          [listing.id, ipAddress, userId]
        );
      } catch (error) {
        // Log but don't fail the request if view tracking fails
        console.error('Failed to track view:', error.message);
      }
    }

    // Get view count
    const viewResult = await db.query(
      'SELECT COUNT(*) as view_count FROM listing_views WHERE listing_id = $1',
      [listing.id]
    );
    listing.view_count = parseInt(viewResult.rows[0].view_count) || 0;

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

// Save/unsave a listing
router.post('/:id/save', authenticateToken, async (req, res) => {
  try {
    const listingId = req.params.id;
    const userId = req.user.id;

    // Check if listing exists
    const listingResult = await db.query('SELECT * FROM listings WHERE id = $1', [listingId]);
    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check if already saved
    const existingResult = await db.query(
      'SELECT * FROM saved_listings WHERE user_id = $1 AND listing_id = $2',
      [userId, listingId]
    );

    if (existingResult.rows.length > 0) {
      // Unsave the listing
      await db.query(
        'DELETE FROM saved_listings WHERE user_id = $1 AND listing_id = $2',
        [userId, listingId]
      );
      res.json({ message: 'Listing unsaved', saved: false });
    } else {
      // Save the listing
      await db.query(
        'INSERT INTO saved_listings (user_id, listing_id) VALUES ($1, $2)',
        [userId, listingId]
      );
      res.json({ message: 'Listing saved', saved: true });
    }
  } catch (error) {
    logError('POST /:id/save', error, { id: req.params.id, userId: req.user?.id });
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a contact request for a listing
router.post('/:id/contact', authenticateToken, async (req, res) => {
  try {
    const listingId = req.params.id;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if listing exists
    const listingResult = await db.query('SELECT * FROM listings WHERE id = $1', [listingId]);
    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = listingResult.rows[0];

    // Prevent users from contacting their own listings
    if (listing.user_id === req.user.id) {
      return res.status(400).json({ error: 'You cannot contact your own listing' });
    }

    // Get sender profile for name and email
    const userResult = await db.query('SELECT email FROM users WHERE id = $1', [req.user.id]);
    const profileResult = await db.query('SELECT name FROM profiles WHERE user_id = $1', [req.user.id]);

    const senderEmail = userResult.rows[0]?.email || '';
    const senderName = profileResult.rows[0]?.name || 'Anonymous';

    // Check if already contacted
    const existingResult = await db.query(
      'SELECT * FROM contact_requests WHERE listing_id = $1 AND sender_id = $2',
      [listingId, req.user.id]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'You have already contacted this listing' });
    }

    // Create contact request
    await db.query(`
      INSERT INTO contact_requests (listing_id, sender_id, sender_name, sender_email, message)
      VALUES ($1, $2, $3, $4, $5)
    `, [listingId, req.user.id, senderName, senderEmail, message]);

    // Send email notification to listing owner
    try {
      // Get listing owner's email
      const ownerUserResult = await db.query('SELECT email FROM users WHERE id = $1', [listing.user_id]);
      const ownerEmail = ownerUserResult.rows[0]?.email;

      if (ownerEmail) {
        const { sendContactRequestEmail } = await import('../utils/email.js');
        await sendContactRequestEmail(
          ownerEmail,
          listing.title,
          listing.slug,
          senderName,
          senderEmail,
          message
        );
      }
    } catch (emailError) {
      // Log email error but don't fail the contact request
      console.error('Failed to send contact request email:', emailError);
    }

    res.json({ message: 'Contact request sent successfully' });
  } catch (error) {
    logError('POST /:id/contact', error, { id: req.params.id, userId: req.user?.id });
    res.status(500).json({ error: 'Server error' });
  }
});


export { router as listingRoutes };
