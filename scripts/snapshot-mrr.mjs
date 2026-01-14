#!/usr/bin/env node

/**
 * MRR Snapshot Script
 *
 * This script should be run at the start and end of each quarter to:
 * 1. Pull MRR data from Stripe Connect accounts
 * 2. Store snapshots for betting resolution
 *
 * Usage:
 *   node scripts/snapshot-mrr.mjs start  - Capture quarter start MRR
 *   node scripts/snapshot-mrr.mjs end    - Capture quarter end MRR
 *
 * Schedule with cron:
 *   0 0 1 1,4,7,10 * node scripts/snapshot-mrr.mjs start  # Start of Q1-Q4
 *   59 23 31 3,6,9,12 * node scripts/snapshot-mrr.mjs end # End of Q1-Q4
 */

import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});

/**
 * Get current quarter string
 */
function getCurrentQuarter() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  return `${year}-Q${quarter}`;
}

/**
 * Fetch MRR from a Stripe Connect account
 */
async function fetchMrrFromStripe(stripeConnectId) {
  try {
    const subscriptions = await stripe.subscriptions.list(
      { status: "active", limit: 100 },
      { stripeAccount: stripeConnectId }
    );

    let totalMrrCents = 0;

    for (const subscription of subscriptions.data) {
      for (const item of subscription.items.data) {
        const price = item.price;
        const quantity = item.quantity || 1;

        if (!price.unit_amount) continue;

        let monthlyAmount = price.unit_amount * quantity;

        if (price.recurring) {
          switch (price.recurring.interval) {
            case "day":
              monthlyAmount = monthlyAmount * 30;
              break;
            case "week":
              monthlyAmount = monthlyAmount * 4;
              break;
            case "month":
              break;
            case "year":
              monthlyAmount = Math.round(monthlyAmount / 12);
              break;
          }

          if (price.recurring.interval_count > 1 && price.recurring.interval !== "year") {
            monthlyAmount = Math.round(monthlyAmount / price.recurring.interval_count);
          }
        }

        totalMrrCents += monthlyAmount;
      }
    }

    // Handle pagination
    let hasMore = subscriptions.has_more;
    let lastId = subscriptions.data[subscriptions.data.length - 1]?.id;

    while (hasMore && lastId) {
      const more = await stripe.subscriptions.list(
        { status: "active", limit: 100, starting_after: lastId },
        { stripeAccount: stripeConnectId }
      );

      for (const subscription of more.data) {
        for (const item of subscription.items.data) {
          const price = item.price;
          const quantity = item.quantity || 1;

          if (!price.unit_amount) continue;

          let monthlyAmount = price.unit_amount * quantity;

          if (price.recurring) {
            switch (price.recurring.interval) {
              case "day":
                monthlyAmount = monthlyAmount * 30;
                break;
              case "week":
                monthlyAmount = monthlyAmount * 4;
                break;
              case "month":
                break;
              case "year":
                monthlyAmount = Math.round(monthlyAmount / 12);
                break;
            }

            if (price.recurring.interval_count > 1 && price.recurring.interval !== "year") {
              monthlyAmount = Math.round(monthlyAmount / price.recurring.interval_count);
            }
          }

          totalMrrCents += monthlyAmount;
        }
      }

      hasMore = more.has_more;
      lastId = more.data[more.data.length - 1]?.id;
    }

    return totalMrrCents;
  } catch (error) {
    console.error(`Error fetching MRR from ${stripeConnectId}:`, error.message);
    return null;
  }
}

/**
 * Save MRR snapshot
 */
async function saveMrrSnapshot(targetType, targetId, mrrCents, quarter, isStartSnapshot) {
  await prisma.mrrSnapshot.upsert({
    where: {
      targetType_targetId_quarter_isStartSnapshot: {
        targetType,
        targetId,
        quarter,
        isStartSnapshot,
      },
    },
    create: {
      targetType,
      targetId,
      mrrCents,
      quarter,
      isStartSnapshot,
      snapshotAt: new Date(),
    },
    update: {
      mrrCents,
      snapshotAt: new Date(),
    },
  });
}

