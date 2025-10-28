import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const { Pool } = pg;

// Database configuration
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_DATABASE_URL || 'postgresql://localhost:5432/builders';

// Only log connection details in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔌 Connecting to database:', connectionString.replace(/:[^:@]*@/, ':****@'));
} else {
  console.log('🔌 Connecting to database...');
}

const config = {
  connectionString: connectionString,
  // For Render internal database URL
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
};

// Create connection pool
const pool = new Pool(config);

// Test connection
pool.on('connect', () => {
  console.log('✅ PostgreSQL pool connected');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client');
});

// Initialize database tables
const initializeDatabase = async () => {
  try {
    console.log('📊 Initializing PostgreSQL database...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        username TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table ready');

    // Add name and username columns if they don't exist (for existing databases)
    try {
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT');
      await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS username_unique_idx ON users(username) WHERE username IS NOT NULL');
    } catch (error) {
      // Columns might already exist, ignore error
    }

    // Create profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        username TEXT,
        sub_heading TEXT,
        location TEXT,
        about TEXT,
        "current_role" TEXT,
        additional_details TEXT,
        key_achievements TEXT,
        philosophy TEXT,
        skills TEXT,
        links TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Profiles table ready');

    // Add username column if it doesn't exist
    try {
      await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT');
    } catch (error) {
      // Column might already exist, ignore error
    }

    // Create listings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category TEXT NOT NULL CHECK(category IN ('Jobs', 'Services', 'For Sale')),
        title TEXT NOT NULL,
        location TEXT,
        description TEXT NOT NULL,
        is_featured INTEGER DEFAULT 0,
        payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'featured')),
        slug TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Listings table ready');

    // Add slug column if it doesn't exist (for existing databases)
    try {
      await pool.query('ALTER TABLE listings ADD COLUMN IF NOT EXISTS slug TEXT');
      await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS slug_unique_idx ON listings(slug) WHERE slug IS NOT NULL');

      // Generate slugs for existing listings that don't have one
      const existingListings = await pool.query('SELECT id, title FROM listings WHERE slug IS NULL');
      for (const listing of existingListings.rows) {
        const baseSlug = listing.title
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');

        // Check for existing slug and make it unique if needed
        let uniqueSlug = baseSlug;
        let counter = 1;
        while (true) {
          const existing = await pool.query('SELECT id FROM listings WHERE slug = $1', [uniqueSlug]);
          if (existing.rows.length === 0) break;
          uniqueSlug = `${baseSlug}-${counter}`;
          counter++;
        }

        await pool.query('UPDATE listings SET slug = $1 WHERE id = $2', [uniqueSlug, listing.id]);
      }
    } catch (error) {
      // Column might already exist, ignore error
      console.log('Slug column migration:', error.message);
    }

    // Create transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        listing_id INTEGER REFERENCES listings(id) ON DELETE SET NULL,
        type TEXT NOT NULL CHECK(type IN ('listing', 'feature')),
        amount REAL NOT NULL,
        stripe_payment_intent_id TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Transactions table ready');
    console.log('🎉 PostgreSQL database initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing database');
    throw error;
  }
};

// Initialize on startup
initializeDatabase();

// Helper function to execute queries
const query = async (text, params) => {
  const start = Date.now();

  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    // Only log slow queries (>500ms) to help identify performance issues
    if (duration > 500) {
      console.log(`⚠️  Slow query detected (${duration}ms)`);
    }

    return res;
  } catch (error) {
    console.error('❌ Query error:', error.message);
    throw error;
  }
};

// Database object with common operations
const db = {
  query,
  pool,
  async close() {
    await pool.end();
  }
};

export default db;
