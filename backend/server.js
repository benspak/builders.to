import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables FIRST before importing routes
dotenv.config({ path: join(__dirname, '.env') });

// Debug: Log database connection info
console.log('📊 Database URL:', process.env.POSTGRES_DATABASE_URL ? '✓ Set' : '✗ Not set');

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
const allowedOrigins = [
  'http://localhost:3000',
  'https://builders.to',
  'https://www.builders.to'
];

// In development, allow all localhost
const isDevelopment = process.env.NODE_ENV === 'development';

// Check if we're serving static files (single-service mode)
const isServingStatic = existsSync(join(__dirname, '../frontend/dist'));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);

    // In single-service mode (serving static files), allow same-origin requests
    if (isServingStatic) {
      return callback(null, true);
    }

    // In development, allow any localhost
    if (isDevelopment && origin.includes('localhost')) {
      return callback(null, true);
    }

    // Allow specific domains or any Render domain
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
app.get('/health/db', async (req, res) => {
  try {
    // Try to query the database
    const result = await db.query('SELECT COUNT(*) as count FROM listings');
    res.json({
      status: 'ok',
      message: 'Database connection healthy',
      listings_count: parseInt(result.rows[0].count)
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

// Serve static files from frontend/build directory (production)
const frontendPath = join(__dirname, '../frontend/dist');
if (existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  // Catch-all handler: serve index.html for any non-API routes
  // This allows React Router to handle client-side routing
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(join(frontendPath, 'index.html'));
  });

  console.log('✅ Serving frontend static files from:', frontendPath);
} else {
  console.log('⚠️  Frontend static files not found. Running as API-only server.');
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? '✓ Configured' : '⚠️  Not configured'}`);
  console.log(`🔐 JWT: ${process.env.JWT_SECRET ? '✓ Configured' : '⚠️  Not configured'}`);
});
