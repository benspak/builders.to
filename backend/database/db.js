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

  // Migration: Handle schema changes
  try {
    const tableInfo = db.prepare("PRAGMA table_info(listings)").all();
    const columns = tableInfo.map(col => col.name);
    const hasPaymentStatus = columns.includes('payment_status');
    const hasPaid = columns.includes('paid');

    // Migration scenario: Database has old 'paid' column but not 'payment_status'
    if (hasPaid && !hasPaymentStatus) {
      console.log('⚠️  Migrating database schema from paid to payment_status...');

      try {
        // Get all data with old schema
        const oldData = db.prepare('SELECT id, paid FROM listings').all();

        // Add new payment_status column
        db.exec('ALTER TABLE listings ADD COLUMN payment_status TEXT DEFAULT "pending"');
        console.log('✓ Added payment_status column');

        // Migrate data: convert paid (INTEGER 0/1) to payment_status (TEXT)
        oldData.forEach(row => {
          const status = row.paid === 1 ? 'paid' : 'pending';
          db.prepare('UPDATE listings SET payment_status = ? WHERE id = ?').run(status, row.id);
        });

        console.log(`✓ Migrated ${oldData.length} listings to new schema`);
      } catch (migrateError) {
        console.error('❌ Migration error:', migrateError.message);
        // Don't throw - continue anyway so server can start
      }
    }

    // Migration scenario: Fresh database or missing payment_status
    if (!hasPaymentStatus && !hasPaid) {
      console.log('⚠️  Adding payment_status column to listings table...');
      try {
        db.exec('ALTER TABLE listings ADD COLUMN payment_status TEXT DEFAULT "pending"');
        console.log('✓ Added payment_status column');
      } catch (addError) {
        console.error('❌ Error adding payment_status:', addError.message);
      }
    }

    // Final check: ensure payment_status exists now
    const finalTableInfo = db.prepare("PRAGMA table_info(listings)").all();
    const finalColumns = finalTableInfo.map(col => col.name);
    if (finalColumns.includes('payment_status')) {
      console.log('✓ Listings table schema verified');
    } else {
      console.error('❌ WARNING: payment_status column missing after migration attempts');
    }
  } catch (migrationError) {
    console.error('❌ Migration check error:', migrationError.message);
    // Don't throw - let server continue
  }

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
