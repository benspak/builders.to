/**
 * Script to check how many active advertisements there are
 *
 * Usage:
 *   node scripts/check-active-ads.mjs
 *   node scripts/check-active-ads.mjs --detailed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const detailed = args.includes('--detailed');

  const now = new Date();

  // Get all ads grouped by status
  const allAds = await prisma.advertisement.groupBy({
    by: ['status'],
    _count: { id: true },
  });

  // Get active ads (status = ACTIVE and within date range)
  const activeAds = await prisma.advertisement.findMany({
    where: {
      status: 'ACTIVE',
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: {
      user: { select: { name: true, email: true } },
      _count: {
        select: {
          views: true,
          clicks: true,
        },
      },
    },
    orderBy: { endDate: 'asc' },
  });

  // Get ads that are ACTIVE status but expired (endDate passed)
  const expiredButActive = await prisma.advertisement.count({
    where: {
      status: 'ACTIVE',
      endDate: { lt: now },
    },
  });

  // Summary
  console.log(`\n📊 Advertisement Summary\n`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Status Breakdown:`);

  const statusCounts = {};
  allAds.forEach(({ status, _count }) => {
    statusCounts[status] = _count.id;
    console.log(`  ${status.padEnd(16)} ${_count.id}`);
  });

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  console.log(`  ${'─'.repeat(24)}`);
  console.log(`  ${'TOTAL'.padEnd(16)} ${total}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  console.log(`🟢 Currently Active Ads: ${activeAds.length}`);

  if (expiredButActive > 0) {
    console.log(`⚠️  Expired but still marked ACTIVE: ${expiredButActive}`);
  }

  if (activeAds.length === 0) {
    console.log(`\n   No active advertisements right now.\n`);
    return;
  }

  // Show ads expiring soon
  const expiringIn7Days = activeAds.filter(ad => {
    const daysLeft = Math.ceil((ad.endDate - now) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7;
  });

  if (expiringIn7Days.length > 0) {
    console.log(`\n⏰ Expiring in 7 days or less: ${expiringIn7Days.length}`);
  }

  if (detailed || activeAds.length <= 10) {
    console.log(`\n📋 Active Ads:\n`);

    activeAds.forEach((ad, index) => {
      const daysLeft = Math.ceil((ad.endDate - now) / (1000 * 60 * 60 * 24));
      const ctr = ad._count.views > 0
        ? ((ad._count.clicks / ad._count.views) * 100).toFixed(2)
        : '0.00';

      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`  #${index + 1}`);
      console.log(`  ID:       ${ad.id}`);
      console.log(`  Title:    ${ad.title}`);
      console.log(`  Link:     ${ad.linkUrl}`);
      console.log(`  User:     ${ad.user.name || '(no name)'} (${ad.user.email || 'no email'})`);
      console.log(`  Started:  ${ad.startDate?.toISOString().split('T')[0]}`);
      console.log(`  Ends:     ${ad.endDate?.toISOString().split('T')[0]} (${daysLeft} days left)`);
      console.log(`  Views:    ${ad._count.views}`);
      console.log(`  Clicks:   ${ad._count.clicks}`);
      console.log(`  CTR:      ${ctr}%`);
    });
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  } else {
    console.log(`\n   Use --detailed to see all active ads.\n`);
  }

  // Total revenue from active ads
  const totalRevenue = activeAds.reduce((sum, ad) => sum + ad.amountPaid, 0);
  console.log(`💰 Revenue from active ads: $${(totalRevenue / 100).toFixed(2)}`);

  // Total views and clicks
  const totalViews = activeAds.reduce((sum, ad) => sum + ad._count.views, 0);
  const totalClicks = activeAds.reduce((sum, ad) => sum + ad._count.clicks, 0);
  const overallCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0.00';

  console.log(`👁️  Total views: ${totalViews}`);
  console.log(`🖱️  Total clicks: ${totalClicks}`);
  console.log(`📈 Overall CTR: ${overallCtr}%\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
