/**
 * Script to manually activate an advertisement that paid but didn't get activated
 *
 * Usage:
 *   node scripts/activate-ad.mjs EMAIL
 *
 * Examples:
 *   node scripts/activate-ad.mjs user@example.com
 *   node scripts/activate-ad.mjs --list
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SIDEBAR_AD_DURATION_DAYS = 30;

async function main() {
  const arg1 = process.argv[2];

  if (!arg1) {
    console.error('❌ Please provide an email address or --list');
    console.log('   Usage: node scripts/activate-ad.mjs EMAIL');
    console.log('   Or:    node scripts/activate-ad.mjs --list');
    process.exit(1);
  }

  if (arg1 === '--list') {
    // List all pending or draft ads
    const ads = await prisma.advertisement.findMany({
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

    if (ads.length === 0) {
      console.log('✅ No pending advertisements found.');
      return;
    }

    console.log(`\n📋 Found ${ads.length} pending advertisement(s):\n`);
    ads.forEach(ad => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`  ID:       ${ad.id}`);
      console.log(`  Title:    ${ad.title}`);
      console.log(`  Status:   ${ad.status}`);
      console.log(`  Link:     ${ad.linkUrl}`);
      console.log(`  User:     ${ad.user.name || '(no name)'}`);
      console.log(`  Email:    ${ad.user.email}`);
      console.log(`  Created:  ${ad.createdAt.toISOString()}`);
      console.log(`  Stripe:   ${ad.stripeSessionId || '(none)'}`);
    });
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    console.log('To activate an ad by email, run:');
    console.log('  node scripts/activate-ad.mjs EMAIL\n');
    return;
  }

  // Find user by email
  const email = arg1;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true }
  });

  if (!user) {
    console.error(`❌ User not found with email: ${email}`);
    process.exit(1);
  }

  console.log(`\n👤 Found user: ${user.name || user.email}`);

  // Find pending ads for this user
  const ads = await prisma.advertisement.findMany({
    where: {
      userId: user.id,
      status: { in: ['PENDING_PAYMENT', 'DRAFT'] }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (ads.length === 0) {
    console.log(`\n⚠️  No pending ads found for ${email}`);

    // Check if they have any ads at all
    const allAds = await prisma.advertisement.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    if (allAds.length > 0) {
      console.log(`\nUser has ${allAds.length} ad(s):`);
      allAds.forEach(ad => {
        console.log(`  - ${ad.title} (${ad.status})`);
      });
    }
    return;
  }

  console.log(`\n📢 Found ${ads.length} pending ad(s) to activate:\n`);

  for (const ad of ads) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`  ID:       ${ad.id}`);
    console.log(`  Title:    ${ad.title}`);
    console.log(`  Status:   ${ad.status}`);
    console.log(`  Link:     ${ad.linkUrl}`);

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + SIDEBAR_AD_DURATION_DAYS);

    await prisma.advertisement.update({
      where: { id: ad.id },
      data: {
        status: 'ACTIVE',
        startDate: now,
        endDate: endDate,
      },
    });

    console.log(`  ✅ ACTIVATED!`);
    console.log(`  Start:    ${now.toISOString()}`);
    console.log(`  End:      ${endDate.toISOString()} (${SIDEBAR_AD_DURATION_DAYS} days)`);
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`✅ Activated ${ads.length} ad(s) for ${email}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
