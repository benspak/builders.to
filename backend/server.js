import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables FIRST before importing routes
dotenv.config({ path: join(__dirname, '.env') });

// Database connection status (only log in development)
if (process.env.NODE_ENV === 'development') {
  console.log('📊 Database URL:', process.env.POSTGRES_DATABASE_URL ? '✓ Set' : '✗ Not set');
}

import db from './database/db.js';
import { authRoutes } from './routes/auth.js';
import { profileRoutes } from './routes/profiles.js';
import { listingRoutes } from './routes/listings.js';
import { paymentRoutes, webhookRouter } from './routes/payments.js';
import { tokenRoutes } from './routes/tokens.js';
import { referralRoutes } from './routes/referrals.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { adminRoutes } from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 5555;

// Trust proxy - required for rate limiting behind reverse proxy (Render.com)
// Only trust the first proxy (Render.com's reverse proxy) to prevent IP spoofing
app.set('trust proxy', 1);

// Middleware
app.use(helmet());

// Configure CORS to allow requests from production domain
const allowedOrigins = [
  'http://localhost:3000',
  'https://builders.to',
  'https://www.builders.to',
  'https://builders-frontend.onrender.com' // Frontend static site URL
];

// In development, allow all localhost
const isDevelopment = process.env.NODE_ENV === 'development';

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);

    // In development, allow any localhost
    if (isDevelopment && origin.includes('localhost')) {
      return callback(null, true);
    }

    // Allow specific domains or any Render static site domain
    if (allowedOrigins.includes(origin) || origin.includes('.onrender.com')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));

// Rate limiting - more lenient in development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 10000 : 100, // Much higher limit in development for hot reloading
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Export database for routes
export const getDb = () => db;

// Backend API-only mode - frontend is served as separate static site
console.log('🚀 Running as API-only backend service');
console.log('📍 Frontend is served separately as a static site');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payments/webhook', webhookRouter);
app.use('/api/tokens', tokenRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// Health check routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Builders.to API is running' });
});

app.get('/health/db', async (req, res) => {
  try {
    const result = await db.query('SELECT COUNT(*) as count FROM listings');
    res.json({
      status: 'ok',
      message: 'Database connection healthy',
      listings_count: parseInt(result.rows[0].count)
    });
  } catch (error) {
    // Don't expose error details in production
    const errorMessage = process.env.NODE_ENV === 'production'
      ? 'Database connection failed'
      : error.message;

    console.error('Database health check failed');

    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: errorMessage
    });
  }
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);

  if (process.env.NODE_ENV === 'development') {
    console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? '✓ Configured' : '⚠️  Not configured'}`);
    console.log(`🔐 JWT: ${process.env.JWT_SECRET ? '✓ Configured' : '⚠️  Not configured'}`);
    console.log(`📧 Resend: ${process.env.RESEND_API_KEY ? '✓ Configured' : '⚠️  Not configured'}`);
  }
});
