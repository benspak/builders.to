import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { BetStatus } from "@prisma/client";

/**
 * GET /api/betting/my-bets
 * Get all bets placed by the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const cursor = searchParams.get("cursor");

    // Build where clause
    const where: {
      userId: string;
      status?: BetStatus;
    } = {
      userId: session.user.id,
    };

    if (status && ["PENDING", "WON", "LOST", "CANCELLED", "VOID"].includes(status)) {
      where.status = status as BetStatus;
    }

    // Get bets with pagination
    const bets = await prisma.bet.findMany({
      where,
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { createdAt: "desc" },
      include: {
        period: {
          select: {
            quarter: true,
            startsAt: true,
            endsAt: true,
            status: true,
          },
        },
      },
    });

    // Check if there are more results
    const hasMore = bets.length > limit;
    if (hasMore) {
      bets.pop();
    }

    // Enrich bets with target info
    const enrichedBets = await Promise.all(
      bets.map(async (bet) => {
        let targetInfo = null;

        if (bet.targetType === "COMPANY") {
          const company = await prisma.company.findUnique({
            where: { id: bet.targetId },
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            },
          });
          targetInfo = company;
        } else if (bet.targetType === "USER") {
          const user = await prisma.user.findUnique({
            where: { id: bet.targetId },
            select: {
              id: true,
              name: true,
              displayName: true,
              slug: true,
              image: true,
            },
          });
          if (user) {
            targetInfo = {
              id: user.id,
              name: user.displayName || user.name,
              slug: user.slug,
              image: user.image,
            };
          }
        }

        return {
          id: bet.id,
          targetType: bet.targetType,
          targetId: bet.targetId,
          targetInfo,
          direction: bet.direction,
          targetPercentage: bet.targetPercentage,
          stakeTokens: bet.stakeTokens,
          houseFeeTokens: bet.houseFeeTokens,
          netStakeTokens: bet.netStakeTokens,
          status: bet.status,
          winnings: bet.winnings,
          actualPercentage: bet.actualPercentage,
          createdAt: bet.createdAt,
          resolvedAt: bet.resolvedAt,
          period: bet.period,
        };
      })
    );

    // Get summary stats
    const [totalBets, pendingBets, wonBets, lostBets, totalWinnings, totalStaked] = await Promise.all([
      prisma.bet.count({ where: { userId: session.user.id } }),
      prisma.bet.count({ where: { userId: session.user.id, status: "PENDING" } }),
      prisma.bet.count({ where: { userId: session.user.id, status: "WON" } }),
      prisma.bet.count({ where: { userId: session.user.id, status: "LOST" } }),
      prisma.bet.aggregate({
        where: { userId: session.user.id, status: "WON" },
        _sum: { winnings: true },
      }),
      prisma.bet.aggregate({
        where: { userId: session.user.id },
        _sum: { stakeTokens: true },
      }),
    ]);

    return NextResponse.json({
      bets: enrichedBets,
      nextCursor: hasMore ? bets[bets.length - 1].id : undefined,
      hasMore,
      stats: {
        totalBets,
        pendingBets,
        wonBets,
        lostBets,
        winRate: wonBets + lostBets > 0
          ? Math.round((wonBets / (wonBets + lostBets)) * 100)
          : 0,
        totalWinnings: totalWinnings._sum.winnings || 0,
        totalStaked: totalStaked._sum.stakeTokens || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching bets:", error);
    return NextResponse.json(
      { error: "Failed to fetch bets" },
      { status: 500 }
    );
  }
}
