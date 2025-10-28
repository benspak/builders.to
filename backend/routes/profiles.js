import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../database/db.js';
import { logError } from '../utils/errorLogger.js';

const router = express.Router();

// Get user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM profiles WHERE user_id = $1', [req.user.id]);
    res.json(result.rows[0] || null);
  } catch (error) {
    logError('GET /me', error, { userId: req.user?.id });
    res.status(500).json({ error: 'Server error' });
  }
});

// Get profile by username (must be before /:id to avoid route conflict)
router.get('/username/:username', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM profiles WHERE username = $1', [req.params.username]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    logError('GET /username/:username', error, { username: req.params.username });
    res.status(500).json({ error: 'Server error' });
  }
});

// Get profile by user_id (for backward compatibility)
router.get('/user/:userId', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM profiles WHERE user_id = $1', [req.params.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    logError('GET /user/:userId', error, { userId: req.params.userId });
    res.status(500).json({ error: 'Server error' });
  }
});

// Get profile by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM profiles WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    logError('GET /:id', error, { id: req.params.id });
    res.status(500).json({ error: 'Server error' });
  }
});

// Create or update profile
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      username,
      sub_heading,
      location,
      about,
      current_role,
      additional_details,
      key_achievements,
      philosophy,
      skills,
      links
    } = req.body;

    const existingResult = await db.query('SELECT * FROM profiles WHERE user_id = $1', [req.user.id]);

    if (existingResult.rows.length > 0) {
      // Update existing profile
      await db.query(`
        UPDATE profiles SET
          name = $1, username = $2, sub_heading = $3, location = $4, about = $5,
          "current_role" = $6, additional_details = $7, key_achievements = $8,
          philosophy = $9, skills = $10, links = $11, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $12
      `, [
        name, username, sub_heading, location, about, current_role,
        additional_details, key_achievements, philosophy, skills, links, req.user.id
      ]);
      res.json({ message: 'Profile updated successfully', id: existingResult.rows[0].id });
    } else {
      // Create new profile
      const insertResult = await db.query(`
        INSERT INTO profiles (
          user_id, name, username, sub_heading, location, about,
          "current_role", additional_details, key_achievements,
          philosophy, skills, links
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `, [
        req.user.id, name, username, sub_heading, location, about,
        current_role, additional_details, key_achievements,
        philosophy, skills, links
      ]);
      res.status(201).json({ message: 'Profile created successfully', id: insertResult.rows[0].id });
    }
  } catch (error) {
    logError('POST /', error, { userId: req.user?.id });
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all profiles
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM profiles ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    logError('GET /', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export { router as profileRoutes };
