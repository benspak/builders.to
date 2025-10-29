import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_DATABASE_URL || 'postgresql://localhost:5432/builders';
const pool = new Pool({
  connectionString: connectionString,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function makeUserAdmin(identifier) {
  try {
    // Try to find user by username or email
    const result = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $1', [identifier]);

    if (result.rows.length === 0) {
      console.log(`User '${identifier}' not found`);
      process.exit(1);
    }

    const user = result.rows[0];

    // Update user to admin
    await pool.query('UPDATE users SET is_admin = TRUE WHERE id = $1', [user.id]);

    console.log(`✓ User '${user.email}' (ID: ${user.id}, Username: ${user.username || 'N/A'}) is now an admin`);
    process.exit(0);
  } catch (error) {
    console.error('Error making user admin:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

const identifier = process.argv[2];
if (!identifier) {
  console.log('Usage: node makeAdmin.js <username-or-email>');
  process.exit(1);
}

makeUserAdmin(identifier);
