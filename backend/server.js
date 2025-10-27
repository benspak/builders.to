import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Load environment variables FIRST before importing routes
dotenv.config();

import db from './database/db.js';
import { authRoutes } from './routes/auth.js';
import { profileRoutes } from './routes/profiles.js';
import { listingRoutes } from './routes/listings.js';
import { paymentRoutes, webhookRouter } from './routes/payments.js';
import { dashboardRoutes } from './routes/dashboard.js';

const app = express();
const PORT = process.env.PORT || 5555;

// Trust proxy - required for rate limiting behind reverse proxy (Render.com)
app.set('trust proxy', true);

// Middleware
app.use(helmet());

// Configure CORS to allow requests from production domain
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://builders.to',
    'https://www.builders.to',
    'https://builders-to.onrender.com'
  ],
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Export database for routes
export const getDb = () => db;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payments/webhook', webhookRouter);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Builders.to API is running' });
});

// Database health check
app.get('/health/db', (req, res) => {
  try {
    // Try to query the database
    const result = db.prepare('SELECT COUNT(*) as count FROM listings').get();
    res.json({
      status: 'ok',
      message: 'Database connection healthy',
      listings_count: result.count
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? '✓ Configured' : '⚠️  Not configured'}`);
  console.log(`🔐 JWT: ${process.env.JWT_SECRET ? '✓ Configured' : '⚠️  Not configured'}`);
});
