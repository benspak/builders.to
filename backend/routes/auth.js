import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from '../database/db.js';
import { logError } from '../utils/errorLogger.js';
import { sendPasswordResetEmail } from '../utils/email.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, username } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!name || !username) {
      return res.status(400).json({ error: 'Name and username are required' });
    }

    // Check if user exists by email
    const emailResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailResult.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Check if username is taken
    const usernameResult = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (usernameResult.rows.length > 0) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const insertResult = await db.query(
      'INSERT INTO users (email, password_hash, name, username) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, passwordHash, name, username]
    );

    const userId = insertResult.rows[0].id;

    // Auto-create profile with name and username from registration
    await db.query(
      'INSERT INTO profiles (user_id, name, username) VALUES ($1, $2, $3)',
      [userId, name, username]
    );

    // Get user with admin status
    const userResult = await db.query('SELECT id, email, name, username, is_admin FROM users WHERE id = $1', [userId]);
    const newUser = userResult.rows[0];

    const token = jwt.sign({ id: userId, email, is_admin: newUser.is_admin }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: userId, email, name, username, is_admin: newUser.is_admin } });
  } catch (error) {
    logError('POST /register', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, is_admin: user.is_admin || false }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, username: user.username, is_admin: user.is_admin || false } });
  } catch (error) {
    logError('POST /login', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify token and get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get fresh user data from database
    const result = await db.query('SELECT id, email, name, username, is_admin FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    logError('GET /me', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const result = await db.query('SELECT id, email FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      // Don't reveal if email exists for security
      return res.json({ message: 'If that email exists, a reset link has been sent' });
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Invalidate any existing tokens for this user
    await db.query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE',
      [user.id]
    );

    // Store new token
    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, resetToken, expiresAt]
    );

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetToken);
      console.log('✓ Password reset email sent to', email);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      logError('Password reset email failed', emailError);
      // Still return success to avoid revealing if email exists
    }

    res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (error) {
    logError('POST /forgot-password', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Find valid token
    const tokenResult = await db.query(
      'SELECT * FROM password_reset_tokens WHERE token = $1 AND used = FALSE AND expires_at > NOW()',
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const resetToken = tokenResult.rows[0];

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, resetToken.user_id]
    );

    // Mark token as used
    await db.query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE id = $1',
      [resetToken.id]
    );

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    logError('POST /reset-password', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export { router as authRoutes };
