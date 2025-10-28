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

const config = {
  connectionString: connectionString,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
};

const pool = new Pool(config);

const makeListingFeatured = async (slug) => {
  const client = await pool.connect();

  try {
    console.log(`🔍 Looking for listing with slug: ${slug}`);

    // First, find the listing
    const findResult = await client.query(
      'SELECT id, title, payment_status, is_featured FROM listings WHERE slug = $1',
      [slug]
    );

    if (findResult.rows.length === 0) {
      console.error(`❌ Listing with slug "${slug}" not found`);
      process.exit(1);
    }

    const listing = findResult.rows[0];
    console.log(`✓ Found listing: ${listing.title}`);
    console.log(`  Current payment_status: ${listing.payment_status}`);
    console.log(`  Current is_featured: ${listing.is_featured}`);

    // Update the listing to be paid and featured
    const updateResult = await client.query(
      `UPDATE listings
       SET payment_status = 'featured', is_featured = 1, updated_at = CURRENT_TIMESTAMP
       WHERE slug = $1
       RETURNING id, title, payment_status, is_featured`,
      [slug]
    );

    console.log('\n✅ Listing updated successfully!');
    console.log(`  New payment_status: ${updateResult.rows[0].payment_status}`);
    console.log(`  New is_featured: ${updateResult.rows[0].is_featured}`);

  } catch (error) {
    console.error('❌ Error updating listing:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

// Get slug from command line arguments or use default
const slug = process.argv[2] || 'co-founder-community-building-outreach';

console.log(`\n🚀 Making listing featured...\n`);
makeListingFeatured(slug);
