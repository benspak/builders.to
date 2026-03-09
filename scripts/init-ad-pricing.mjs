#!/usr/bin/env node

/**
 * Initialize Ad Pricing Configuration
 *
 * Base price for ads is $5/month (tier 0). This script sets the current tier
 * based on how many active ads exist: tier 0 when fewer than 8 slots are filled,
 * tier 1 when 8+ are filled, etc.
 *
 * Pricing tiers:
 * - Tier 0: $5 (base)
 * - Tier 1: $10 (after first 8 slots fill)
 * - Tier 2: $20 (after slots fill again)
 * - etc.
 *
 * Run: node scripts/init-ad-pricing.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PLATFORM_AD_SLOTS = 8;

async function initAdPricing() {
  console.log('🚀 Initializing Ad Pricing Configuration...\n');

  try {
    // Count current active ads
    const now = new Date();
    const activeAdsCount = await prisma.advertisement.count({
      where: {
        status: 'ACTIVE',
        startDate: { lte: now },
        endDate: { gt: now },
      },
    });

    console.log(`📊 Current active ads: ${activeAdsCount}`);
    console.log(`📊 Platform ad slots: ${PLATFORM_AD_SLOTS}`);

    // Calculate initial tier based on how many times slots have filled
    // If we have 10 ads and 8 slots, we've filled up once, so tier 1
    const initialTier = activeAdsCount >= PLATFORM_AD_SLOTS ? 1 : 0;

    // Calculate current price
    const currentPrice = 5 * Math.pow(2, initialTier);

    console.log(`\n💰 Setting initial pricing tier: ${initialTier} ($${currentPrice}/mo)`);

    // Check if config already exists
    const existingConfig = await prisma.adPricingConfig.findUnique({
      where: { id: 'singleton' },
    });

    if (existingConfig) {
      console.log(`\n⚠️  AdPricingConfig already exists:`);
      console.log(`   Current tier: ${existingConfig.currentTier}`);
      console.log(`   Last updated: ${existingConfig.lastUpdated}`);

      // Update to the calculated tier
      const updated = await prisma.adPricingConfig.update({
        where: { id: 'singleton' },
        data: { currentTier: initialTier },
      });

      console.log(`\n✅ Updated pricing tier to: ${updated.currentTier}`);
    } else {
      // Create new config
      const created = await prisma.adPricingConfig.create({
        data: {
          id: 'singleton',
          currentTier: initialTier,
        },
      });

      console.log(`\n✅ Created AdPricingConfig with tier: ${created.currentTier}`);
    }

    // Show summary
    console.log('\n📋 Summary:');
    console.log('   ─────────────────────────────────────');
    console.log(`   Active ads:        ${activeAdsCount}`);
    console.log(`   Available slots:   ${Math.max(0, PLATFORM_AD_SLOTS - activeAdsCount)}`);
    console.log(`   Pricing tier:      ${initialTier}`);
    console.log(`   Current price:     $${currentPrice}/month`);
    console.log(`   Next tier price:   $${currentPrice * 2}/month`);
    console.log('   ─────────────────────────────────────');

    // List active ads
    console.log('\n📢 Current Active Ads:');
    const activeAds = await prisma.advertisement.findMany({
      where: {
        status: 'ACTIVE',
        startDate: { lte: now },
        endDate: { gt: now },
      },
      select: {
        id: true,
        title: true,
        amountPaid: true,
        startDate: true,
        endDate: true,
        user: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { endDate: 'asc' },
    });

    activeAds.forEach((ad, i) => {
      const daysLeft = Math.ceil((ad.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`   ${i + 1}. "${ad.title}" by @${ad.user?.slug || 'unknown'}`);
      console.log(`      Paid: $${(ad.amountPaid / 100).toFixed(2)} | Expires in ${daysLeft} days`);
    });

    console.log('\n✨ Ad pricing initialization complete!\n');

  } catch (error) {
    console.error('❌ Error initializing ad pricing:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initAdPricing();
