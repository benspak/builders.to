import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize the database
// Use absolute path for production
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../builders.db');
console.log('Database path:', dbPath);
const db = new Database(dbPath);
console.log('Database initialized successfully');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
try {
  console.log('Creating database tables...');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✓ Users table ready');

  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      name TEXT NOT NULL,
      sub_heading TEXT,
      location TEXT,
      about TEXT,
      current_role TEXT,
      additional_details TEXT,
      key_achievements TEXT,
      philosophy TEXT,
      skills TEXT,
      links TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✓ Profiles table ready');

  db.exec(`
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('Jobs', 'Services', 'For Sale')),
      title TEXT NOT NULL,
      location TEXT,
      description TEXT NOT NULL,
      is_featured INTEGER DEFAULT 0,
      payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'featured')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✓ Listings table ready');

  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      listing_id INTEGER,
      type TEXT NOT NULL CHECK(type IN ('listing', 'feature')),
      amount REAL NOT NULL,
      stripe_payment_intent_id TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL
    )
  `);
  console.log('✓ Transactions table ready');
  console.log('✓ All database tables initialized');
} catch (error) {
  console.error('❌ Error initializing database:', error);
  throw error;
}

export default db;
