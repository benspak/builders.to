#!/usr/bin/env node

/**
 * Quarter Resolution Script
 *
 * This script should be run at the end of each quarter to:
 * 1. Calculate actual MRR growth percentages
 * 2. Determine bet winners
 * 3. Distribute winnings from losers to winners
 * 4. Update bet statuses
 *
 * Usage: node scripts/resolve-quarter.mjs [quarter]
 * Example: node scripts/resolve-quarter.mjs 2026-Q1
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resolveQuarter(quarterStr) {
  console.log(`\n🎲 Resolving bets for quarter: ${quarterStr}\n`);

  // 1. Get the betting period
  const period = await prisma.bettingPeriod.findUnique({
    where: { quarter: quarterStr },
    include: {
      bets: {
        where: { status: "PENDING" },
      },
    },
  });

  if (!period) {
    console.error(`❌ Betting period not found for ${quarterStr}`);
    return;
  }

  if (period.status === "RESOLVED") {
    console.log(`✅ Quarter ${quarterStr} is already resolved`);
    return;
  }

  console.log(`📊 Found ${period.bets.length} pending bets`);

  // 2. Group bets by target
  const betsByTarget = new Map();
  for (const bet of period.bets) {
    const key = `${bet.targetType}:${bet.targetId}`;
    if (!betsByTarget.has(key)) {
      betsByTarget.set(key, []);
    }
    betsByTarget.get(key).push(bet);
  }

  console.log(`\n📈 Processing ${betsByTarget.size} targets...\n`);

  let totalResolved = 0;
  let totalWinners = 0;
  let totalLosers = 0;
  let totalDistributed = 0;

  // 3. Process each target
  for (const [targetKey, bets] of betsByTarget) {
    const [targetType, targetId] = targetKey.split(":");
    console.log(`\n📍 Processing ${targetType} ${targetId} (${bets.length} bets)`);

    // Get MRR snapshots
    const startSnapshot = await prisma.mrrSnapshot.findUnique({
      where: {
        targetType_targetId_quarter_isStartSnapshot: {
          targetType,
          targetId,
          quarter: quarterStr,
          isStartSnapshot: true,
        },
      },
    });

    const endSnapshot = await prisma.mrrSnapshot.findUnique({
      where: {
        targetType_targetId_quarter_isStartSnapshot: {
          targetType,
          targetId,
          quarter: quarterStr,
          isStartSnapshot: false,
        },
      },
    });

    if (!startSnapshot || !endSnapshot) {
      console.log(`   ⚠️ Missing MRR snapshots, marking bets as CANCELLED`);

      // Refund bets and mark as cancelled
      for (const bet of bets) {
        await prisma.$transaction([
          prisma.bet.update({
            where: { id: bet.id },
            data: {
              status: "CANCELLED",
              resolvedAt: new Date(),
            },
          }),
          prisma.user.update({
            where: { id: bet.userId },
            data: {
              tokenBalance: { increment: bet.netStakeTokens },
            },
          }),
          prisma.tokenTransaction.create({
            data: {
              userId: bet.userId,
              amount: bet.netStakeTokens,
              type: "BET_REFUND",
              description: `Refund for cancelled bet - missing MRR data`,
              metadata: { betId: bet.id, quarter: quarterStr },
            },
          }),
        ]);
        totalResolved++;
      }
      continue;
    }

    // Calculate actual percentage growth
    let actualPercentage;
    if (startSnapshot.mrrCents === 0) {
      actualPercentage = endSnapshot.mrrCents > 0 ? 1000 : 0;
    } else {
      actualPercentage = ((endSnapshot.mrrCents - startSnapshot.mrrCents) / startSnapshot.mrrCents) * 100;
    }

    console.log(`   📊 MRR: ${startSnapshot.mrrCents} → ${endSnapshot.mrrCents} (${actualPercentage.toFixed(2)}%)`);

    // Determine winners and losers
    const winners = [];
    const losers = [];

    for (const bet of bets) {
      const isWinner = bet.direction === "LONG"
        ? actualPercentage >= bet.targetPercentage
        : actualPercentage < bet.targetPercentage;

      if (isWinner) {
        winners.push(bet);
      } else {
        losers.push(bet);
      }
    }

    console.log(`   🏆 Winners: ${winners.length}, Losers: ${losers.length}`);

    // Calculate total pools
    const totalWinnerStake = winners.reduce((sum, b) => sum + b.netStakeTokens, 0);
    const totalLoserStake = losers.reduce((sum, b) => sum + b.netStakeTokens, 0);
    const totalPool = totalLoserStake; // Losers' stakes go to winners

    console.log(`   💰 Pool to distribute: ${totalPool} tokens`);

    // Distribute winnings
    for (const bet of bets) {
      const isWinner = winners.includes(bet);

      if (isWinner) {
        // Calculate proportional winnings
        let winnings = bet.netStakeTokens; // Get stake back
        if (totalWinnerStake > 0 && totalPool > 0) {
          const proportion = bet.netStakeTokens / totalWinnerStake;
          winnings += Math.floor(totalPool * proportion);
        }

        await prisma.$transaction([
          prisma.bet.update({
            where: { id: bet.id },
            data: {
              status: "WON",
              actualPercentage,
              winnings,
              resolvedAt: new Date(),
            },
          }),
          prisma.user.update({
            where: { id: bet.userId },
            data: {
              tokenBalance: { increment: winnings },
              lifetimeTokensEarned: { increment: Math.max(0, winnings - bet.netStakeTokens) },
            },
          }),
          prisma.tokenTransaction.create({
            data: {
              userId: bet.userId,
              amount: winnings,
              type: "BET_WON",
              description: `Won bet on ${targetType.toLowerCase()} MRR growth`,
              metadata: {
                betId: bet.id,
                quarter: quarterStr,
                actualPercentage,
                targetPercentage: bet.targetPercentage,
              },
            },
          }),
        ]);

        totalWinners++;
        totalDistributed += winnings;
      } else {
        await prisma.bet.update({
          where: { id: bet.id },
          data: {
            status: "LOST",
            actualPercentage,
            winnings: 0,
            resolvedAt: new Date(),
          },
        });

        totalLosers++;
      }

      totalResolved++;
    }
  }

  // 4. Mark period as resolved
  await prisma.bettingPeriod.update({
    where: { id: period.id },
    data: { status: "RESOLVED" },
  });

  console.log(`\n✅ Resolution complete!`);
  console.log(`   📊 Total resolved: ${totalResolved}`);
  console.log(`   🏆 Winners: ${totalWinners}`);
  console.log(`   ❌ Losers: ${totalLosers}`);
  console.log(`   💰 Distributed: ${totalDistributed} tokens\n`);
}

// Get quarter from command line or use previous quarter
const args = process.argv.slice(2);
let quarter = args[0];

if (!quarter) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  // Get the previous quarter
  const currentQ = Math.floor(month / 3) + 1;
  if (currentQ === 1) {
    quarter = `${year - 1}-Q4`;
  } else {
    quarter = `${year}-Q${currentQ - 1}`;
  }
}

resolveQuarter(quarter)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
