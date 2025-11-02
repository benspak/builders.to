import express from 'express';
import crypto from 'crypto';
import { authenticateToken } from '../middleware/auth.js';
import db from '../database/db.js';
import { logError } from '../utils/errorLogger.js';

const router = express.Router();

// Get user's referral code
router.get('/code', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT referral_code FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    let referralCode = result.rows[0].referral_code;

    // Generate referral code if user doesn't have one
    if (!referralCode) {
      referralCode = crypto.randomBytes(8).toString('hex').toUpperCase();
      await db.query('UPDATE users SET referral_code = $1 WHERE id = $2', [referralCode, req.user.id]);
    }

    res.json({ referralCode });
  } catch (error) {
    logError('GET /code', error, { userId: req.user?.id });
    res.status(500).json({ error: 'Failed to get referral code' });
  }
});

// Get referral stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Get number of referrals
    const referralsResult = await db.query(
      'SELECT COUNT(*) as count FROM referrals WHERE referrer_id = $1',
      [req.user.id]
    );

    // Get number of rewarded referrals (those who set their username)
    const rewardedResult = await db.query(
      'SELECT COUNT(*) as count FROM referrals WHERE referrer_id = $1 AND reward_given = TRUE',
      [req.user.id]
    );

    res.json({
      totalReferrals: parseInt(referralsResult.rows[0].count) || 0,
      rewardedReferrals: parseInt(rewardedResult.rows[0].count) || 0
    });
  } catch (error) {
    logError('GET /stats', error, { userId: req.user?.id });
    res.status(500).json({ error: 'Failed to get referral stats' });
  }
});

// Verify referral code (public endpoint)
router.get('/verify/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const result = await db.query('SELECT id FROM users WHERE referral_code = $1', [code]);
    res.json({ valid: result.rows.length > 0 });
  } catch (error) {
    logError('GET /verify/:code', error);
    res.status(500).json({ error: 'Failed to verify referral code' });
  }
});

export { router as referralRoutes };
