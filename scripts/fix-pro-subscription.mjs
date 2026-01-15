#!/usr/bin/env node

/**
 * Script to manually fix a Pro subscription that failed to activate via webhook
 * 
 * Usage:
 *   node scripts/fix-pro-subscription.mjs --list                    # List all users
 *   node scripts/fix-pro-subscription.mjs <userId>                  # Fix subscription for user
 *   node scripts/fix-pro-subscription.mjs <userId> --from-stripe    # Fetch details from Stripe
 */

import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});

const PRO_TOKENS_PER_MONTH = 50;

async function listUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      slug: true,
      tokenBalance: true,
      proSubscription: {
        select: {
          status: true,
          plan: true,
          stripeSubscriptionId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  console.log("\nRecent users:");
  console.log("=".repeat(100));
  
  for (const user of users) {
    const proStatus = user.proSubscription?.status || "NONE";
    const proPlan = user.proSubscription?.plan || "-";
    console.log(
      `${user.id} | ${(user.name || user.email || "No name").padEnd(25)} | ` +
      `Pro: ${proStatus.padEnd(10)} | Plan: ${proPlan.padEnd(8)} | ` +
      `Tokens: ${user.tokenBalance}`
    );
  }
  
  console.log("\nTo fix a subscription: node scripts/fix-pro-subscription.mjs <userId>");
}

async function findStripeSubscription(userId, email) {
  console.log("\nSearching Stripe for subscriptions...");
  
  // Search by customer email
  const customers = await stripe.customers.list({
    email: email,
    limit: 10,
  });

  for (const customer of customers.data) {
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
      limit: 10,
    });

    for (const sub of subscriptions.data) {
      console.log(`Found subscription: ${sub.id}`);
      console.log(`  Customer: ${customer.id}`);
      console.log(`  Status: ${sub.status}`);
      console.log(`  Price: ${sub.items.data[0]?.price?.id}`);
      console.log(`  Period: ${new Date(sub.current_period_start * 1000).toISOString()} - ${new Date(sub.current_period_end * 1000).toISOString()}`);
      console.log(`  Metadata: ${JSON.stringify(sub.metadata)}`);
      
      return {
        subscriptionId: sub.id,
        customerId: customer.id,
        priceId: sub.items.data[0]?.price?.id,
        periodStart: new Date(sub.current_period_start * 1000),
        periodEnd: new Date(sub.current_period_end * 1000),
      };
    }
  }

  return null;
}

async function fixSubscription(userId, fromStripe = false) {
  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      tokenBalance: true,
      proSubscription: true,
    },
  });

  if (!user) {
    console.error(`User ${userId} not found`);
    process.exit(1);
  }

  console.log(`\nUser: ${user.name || user.email}`);
  console.log(`Email: ${user.email}`);
  console.log(`Current token balance: ${user.tokenBalance}`);
  console.log(`Current Pro status: ${user.proSubscription?.status || "NONE"}`);

  let stripeData = null;

  if (fromStripe && user.email) {
    stripeData = await findStripeSubscription(userId, user.email);
    
    if (!stripeData) {
      console.error("\nNo active Stripe subscription found for this user's email");
      console.log("You can manually specify subscription details or check Stripe dashboard");
      process.exit(1);
    }
  }

  // Determine plan type based on price ID
  const monthlyPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
  const yearlyPriceId = process.env.STRIPE_PRO_YEARLY_PRICE_ID;
  
  let plan = "MONTHLY";
  if (stripeData?.priceId === yearlyPriceId) {
    plan = "YEARLY";
  }

  // Default period (1 month from now if not from Stripe)
  const now = new Date();
  const periodStart = stripeData?.periodStart || now;
  const periodEnd = stripeData?.periodEnd || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  console.log(`\nActivating Pro subscription:`);
  console.log(`  Plan: ${plan}`);
  console.log(`  Period: ${periodStart.toISOString()} - ${periodEnd.toISOString()}`);

  // Create or update ProSubscription
  await prisma.proSubscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: stripeData?.customerId || null,
      stripeSubscriptionId: stripeData?.subscriptionId || `manual_${Date.now()}`,
      stripePriceId: stripeData?.priceId || null,
      status: "ACTIVE",
      plan: plan,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      lastTokenGrantAt: now,
    },
    update: {
      stripeCustomerId: stripeData?.customerId || undefined,
      stripeSubscriptionId: stripeData?.subscriptionId || undefined,
      stripePriceId: stripeData?.priceId || undefined,
      status: "ACTIVE",
      plan: plan,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      lastTokenGrantAt: now,
    },
  });

  console.log(`  ✅ Pro subscription activated`);

  // Grant tokens
  await prisma.$transaction(async (tx) => {
    // Create token transaction
    await tx.tokenTransaction.create({
      data: {
        userId,
        amount: PRO_TOKENS_PER_MONTH,
        type: "PRO_SUBSCRIPTION_GRANT",
        description: "Monthly Pro subscription token grant (manual fix)",
        metadata: {
          manualFix: true,
          fixedAt: now.toISOString(),
        },
      },
    });

    // Update user balance
    await tx.user.update({
      where: { id: userId },
      data: {
        tokenBalance: { increment: PRO_TOKENS_PER_MONTH },
        lifetimeTokensEarned: { increment: PRO_TOKENS_PER_MONTH },
      },
    });
  });

  console.log(`  ✅ Granted ${PRO_TOKENS_PER_MONTH} tokens`);

  // Verify
  const updated = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      tokenBalance: true,
      proSubscription: {
        select: { status: true, plan: true },
      },
    },
  });

  console.log(`\nVerification:`);
  console.log(`  Pro Status: ${updated.proSubscription?.status}`);
  console.log(`  Plan: ${updated.proSubscription?.plan}`);
  console.log(`  Token Balance: ${updated.tokenBalance}`);
  console.log(`\n✅ Done!`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--list") {
    await listUsers();
  } else {
    const userId = args[0];
    const fromStripe = args.includes("--from-stripe");
    await fixSubscription(userId, fromStripe);
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Error:", error);
  prisma.$disconnect();
  process.exit(1);
});
