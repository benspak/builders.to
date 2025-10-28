import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, statSync } from 'fs';

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

// Check if frontend dist exists to serve static files in production
const frontendPath = join(__dirname, '../frontend/dist');
const hasFrontend = existsSync(frontendPath);

console.log('🔍 Checking for frontend dist...');
console.log('   __dirname:', __dirname);
console.log('   Looking for:', frontendPath);
console.log('   Exists:', hasFrontend);

if (hasFrontend) {
  const stats = statSync(frontendPath);
  console.log('✅ Frontend dist found, will serve static files');
  console.log('   Stats:', stats.isDirectory() ? 'Directory' : 'Not directory');
} else {
  console.log('⚠️  Frontend dist not found, running as API-only');
}

// Routes - these need to come BEFORE static file serving
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payments/webhook', webhookRouter);
app.use('/api/dashboard', dashboardRoutes);

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
    console.error('Database health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Serve static files from frontend/dist directory (production)
if (hasFrontend) {
  console.log('📁 Serving static files from:', frontendPath);

  // Serve static files (CSS, JS, images, etc.)
  app.use(express.static(frontendPath));

  // Catch-all handler: serve index.html for SPA routing
  app.get('*', (req, res, next) => {
    // Never serve index.html for API or health endpoints
    if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Serve index.html for all other routes (React Router handles client-side routing)
    res.sendFile(join(frontendPath, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);

  if (process.env.NODE_ENV === 'development') {
    console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? '✓ Configured' : '⚠️  Not configured'}`);
    console.log(`🔐 JWT: ${process.env.JWT_SECRET ? '✓ Configured' : '⚠️  Not configured'}`);
  }
});
