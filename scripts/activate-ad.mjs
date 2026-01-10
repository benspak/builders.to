/**
 * Script to manually activate an advertisement that paid but didn't get activated
 *
 * Usage:
 *   node scripts/activate-ad.mjs AD_ID [AD_ID2 ...]
 *
 * Examples:
 *   node scripts/activate-ad.mjs cmk7wa5ss001jov2hfibddya4
 *   node scripts/activate-ad.mjs cmk7wa5ss001jov2hfibddya4 cmk0nwv7l0004h42hqdu5l2dc
 *   node scripts/activate-ad.mjs --list
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SIDEBAR_AD_DURATION_DAYS = 30;

async function activateAd(adId) {
  const ad = await prisma.advertisement.findUnique({
    where: { id: adId },
    include: {
      user: { select: { name: true, email: true } }
    }
  });

  if (!ad) {
    console.error(`❌ Ad not found: ${adId}`);
    return false;
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  ID:       ${ad.id}`);
  console.log(`  Title:    ${ad.title}`);
  console.log(`  Status:   ${ad.status}`);
  console.log(`  Link:     ${ad.linkUrl}`);
  console.log(`  User:     ${ad.user.name || '(no name)'}`);
  console.log(`  Email:    ${ad.user.email || '(no email)'}`);

  if (ad.status === 'ACTIVE') {
    console.log(`  ⚠️  Already active (ends: ${ad.endDate?.toISOString()})`);
    return true;
  }

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
  return true;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Please provide ad ID(s) or --list');
    console.log('   Usage: node scripts/activate-ad.mjs AD_ID [AD_ID2 ...]');
    console.log('   Or:    node scripts/activate-ad.mjs --list');
    process.exit(1);
  }

  if (args[0] === '--list') {
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
      console.log(`  Email:    ${ad.user.email || '(no email)'}`);
      console.log(`  Created:  ${ad.createdAt.toISOString()}`);
      console.log(`  Stripe:   ${ad.stripeSessionId || '(none)'}`);
    });
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    console.log('To activate ads, run:');
    console.log('  node scripts/activate-ad.mjs AD_ID [AD_ID2 ...]\n');
    return;
  }

  // Activate ads by ID
  console.log(`\n📢 Activating ${args.length} ad(s):\n`);

  let activated = 0;
  for (const adId of args) {
    if (await activateAd(adId)) {
      activated++;
    }
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`✅ Done! Activated ${activated}/${args.length} ad(s)\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
