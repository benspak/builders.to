import express from 'express';
import { requireAdmin } from '../middleware/auth.js';
import db from '../database/db.js';
import { logError } from '../utils/errorLogger.js';

const router = express.Router();

// Get all reported listings
router.get('/reported-listings', requireAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        lr.*,
        l.id as listing_id,
        l.title,
        l.category,
        l.description,
        l.location,
        l.created_at as listing_created,
        reporter.name as reporter_name,
        reporter.username as reporter_username,
        owner.name as owner_name,
        owner.username as owner_username,
        (SELECT COUNT(*) FROM listing_reports lr2 WHERE lr2.listing_id = lr.listing_id AND lr2.status = 'pending') as report_count
      FROM listing_reports lr
      JOIN listings l ON lr.listing_id = l.id
      JOIN users reporter ON lr.reporter_id = reporter.id
      JOIN users owner ON l.user_id = owner.id
      WHERE lr.status = 'pending'
      ORDER BY lr.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    logError('GET /reported-listings', error, { userId: req.user?.id });
    res.status(500).json({ error: 'Server error' });
  }
});

// Dismiss a report
router.post('/reports/:reportId/dismiss', requireAdmin, async (req, res) => {
  try {
    await db.query(`
      UPDATE listing_reports
      SET status = 'dismissed', reviewed_by = $1, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [req.user.id, req.params.reportId]);

    res.json({ message: 'Report dismissed' });
  } catch (error) {
    logError('POST /reports/:reportId/dismiss', error, { userId: req.user?.id, reportId: req.params.reportId });
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove a listing (admin action)
router.delete('/listings/:listingId', requireAdmin, async (req, res) => {
  try {
    // Update report status first
    await db.query(`
      UPDATE listing_reports
      SET status = 'reviewed', reviewed_by = $1, reviewed_at = CURRENT_TIMESTAMP
      WHERE listing_id = $2 AND status = 'pending'
    `, [req.user.id, req.params.listingId]);

    // Delete the listing
    await db.query('DELETE FROM listings WHERE id = $1', [req.params.listingId]);

    res.json({ message: 'Listing removed successfully' });
  } catch (error) {
    logError('DELETE /listings/:listingId', error, { userId: req.user?.id, listingId: req.params.listingId });
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all listings for admin view
router.get('/listings', requireAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        l.*,
        p.username as profile_username,
        u.name as owner_name,
        u.email as owner_email,
        COUNT(lr.id) as report_count
      FROM listings l
      LEFT JOIN profiles p ON l.user_id = p.user_id
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN listing_reports lr ON l.id = lr.listing_id AND lr.status = 'pending'
      GROUP BY l.id, p.username, u.name, u.email
      ORDER BY l.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    logError('GET /listings', error, { userId: req.user?.id });
    res.status(500).json({ error: 'Server error' });
  }
});

export { router as adminRoutes };
