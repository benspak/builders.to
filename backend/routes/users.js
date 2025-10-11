import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Create or update user
router.post('/', async (req, res) => {
  try {
    const { name, email, timezone } = req.body;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Update existing user
      user.name = name || user.name;
      user.timezone = timezone || user.timezone;
      await user.save();
    } else {
      // Create new user
      user = new User({
        name,
        email: email.toLowerCase(),
        timezone: timezone || 'America/New_York'
      });
      await user.save();
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user by email
router.get('/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase() })
      .populate('meetings.meetingId');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
