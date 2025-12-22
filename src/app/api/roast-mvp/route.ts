import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ROAST_MVP_FEATURE_DURATION_DAYS } from "@/lib/stripe";
import { addDays } from "date-fns";

// GET - Fetch the current featured project and queue info
export async function GET() {
  try {
    const now = new Date();

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
      // Mark expired featured as completed
      await prisma.roastMVP.updateMany({
        where: {
          status: "FEATURED",
          expiresAt: { lte: now },
        },
        data: { status: "COMPLETED" },
      });

      // Get the next in queue
      const nextInQueue = await prisma.roastMVP.findFirst({
        where: { status: "PAID" },
        orderBy: { queuePosition: "asc" },
      });

      if (nextInQueue) {
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
    console.error("Error fetching roast MVP:", error);
    return NextResponse.json(
      { error: "Failed to fetch roast MVP data" },
      { status: 500 }
    );
  }
}
