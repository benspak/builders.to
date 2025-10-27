import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../database/db.js';

const router = express.Router();

// Get user dashboard data
router.get('/', authenticateToken, (req, res) => {
  try {
    const listings = db.prepare('SELECT * FROM listings WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    const transactions = db.prepare(`
      SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.user.id);

    res.json({ listings, transactions });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get transactions only
router.get('/transactions', authenticateToken, (req, res) => {
  try {
    const transactions = db.prepare(`
      SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.user.id);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get listings only
router.get('/listings', authenticateToken, (req, res) => {
  try {
    const listings = db.prepare('SELECT * FROM listings WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export { router as dashboardRoutes };
