#!/usr/bin/env node

/**
 * Script to manually credit purchased tokens to a user
 *
 * Usage:
 *   node scripts/credit-purchased-tokens.mjs --list              # List all users
 *   node scripts/credit-purchased-tokens.mjs <userId> <amount>   # Credit tokens
 *
 * Example: node scripts/credit-purchased-tokens.mjs clxxxxxxxxx 50
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        displayName: true,
        tokenBalance: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    console.log("\n📋 Users (most recent first):\n");
    console.log("ID".padEnd(30) + "Name".padEnd(25) + "Email".padEnd(35) + "Tokens");
    console.log("-".repeat(100));

    for (const user of users) {
      const name = user.displayName || user.name || "(no name)";
      const email = user.email || "(no email)";
      console.log(
        user.id.padEnd(30) +
        name.slice(0, 23).padEnd(25) +
        email.slice(0, 33).padEnd(35) +
        user.tokenBalance.toString()
      );
    }

    console.log(`\nShowing ${users.length} users\n`);
  } catch (error) {
    console.error("Error listing users:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function creditTokens(userId, amount) {
  if (!userId || !amount) {
    console.error("Usage:");
    console.error("  node scripts/credit-purchased-tokens.mjs --list              # List all users");
    console.error("  node scripts/credit-purchased-tokens.mjs <userId> <amount>   # Credit tokens");
    process.exit(1);
  }

  const tokenAmount = parseInt(amount, 10);
  if (isNaN(tokenAmount) || tokenAmount <= 0) {
    console.error("Token amount must be a positive number");
    process.exit(1);
  }

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, tokenBalance: true },
    });

    if (!user) {
      console.error(`User with ID ${userId} not found`);
      process.exit(1);
    }

    console.log(`Found user: ${user.name || user.email}`);
    console.log(`Current balance: ${user.tokenBalance} tokens`);

    // Create the transaction and update balance
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.tokenTransaction.create({
        data: {
          userId,
          amount: tokenAmount,
          type: "GIFT_PURCHASED",
          description: `Purchased ${tokenAmount} tokens (manual credit)`,
          metadata: {
            manualCredit: true,
            creditedAt: new Date().toISOString(),
          },
        },
      });

      // Update user balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          tokenBalance: { increment: tokenAmount },
          lifetimeTokensEarned: { increment: tokenAmount },
        },
        select: { tokenBalance: true },
      });

      return { transaction, newBalance: updatedUser.tokenBalance };
    });

    console.log(`\n✅ Successfully credited ${tokenAmount} tokens!`);
    console.log(`New balance: ${result.newBalance} tokens`);
    console.log(`Transaction ID: ${result.transaction.id}`);

  } catch (error) {
    console.error("Error crediting tokens:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const args = process.argv.slice(2);

if (args[0] === "--list" || args[0] === "-l") {
  listUsers();
} else {
  const [userId, amount] = args;
  creditTokens(userId, amount);
}
