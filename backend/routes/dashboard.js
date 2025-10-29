import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../database/db.js';
import { logError } from '../utils/errorLogger.js';

const router = express.Router();

// Get user dashboard data
router.get('/', authenticateToken, async (req, res) => {
  try {
    const listingsResult = await db.query(`
      SELECT
        l.*,
        COALESCE(view_counts.view_count, 0) as view_count
      FROM listings l
      LEFT JOIN (
        SELECT listing_id, COUNT(*) as view_count
        FROM listing_views
        GROUP BY listing_id
      ) view_counts ON l.id = view_counts.listing_id
      WHERE l.user_id = $1
      ORDER BY l.created_at DESC
    `, [req.user.id]);

    const transactionsResult = await db.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    // Convert view_count to integer
    const listings = listingsResult.rows.map(listing => ({
      ...listing,
      view_count: parseInt(listing.view_count) || 0
    }));

    res.json({ listings, transactions: transactionsResult.rows });
  } catch (error) {
    logError('GET /', error, { userId: req.user?.id });
    res.status(500).json({ error: 'Server error' });
  }
});

// Get transactions only
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    logError('GET /transactions', error, { userId: req.user?.id });
    res.status(500).json({ error: 'Server error' });
  }
});

// Get listings only
router.get('/listings', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM listings WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    logError('GET /listings', error, { userId: req.user?.id });
    res.status(500).json({ error: 'Server error' });
  }
});

export { router as dashboardRoutes };
