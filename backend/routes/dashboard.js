import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../database/db.js';
import { logError } from '../utils/errorLogger.js';

const router = express.Router();

// Get user dashboard data
router.get('/', authenticateToken, async (req, res) => {
  try {
    const listingsResult = await db.query(
      'SELECT * FROM listings WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    const transactionsResult = await db.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({ listings: listingsResult.rows, transactions: transactionsResult.rows });
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
