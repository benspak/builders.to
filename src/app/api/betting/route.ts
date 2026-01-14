import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentQuarter, getNextQuarter, parseQuarter } from "@/lib/betting";

/**
 * GET /api/betting
 * Get available betting periods and targets
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
    const targetType = searchParams.get("targetType");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const cursor = searchParams.get("cursor");

    // Get or create betting periods for current and next quarter
    const currentQuarter = getCurrentQuarter();
    const nextQuarter = getNextQuarter();

    const periods = await Promise.all([
      ensureBettingPeriod(currentQuarter),
      ensureBettingPeriod(nextQuarter),
    ]);

    // Get bettable companies
    let companies: Array<{
      id: string;
      name: string;
      slug: string | null;
      logo: string | null;
      category: string;
      revenueRange: string | null;
      _count: { projects: number };
    }> = [];

    if (!targetType || targetType === "COMPANY") {
      companies = await prisma.company.findMany({
        where: {
          bettingEnabled: true,
          stripeConnectOnboarded: true,
          userId: { not: session.user.id }, // Can't bet on own company
        },
        take: limit,
        ...(cursor && targetType === "COMPANY" && {
          skip: 1,
          cursor: { id: cursor },
        }),
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          category: true,
          revenueRange: true,
          _count: {
            select: { projects: true },
          },
        },
      });
    }

    // Get bettable users (founders)
    let users: Array<{
      id: string;
      name: string | null;
      displayName: string | null;
      slug: string | null;
      image: string | null;
      _count: { companies: number };
    }> = [];

    if (!targetType || targetType === "USER") {
      users = await prisma.user.findMany({
        where: {
          bettingEnabled: true,
          id: { not: session.user.id }, // Can't bet on yourself
        },
        take: limit,
        ...(cursor && targetType === "USER" && {
          skip: 1,
          cursor: { id: cursor },
        }),
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          displayName: true,
          slug: true,
          image: true,
          _count: {
            select: { companies: true },
          },
        },
      });
    }

    // Get user's pending bets count per target for the active periods
    const userBets = await prisma.bet.findMany({
      where: {
        userId: session.user.id,
        status: "PENDING",
        periodId: { in: periods.map((p) => p.id) },
      },
      select: {
        targetType: true,
        targetId: true,
        periodId: true,
      },
    });

    // Create a set of already bet targets per period
    const bettedTargets = new Map<string, Set<string>>();
    for (const bet of userBets) {
      const key = `${bet.periodId}-${bet.targetType}`;
      if (!bettedTargets.has(key)) {
        bettedTargets.set(key, new Set());
      }
      bettedTargets.get(key)!.add(bet.targetId);
    }

    return NextResponse.json({
      periods: periods.map((p) => ({
        id: p.id,
        quarter: p.quarter,
        startsAt: p.startsAt,
        endsAt: p.endsAt,
        bettingClosesAt: p.bettingClosesAt,
        status: p.status,
        isCurrent: p.quarter === currentQuarter,
      })),
      companies: companies.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        logo: c.logo,
        category: c.category,
        revenueRange: c.revenueRange,
        projectCount: c._count.projects,
        targetType: "COMPANY" as const,
      })),
      users: users.map((u) => ({
        id: u.id,
        name: u.displayName || u.name,
        slug: u.slug,
        image: u.image,
        companyCount: u._count.companies,
        targetType: "USER" as const,
      })),
      userBets: Object.fromEntries(
        Array.from(bettedTargets.entries()).map(([key, targets]) => [
          key,
          Array.from(targets),
        ])
      ),
    });
  } catch (error) {
    console.error("Error fetching betting data:", error);
    return NextResponse.json(
      { error: "Failed to fetch betting data" },
      { status: 500 }
    );
  }
}

/**
 * Ensure a betting period exists for the given quarter
 */
async function ensureBettingPeriod(quarterStr: string) {
  const existing = await prisma.bettingPeriod.findUnique({
    where: { quarter: quarterStr },
  });

  if (existing) {
    return existing;
  }

  const quarterInfo = parseQuarter(quarterStr);
  const now = new Date();

  // Determine status based on current time
  let status: "UPCOMING" | "OPEN" | "CLOSED" | "RESOLVED" = "UPCOMING";
  if (now >= quarterInfo.endsAt) {
    status = "CLOSED"; // Will be RESOLVED after bets are settled
  } else if (now >= quarterInfo.startsAt) {
    status = "CLOSED"; // Quarter has started, no more betting
  } else {
    status = "OPEN"; // Accepting bets
  }

  return prisma.bettingPeriod.create({
    data: {
      quarter: quarterStr,
      startsAt: quarterInfo.startsAt,
      endsAt: quarterInfo.endsAt,
      bettingClosesAt: quarterInfo.bettingClosesAt,
      status,
    },
  });
}
