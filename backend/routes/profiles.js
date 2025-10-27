import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../database/db.js';

const router = express.Router();

// Get user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM profiles WHERE user_id = $1', [req.user.id]);
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get profile by user_id (must be before /:id to avoid route conflict)
router.get('/user/:userId', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM profiles WHERE user_id = $1', [req.params.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
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
    res.status(500).json({ error: 'Server error' });
  }
});

// Create or update profile
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
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
          name = $1, sub_heading = $2, location = $3, about = $4,
          "current_role" = $5, additional_details = $6, key_achievements = $7,
          philosophy = $8, skills = $9, links = $10, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $11
      `, [
        name, sub_heading, location, about, current_role,
        additional_details, key_achievements, philosophy, skills, links, req.user.id
      ]);
      res.json({ message: 'Profile updated successfully', id: existingResult.rows[0].id });
    } else {
      // Create new profile
      const insertResult = await db.query(`
        INSERT INTO profiles (
          user_id, name, sub_heading, location, about,
          "current_role", additional_details, key_achievements,
          philosophy, skills, links
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `, [
        req.user.id, name, sub_heading, location, about,
        current_role, additional_details, key_achievements,
        philosophy, skills, links
      ]);
      res.status(201).json({ message: 'Profile created successfully', id: insertResult.rows[0].id });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all profiles
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM profiles ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export { router as profileRoutes };
