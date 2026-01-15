#!/usr/bin/env node

/**
 * Script to manually fix a Pro subscription from a Stripe checkout session ID
 * 
 * Usage:
 *   node scripts/fix-from-session.mjs <session_id>
 * 
 * Example:
 *   node scripts/fix-from-session.mjs cs_live_a1bRRI7BIYBC1UjHlcvapnoqEPaUidDGLL3eKPrZhjaj4l1FJUS8ePzo5a
 */

import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});

const PRO_TOKENS_PER_MONTH = 50;

async function fixFromSession(sessionId) {
  console.log(`\nLooking up checkout session: ${sessionId}`);
  
  // Retrieve the checkout session from Stripe
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });
  } catch (error) {
    console.error(`Failed to retrieve session: ${error.message}`);
    process.exit(1);
  }

  console.log(`\nCheckout Session Details:`);
  console.log(`  Status: ${session.status}`);
  console.log(`  Payment Status: ${session.payment_status}`);
  console.log(`  Customer Email: ${session.customer_details?.email || session.customer_email}`);
  console.log(`  Metadata: ${JSON.stringify(session.metadata)}`);

  if (session.payment_status !== "paid") {
    console.error(`\n❌ Payment not completed. Status: ${session.payment_status}`);
    process.exit(1);
  }

  // Get user ID from metadata
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan || "MONTHLY";

  if (!userId) {
    console.error(`\n❌ No userId found in session metadata`);
    console.log(`\nYou'll need to find the user manually.`);
    console.log(`Customer email: ${session.customer_details?.email || session.customer_email}`);
    
    // Try to find user by email
    const email = session.customer_details?.email || session.customer_email;
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true },
      });
      
      if (user) {
        console.log(`\nFound user by email:`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Name: ${user.name}`);
        console.log(`\nRun again with: node scripts/fix-pro-subscription.mjs ${user.id} --from-stripe`);
      }
    }
    process.exit(1);
  }

  // Get subscription details
  const subscription = session.subscription;
  if (!subscription || typeof subscription === "string") {
    console.error(`\n❌ Could not expand subscription details`);
    
    // Try to retrieve it directly
    if (session.subscription) {
      const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
      console.log(`\nAttempting to retrieve subscription: ${subId}`);
      
      try {
        const sub = await stripe.subscriptions.retrieve(subId);
        await processSubscription(userId, plan, sub, session.customer);
      } catch (err) {
        console.error(`Failed to retrieve subscription: ${err.message}`);
        process.exit(1);
      }
    }
    return;
  }

  await processSubscription(userId, plan, subscription, session.customer);
}

async function processSubscription(userId, plan, subscription, customer) {
  console.log(`\nSubscription Details:`);
  console.log(`  ID: ${subscription.id}`);
  console.log(`  Status: ${subscription.status}`);
  console.log(`  Period Start: ${new Date(subscription.current_period_start * 1000).toISOString()}`);
  console.log(`  Period End: ${new Date(subscription.current_period_end * 1000).toISOString()}`);

  // Get user
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
    console.error(`\n❌ User ${userId} not found in database`);
    process.exit(1);
  }

  console.log(`\nUser Details:`);
  console.log(`  ID: ${user.id}`);
  console.log(`  Name: ${user.name}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Current Token Balance: ${user.tokenBalance}`);
  console.log(`  Current Pro Status: ${user.proSubscription?.status || "NONE"}`);

  const customerId = typeof customer === "string" ? customer : customer?.id;
  const now = new Date();

  // Create or update ProSubscription
  console.log(`\n⏳ Activating Pro subscription...`);
  
  await prisma.proSubscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price?.id,
      status: "ACTIVE",
      plan: plan,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      lastTokenGrantAt: now,
    },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price?.id,
      status: "ACTIVE",
      plan: plan,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      lastTokenGrantAt: now,
    },
  });

  console.log(`  ✅ Pro subscription activated`);

  // Grant tokens
  console.log(`\n⏳ Granting ${PRO_TOKENS_PER_MONTH} tokens...`);
  
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
          sessionId: subscription.id,
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
        select: { status: true, plan: true, currentPeriodEnd: true },
      },
    },
  });

  console.log(`\n${"=".repeat(50)}`);
  console.log(`VERIFICATION`);
  console.log(`${"=".repeat(50)}`);
  console.log(`  Pro Status: ${updated.proSubscription?.status}`);
  console.log(`  Plan: ${updated.proSubscription?.plan}`);
  console.log(`  Renews: ${updated.proSubscription?.currentPeriodEnd?.toLocaleDateString()}`);
  console.log(`  Token Balance: ${updated.tokenBalance}`);
  console.log(`\n✅ User is now a Pro member!`);
}

async function main() {
  const sessionId = process.argv[2];

  if (!sessionId) {
    console.log("Usage: node scripts/fix-from-session.mjs <session_id>");
    console.log("\nExample:");
    console.log("  node scripts/fix-from-session.mjs cs_live_a1bRRI7BIYBC1UjHlcvapnoqEPaUidDGLL3eKPrZhjaj4l1FJUS8ePzo5a");
    process.exit(1);
  }

  await fixFromSession(sessionId);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Error:", error);
  prisma.$disconnect();
  process.exit(1);
});
