import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLatestMrr } from "@/lib/mrr-sync";
import { getCurrentQuarter, getNextQuarter, parseQuarter } from "@/lib/betting";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/betting/target/[id]
 * Get detailed betting info for a specific target
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get("type") || "COMPANY";

    if (!["COMPANY", "USER"].includes(targetType)) {
      return NextResponse.json(
        { error: "Invalid target type" },
        { status: 400 }
      );
    }

    let targetInfo = null;
    let isOwner = false;

    if (targetType === "COMPANY") {
      const company = await prisma.company.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          category: true,
          revenueRange: true,
          bettingEnabled: true,
          stripeConnectOnboarded: true,
          userId: true,
          _count: {
            select: { projects: true },
          },
        },
      });

      if (!company) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }

      isOwner = company.userId === session.user.id;
      targetInfo = {
        id: company.id,
        name: company.name,
        slug: company.slug,
        logo: company.logo,
        category: company.category,
        revenueRange: company.revenueRange,
        bettingEnabled: company.bettingEnabled,
        stripeConnected: company.stripeConnectOnboarded,
        projectCount: company._count.projects,
        targetType: "COMPANY" as const,
      };
    } else {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          displayName: true,
          slug: true,
          image: true,
          bettingEnabled: true,
          stripeConnectOnboarded: true,
          _count: {
            select: { companies: true },
          },
        },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      isOwner = id === session.user.id;
      targetInfo = {
        id: user.id,
        name: user.displayName || user.name,
        slug: user.slug,
        image: user.image,
        bettingEnabled: user.bettingEnabled,
        stripeConnected: user.stripeConnectOnboarded,
        companyCount: user._count.companies,
        targetType: "USER" as const,
      };
    }

    // Get latest MRR if available (only show to owner)
    let latestMrr = null;
    if (isOwner) {
      latestMrr = await getLatestMrr(
        targetType as "COMPANY" | "USER",
        id
      );
    }

    // Get current and next quarter periods
    const currentQuarter = getCurrentQuarter();
    const nextQuarter = getNextQuarter();

    const periods = await prisma.bettingPeriod.findMany({
      where: {
        quarter: { in: [currentQuarter, nextQuarter] },
      },
      select: {
        id: true,
        quarter: true,
        startsAt: true,
        endsAt: true,
        bettingClosesAt: true,
        status: true,
      },
    });

    // Get bet statistics for this target
    const [totalBets, totalStaked, activeBets] = await Promise.all([
      prisma.bet.count({
        where: {
          targetType: targetType as "COMPANY" | "USER",
          targetId: id,
        },
      }),
      prisma.bet.aggregate({
        where: {
          targetType: targetType as "COMPANY" | "USER",
          targetId: id,
        },
        _sum: { netStakeTokens: true },
      }),
      prisma.bet.count({
        where: {
          targetType: targetType as "COMPANY" | "USER",
          targetId: id,
          status: "PENDING",
        },
      }),
    ]);

    // Get user's existing bets on this target
    const userBets = await prisma.bet.findMany({
      where: {
        userId: session.user.id,
        targetType: targetType as "COMPANY" | "USER",
        targetId: id,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        period: {
          select: {
            quarter: true,
            status: true,
          },
        },
      },
    });

    // Get MRR history for this target (public data)
    const mrrHistory = await prisma.mrrSnapshot.findMany({
      where: {
        targetType: targetType as "COMPANY" | "USER",
        targetId: id,
      },
      orderBy: { snapshotAt: "desc" },
      take: 8, // Last 8 snapshots (up to 4 quarters with start/end)
      select: {
        quarter: true,
        mrrCents: true,
        isStartSnapshot: true,
        snapshotAt: true,
      },
    });

    return NextResponse.json({
      target: targetInfo,
      isOwner,
      latestMrr: latestMrr ? {
        mrrCents: latestMrr.mrrCents,
        quarter: latestMrr.quarter,
        snapshotAt: latestMrr.snapshotAt,
      } : null,
      periods: periods.map((p) => ({
        id: p.id,
        quarter: p.quarter,
        startsAt: p.startsAt,
        endsAt: p.endsAt,
        bettingClosesAt: p.bettingClosesAt,
        status: p.status,
        isOpen: p.status === "OPEN" || p.status === "UPCOMING",
      })),
      stats: {
        totalBets,
        totalStaked: totalStaked._sum.netStakeTokens || 0,
        activeBets,
      },
      userBets: userBets.map((bet) => ({
        id: bet.id,
        direction: bet.direction,
        targetPercentage: bet.targetPercentage,
        stakeTokens: bet.stakeTokens,
        netStakeTokens: bet.netStakeTokens,
        status: bet.status,
        winnings: bet.winnings,
        actualPercentage: bet.actualPercentage,
        createdAt: bet.createdAt,
        period: bet.period,
      })),
      mrrHistory: mrrHistory.map((s) => ({
        quarter: s.quarter,
        mrrCents: s.mrrCents,
        isStart: s.isStartSnapshot,
        snapshotAt: s.snapshotAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching target info:", error);
    return NextResponse.json(
      { error: "Failed to fetch target info" },
      { status: 500 }
    );
  }
}
