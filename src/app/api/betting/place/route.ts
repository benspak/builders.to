import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateHouseFee,
  calculateNetStake,
  validateBet,
  parseQuarter,
  isBettingOpen,
} from "@/lib/betting";

/**
 * POST /api/betting/place
 * Place a new bet on a company or user's MRR growth
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      targetType,
      targetId,
      periodId,
      direction,
      targetPercentage,
      stakeTokens,
    } = body;

    // Validate required fields
    if (!targetType || !targetId || !periodId || !direction || targetPercentage === undefined || !stakeTokens) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate target type
    if (!["COMPANY", "USER"].includes(targetType)) {
      return NextResponse.json(
        { error: "Invalid target type" },
        { status: 400 }
      );
    }

    // Validate direction
    if (!["LONG", "SHORT"].includes(direction)) {
      return NextResponse.json(
        { error: "Invalid direction" },
        { status: 400 }
      );
    }

    // Get user's token balance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tokenBalance: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Validate bet parameters
    const validation = validateBet({
      stakeTokens,
      targetPercentage,
      userBalance: user.tokenBalance,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Get and validate the betting period
    const period = await prisma.bettingPeriod.findUnique({
      where: { id: periodId },
    });

    if (!period) {
      return NextResponse.json(
        { error: "Betting period not found" },
        { status: 404 }
      );
    }

    // Check if betting is still open
    const quarterInfo = parseQuarter(period.quarter);
    if (!isBettingOpen(quarterInfo)) {
      return NextResponse.json(
        { error: "Betting is closed for this quarter" },
        { status: 400 }
      );
    }

    if (period.status !== "OPEN" && period.status !== "UPCOMING") {
      return NextResponse.json(
        { error: "Betting is not open for this period" },
        { status: 400 }
      );
    }

    // Validate the target exists and has betting enabled
    if (targetType === "COMPANY") {
      const company = await prisma.company.findUnique({
        where: { id: targetId },
        select: {
          id: true,
          bettingEnabled: true,
          stripeConnectOnboarded: true,
          userId: true,
        },
      });

      if (!company) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }

      if (!company.bettingEnabled) {
        return NextResponse.json(
          { error: "Betting is not enabled for this company" },
          { status: 400 }
        );
      }

      if (!company.stripeConnectOnboarded) {
        return NextResponse.json(
          { error: "Company has not connected Stripe for MRR tracking" },
          { status: 400 }
        );
      }

      // Prevent betting on own company
      if (company.userId === session.user.id) {
        return NextResponse.json(
          { error: "You cannot bet on your own company" },
          { status: 400 }
        );
      }
    } else if (targetType === "USER") {
      const targetUser = await prisma.user.findUnique({
        where: { id: targetId },
        select: {
          id: true,
          bettingEnabled: true,
          stripeConnectOnboarded: true,
        },
      });

      if (!targetUser) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      if (!targetUser.bettingEnabled) {
        return NextResponse.json(
          { error: "Betting is not enabled for this user" },
          { status: 400 }
        );
      }

      // Prevent betting on yourself
      if (targetId === session.user.id) {
        return NextResponse.json(
          { error: "You cannot bet on yourself" },
          { status: 400 }
        );
      }
    }

    // Calculate fees
    const houseFeeTokens = calculateHouseFee(stakeTokens);
    const netStakeTokens = calculateNetStake(stakeTokens);

    // Create the bet in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct tokens from user balance
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          tokenBalance: { decrement: stakeTokens },
        },
      });

      // Create token transaction for bet placement
      await tx.tokenTransaction.create({
        data: {
          userId: session.user.id,
          amount: -stakeTokens,
          type: "BET_PLACED",
          description: `Bet ${stakeTokens} tokens on ${targetType.toLowerCase()} MRR growth`,
          metadata: {
            targetType,
            targetId,
            periodId,
            direction,
            targetPercentage,
            houseFee: houseFeeTokens,
          },
        },
      });

      // Record house earnings
      await tx.houseEarnings.create({
        data: {
          amount: houseFeeTokens,
          source: "BET_FEE",
          description: `5% fee from bet placement`,
        },
      });

      // Create token transaction for house fee (for transparency)
      await tx.tokenTransaction.create({
        data: {
          userId: session.user.id,
          amount: 0, // Already deducted as part of stake
          type: "BET_HOUSE_FEE",
          description: `House fee: ${houseFeeTokens} tokens (5%)`,
          metadata: {
            houseFee: houseFeeTokens,
          },
        },
      });

      // Create the bet
      const bet = await tx.bet.create({
        data: {
          userId: session.user.id,
          targetType,
          targetId,
          periodId,
          direction,
          targetPercentage,
          stakeTokens,
          houseFeeTokens,
          netStakeTokens,
          status: "PENDING",
        },
      });

      // Get updated balance
      const updatedUser = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { tokenBalance: true },
      });

      return {
        bet,
        newBalance: updatedUser?.tokenBalance ?? 0,
      };
    });

    return NextResponse.json({
      success: true,
      bet: {
        id: result.bet.id,
        targetType: result.bet.targetType,
        targetId: result.bet.targetId,
        direction: result.bet.direction,
        targetPercentage: result.bet.targetPercentage,
        stakeTokens: result.bet.stakeTokens,
        houseFeeTokens: result.bet.houseFeeTokens,
        netStakeTokens: result.bet.netStakeTokens,
        status: result.bet.status,
        createdAt: result.bet.createdAt,
      },
      newBalance: result.newBalance,
      message: `Successfully placed ${direction} bet on ${targetPercentage}% growth`,
    });
  } catch (error) {
    console.error("Error placing bet:", error);
    return NextResponse.json(
      { error: "Failed to place bet" },
      { status: 500 }
    );
  }
}
