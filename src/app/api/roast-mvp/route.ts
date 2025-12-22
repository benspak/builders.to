import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ROAST_MVP_FEATURE_DURATION_DAYS } from "@/lib/stripe";
import { addDays } from "date-fns";

// GET - Fetch the current featured project and queue info
export async function GET(request: Request) {
  try {
    const now = new Date();
    const url = new URL(request.url);
    const debug = url.searchParams.get("debug") === "true";

    // Debug mode: show all RoastMVP entries for diagnosing issues
    if (debug) {
      const allEntries = await prisma.roastMVP.findMany({
        include: {
          project: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      console.log("[Roast MVP] Debug info requested. Entries:", allEntries.length);

      return NextResponse.json({
        debug: true,
        entries: allEntries.map((e) => ({
          id: e.id,
          projectId: e.projectId,
          projectTitle: e.project?.title,
          projectSlug: e.project?.slug,
          status: e.status,
          queuePosition: e.queuePosition,
          stripeSessionId: e.stripeSessionId ? "***" + e.stripeSessionId.slice(-8) : null,
          stripePaymentId: e.stripePaymentId ? "***" + e.stripePaymentId.slice(-8) : null,
          featuredAt: e.featuredAt,
          expiresAt: e.expiresAt,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
        })),
      });
    }

    // First, check if there's a currently featured project that's still valid
    let currentFeatured = await prisma.roastMVP.findFirst({
      where: {
        status: "FEATURED",
        expiresAt: { gt: now },
      },
      include: {
        project: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                slug: true,
              },
            },
            _count: {
              select: {
                upvotes: true,
                comments: true,
              },
            },
          },
        },
      },
    });

    // If no current featured, check for expired ones and promote the next in queue
    if (!currentFeatured) {
      console.log("[Roast MVP] No active featured project, checking for promotions...");

      // Mark expired featured as completed
      const expiredCount = await prisma.roastMVP.updateMany({
        where: {
          status: "FEATURED",
          expiresAt: { lte: now },
        },
        data: { status: "COMPLETED" },
      });

      if (expiredCount.count > 0) {
        console.log(`[Roast MVP] Marked ${expiredCount.count} expired entries as COMPLETED`);
      }

      // Get the next in queue
      const nextInQueue = await prisma.roastMVP.findFirst({
        where: { status: "PAID" },
        orderBy: { queuePosition: "asc" },
      });

      if (nextInQueue) {
        console.log(`[Roast MVP] Promoting entry ${nextInQueue.id} to FEATURED`);

        // Feature the next project
        const featuredAt = now;
        const expiresAt = addDays(featuredAt, ROAST_MVP_FEATURE_DURATION_DAYS);

        currentFeatured = await prisma.roastMVP.update({
          where: { id: nextInQueue.id },
          data: {
            status: "FEATURED",
            featuredAt,
            expiresAt,
          },
          include: {
            project: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    slug: true,
                  },
                },
                _count: {
                  select: {
                    upvotes: true,
                    comments: true,
                  },
                },
              },
            },
          },
        });

        console.log(`[Roast MVP] Project ${nextInQueue.projectId} is now FEATURED until ${expiresAt.toISOString()}`);
      } else {
        console.log("[Roast MVP] No PAID entries in queue to promote");
      }
    }

    // Get queue count
    const queueCount = await prisma.roastMVP.count({
      where: { status: "PAID" },
    });

    return NextResponse.json({
      featured: currentFeatured
        ? {
            project: currentFeatured.project,
            featuredAt: currentFeatured.featuredAt,
            expiresAt: currentFeatured.expiresAt,
          }
        : null,
      queueCount,
    });
  } catch (error) {
    console.error("[Roast MVP] Error fetching roast MVP:", error);
    return NextResponse.json(
      { error: "Failed to fetch roast MVP data" },
      { status: 500 }
    );
  }
}

// PATCH - Manually fix/promote a RoastMVP entry (requires admin secret or ownership)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { roastId, action, adminSecret } = body;

    // Verify admin secret for manual fixes
    const isAdmin = adminSecret === process.env.ADMIN_SECRET;

    // If not admin, check user ownership
    if (!isAdmin) {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      // Verify the user owns this entry
      const entry = await prisma.roastMVP.findUnique({
        where: { id: roastId },
      });

      if (!entry || entry.userId !== session.user.id) {
        return NextResponse.json(
          { error: "You can only modify your own entries" },
          { status: 403 }
        );
      }
    }

    if (!roastId || !action) {
      return NextResponse.json(
        { error: "roastId and action are required" },
        { status: 400 }
      );
    }

    const entry = await prisma.roastMVP.findUnique({
      where: { id: roastId },
      include: { project: { select: { title: true } } },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "RoastMVP entry not found" },
        { status: 404 }
      );
    }

    const now = new Date();

    switch (action) {
      case "promote_to_featured": {
        // Check if there's already a featured project
        const currentFeatured = await prisma.roastMVP.findFirst({
          where: {
            status: "FEATURED",
            expiresAt: { gt: now },
            id: { not: roastId },
          },
        });

        if (currentFeatured && !isAdmin) {
          return NextResponse.json(
            { error: "There is already a featured project. Only admin can override." },
            { status: 400 }
          );
        }

        // If admin and there's a current featured, mark it as completed first
        if (currentFeatured && isAdmin) {
          await prisma.roastMVP.update({
            where: { id: currentFeatured.id },
            data: { status: "COMPLETED" },
          });
        }

        const expiresAt = addDays(now, ROAST_MVP_FEATURE_DURATION_DAYS);

        const updated = await prisma.roastMVP.update({
          where: { id: roastId },
          data: {
            status: "FEATURED",
            featuredAt: now,
            expiresAt,
            queuePosition: entry.queuePosition || 1,
          },
        });

        console.log(`[Roast MVP] Manually promoted ${entry.project?.title} to FEATURED`);

        return NextResponse.json({
          success: true,
          message: `Project "${entry.project?.title}" is now featured until ${expiresAt.toISOString()}`,
          entry: updated,
        });
      }

      case "mark_as_paid": {
        // This is for fixing entries stuck at PENDING_PAYMENT
        if (entry.status !== "PENDING_PAYMENT") {
          return NextResponse.json(
            { error: "Entry is not in PENDING_PAYMENT status" },
            { status: 400 }
          );
        }

        const maxQueuePosition = await prisma.roastMVP.aggregate({
          _max: { queuePosition: true },
          where: { status: { in: ["PAID", "FEATURED"] } },
        });

        const nextPosition = (maxQueuePosition._max.queuePosition || 0) + 1;

        const updated = await prisma.roastMVP.update({
          where: { id: roastId },
          data: {
            status: "PAID",
            queuePosition: nextPosition,
          },
        });

        console.log(`[Roast MVP] Manually marked ${entry.project?.title} as PAID, position: ${nextPosition}`);

        return NextResponse.json({
          success: true,
          message: `Project "${entry.project?.title}" is now marked as PAID at position ${nextPosition}`,
          entry: updated,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Valid actions: promote_to_featured, mark_as_paid` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[Roast MVP] Error in PATCH:", error);
    return NextResponse.json(
      { error: "Failed to update RoastMVP entry" },
      { status: 500 }
    );
  }
}
