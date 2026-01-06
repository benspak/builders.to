/**
 * Script to manually activate a service listing that paid but didn't get activated
 *
 * Usage:
 *   node scripts/activate-service-listing.mjs SERVICE_ID
 *
 * Or to list all pending listings:
 *   node scripts/activate-service-listing.mjs --list
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SERVICE_LISTING_DURATION_DAYS = 90;

async function main() {
  const arg1 = process.argv[2];

  if (!arg1) {
    console.error('❌ Please provide a service ID or --list');
    console.log('   Usage: node scripts/activate-service-listing.mjs SERVICE_ID');
    console.log('   Or:    node scripts/activate-service-listing.mjs --list');
    process.exit(1);
  }

  if (arg1 === '--list') {
    // List all pending or draft listings
    const listings = await prisma.serviceListing.findMany({
      where: {
        status: { in: ['PENDING_PAYMENT', 'DRAFT'] }
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (listings.length === 0) {
      console.log('✅ No pending listings found.');
      return;
    }

    console.log(`\n📋 Found ${listings.length} pending listing(s):\n`);
    listings.forEach(listing => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`  ID:       ${listing.id}`);
      console.log(`  Title:    ${listing.title}`);
      console.log(`  Status:   ${listing.status}`);
      console.log(`  Price:    $${(listing.priceInCents / 100).toFixed(2)}`);
      console.log(`  Seller:   ${listing.user.name || listing.user.email}`);
      console.log(`  Created:  ${listing.createdAt.toISOString()}`);
      console.log(`  Stripe:   ${listing.stripeSessionId || '(none)'}`);
    });
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    console.log('To activate a listing, run:');
    console.log('  node scripts/activate-service-listing.mjs SERVICE_ID\n');
    return;
  }

  // Activate a specific listing
  const serviceId = arg1;

  const listing = await prisma.serviceListing.findUnique({
    where: { id: serviceId },
    include: {
      user: { select: { name: true, email: true } }
    }
  });

  if (!listing) {
    console.error('❌ Service listing not found');
    process.exit(1);
  }

  console.log(`\n📦 Found listing:`);
  console.log(`  Title:   ${listing.title}`);
  console.log(`  Status:  ${listing.status}`);
  console.log(`  Seller:  ${listing.user.name || listing.user.email}`);

  if (listing.status === 'ACTIVE') {
    console.log('\n✅ This listing is already active!');
    return;
  }

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + SERVICE_LISTING_DURATION_DAYS);

  await prisma.serviceListing.update({
    where: { id: serviceId },
    data: {
      status: 'ACTIVE',
      activatedAt: now,
      expiresAt: expiresAt,
    },
  });

  console.log(`\n✅ Listing activated!`);
  console.log(`  Activated: ${now.toISOString()}`);
  console.log(`  Expires:   ${expiresAt.toISOString()} (${SERVICE_LISTING_DURATION_DAYS} days)\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
