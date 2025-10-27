import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../database/db.js';

const router = express.Router();

// Get user profile
router.get('/me', authenticateToken, (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user.id);
    res.json(profile || null);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get profile by user_id (must be before /:id to avoid route conflict)
router.get('/user/:userId', (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.params.userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get profile by ID
router.get('/:id', (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create or update profile
router.post('/', authenticateToken, (req, res) => {
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

    const existing = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user.id);

    if (existing) {
      // Update existing profile
      const result = db.prepare(`
        UPDATE profiles SET
          name = ?, sub_heading = ?, location = ?, about = ?,
          current_role = ?, additional_details = ?, key_achievements = ?,
          philosophy = ?, skills = ?, links = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(
        name, sub_heading, location, about, current_role,
        additional_details, key_achievements, philosophy, skills, links, req.user.id
      );
      res.json({ message: 'Profile updated successfully', id: existing.id });
    } else {
      // Create new profile
      const result = db.prepare(`
        INSERT INTO profiles (
          user_id, name, sub_heading, location, about,
          current_role, additional_details, key_achievements,
          philosophy, skills, links
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.user.id, name, sub_heading, location, about,
        current_role, additional_details, key_achievements,
        philosophy, skills, links
      );
      res.status(201).json({ message: 'Profile created successfully', id: result.lastInsertRowid });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all profiles
router.get('/', (req, res) => {
  try {
    const profiles = db.prepare('SELECT * FROM profiles ORDER BY created_at DESC').all();
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export { router as profileRoutes };
