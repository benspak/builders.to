/**
 * Script to manually activate a local listing that paid but didn't get activated
 *
 * Usage:
 *   node scripts/activate-local-listing.mjs LISTING_ID
 *
 * Or to list all pending listings:
 *   node scripts/activate-local-listing.mjs --list
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const LISTING_DURATION_DAYS = 90; // Services category

async function main() {
  const arg1 = process.argv[2];

  if (!arg1) {
    console.error('❌ Please provide a listing ID or --list');
    console.log('   Usage: node scripts/activate-local-listing.mjs LISTING_ID');
    console.log('   Or:    node scripts/activate-local-listing.mjs --list');
    process.exit(1);
  }

  if (arg1 === '--list') {
    // List all pending or draft listings
    const listings = await prisma.localListing.findMany({
      where: {
        status: { in: ['PENDING_PAYMENT', 'DRAFT'] },
        category: 'SERVICES', // Only paid listings need manual activation
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (listings.length === 0) {
      console.log('✅ No pending paid listings found.');
      return;
    }

    console.log(`\n📋 Found ${listings.length} pending listing(s):\n`);
    listings.forEach(listing => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`  ID:       ${listing.id}`);
      console.log(`  Title:    ${listing.title}`);
      console.log(`  Category: ${listing.category}`);
      console.log(`  Status:   ${listing.status}`);
      console.log(`  Location: ${listing.city}, ${listing.state}`);
      console.log(`  Poster:   ${listing.user.name || listing.user.email}`);
      console.log(`  Created:  ${listing.createdAt.toISOString()}`);
      console.log(`  Stripe:   ${listing.stripeSessionId || '(none)'}`);
    });
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    console.log('To activate a listing, run:');
    console.log('  node scripts/activate-local-listing.mjs LISTING_ID\n');
    return;
  }

  // Activate a specific listing
  const listingId = arg1;

  const listing = await prisma.localListing.findUnique({
    where: { id: listingId },
    include: {
      user: { select: { name: true, email: true } }
    }
  });

  if (!listing) {
    console.error('❌ Local listing not found');
    process.exit(1);
  }

  console.log(`\n📦 Found listing:`);
  console.log(`  Title:    ${listing.title}`);
  console.log(`  Category: ${listing.category}`);
  console.log(`  Status:   ${listing.status}`);
  console.log(`  Poster:   ${listing.user.name || listing.user.email}`);

  if (listing.status === 'ACTIVE') {
    console.log('\n✅ This listing is already active!');
    return;
  }

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + LISTING_DURATION_DAYS);

  await prisma.localListing.update({
    where: { id: listingId },
    data: {
      status: 'ACTIVE',
      activatedAt: now,
      expiresAt: expiresAt,
    },
  });

  console.log(`\n✅ Listing activated!`);
  console.log(`  Activated: ${now.toISOString()}`);
  console.log(`  Expires:   ${expiresAt.toISOString()} (${LISTING_DURATION_DAYS} days)\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