/**
 * Snapshot all bettable companies
 */
async function snapshotCompanies(quarter, isStartSnapshot) {
  console.log("\n📊 Snapshotting companies...");

  const companies = await prisma.company.findMany({
    where: {
      bettingEnabled: true,
      stripeConnectId: { not: null },
      stripeConnectOnboarded: true,
    },
    select: {
      id: true,
      name: true,
      stripeConnectId: true,
    },
  });

  console.log(`   Found ${companies.length} bettable companies`);

  let success = 0;
  let failed = 0;

  for (const company of companies) {
    console.log(`   📍 ${company.name}...`);

    const mrr = await fetchMrrFromStripe(company.stripeConnectId);

    if (mrr !== null) {
      await saveMrrSnapshot("COMPANY", company.id, mrr, quarter, isStartSnapshot);
      console.log(`      ✅ MRR: $${(mrr / 100).toFixed(2)}`);
      success++;
    } else {
      console.log(`      ❌ Failed to fetch MRR`);
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Snapshot all bettable users (founders)
 */
async function snapshotUsers(quarter, isStartSnapshot) {
  console.log("\n👤 Snapshotting users...");

  const users = await prisma.user.findMany({
    where: {
      bettingEnabled: true,
    },
    select: {
      id: true,
      name: true,
      displayName: true,
      stripeConnectId: true,
      stripeConnectOnboarded: true,
      companies: {
        where: {
          stripeConnectId: { not: null },
          stripeConnectOnboarded: true,
        },
        select: {
          id: true,
          stripeConnectId: true,
        },
      },
    },
  });

  console.log(`   Found ${users.length} bettable users`);

  let success = 0;
  let failed = 0;

  for (const user of users) {
    const name = user.displayName || user.name || "Unknown";
    console.log(`   📍 ${name}...`);

    let totalMrr = 0;
    let hasMrr = false;

    // User's own Stripe Connect
    if (user.stripeConnectId && user.stripeConnectOnboarded) {
      const mrr = await fetchMrrFromStripe(user.stripeConnectId);
      if (mrr !== null) {
        totalMrr += mrr;
        hasMrr = true;
      }
    }

    // Sum company MRRs
    for (const company of user.companies) {
      if (company.stripeConnectId) {
        const mrr = await fetchMrrFromStripe(company.stripeConnectId);
        if (mrr !== null) {
          totalMrr += mrr;
          hasMrr = true;
        }
      }
    }

    if (hasMrr) {
      await saveMrrSnapshot("USER", user.id, totalMrr, quarter, isStartSnapshot);
      console.log(`      ✅ Total MRR: $${(totalMrr / 100).toFixed(2)}`);
      success++;
    } else {
      console.log(`      ⚠️ No MRR data available`);
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Main snapshot function
 */
async function takeSnapshot(isStart) {
  const quarter = getCurrentQuarter();
  const snapshotType = isStart ? "START" : "END";

  console.log(`\n🎯 Taking ${snapshotType} snapshot for ${quarter}\n`);
  console.log(`   Time: ${new Date().toISOString()}`);

  const companyStats = await snapshotCompanies(quarter, isStart);
  const userStats = await snapshotUsers(quarter, isStart);

  console.log(`\n✅ Snapshot complete!`);
  console.log(`   Companies: ${companyStats.success} success, ${companyStats.failed} failed`);
  console.log(`   Users: ${userStats.success} success, ${userStats.failed} failed\n`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const snapshotType = args[0]?.toLowerCase();

if (!snapshotType || !["start", "end"].includes(snapshotType)) {
  console.log("Usage: node scripts/snapshot-mrr.mjs [start|end]");
  console.log("  start - Capture quarter start MRR");
  console.log("  end   - Capture quarter end MRR");
  process.exit(1);
}

takeSnapshot(snapshotType === "start")
  .catch(console.error)
  .finally(() => prisma.$disconnect());
