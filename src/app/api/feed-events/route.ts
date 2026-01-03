import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/feed-events - List feed events (for activity feed)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const session = await auth();

    const [feedEvents, total] = await Promise.all([
      prisma.feedEvent.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          milestone: {
            include: {
              project: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  imageUrl: true,
                  status: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      firstName: true,
                      lastName: true,
                      image: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
      }),
      prisma.feedEvent.count(),
    ]);

    // Get current user's likes if authenticated
    let userLikes: string[] = [];
    if (session?.user?.id) {
      const likes = await prisma.feedEventLike.findMany({
        where: {
          userId: session.user.id,
          feedEventId: { in: feedEvents.map((e) => e.id) },
        },
        select: { feedEventId: true },
      });
      userLikes = likes.map((l) => l.feedEventId);
    }

    return NextResponse.json({
      feedEvents: feedEvents.map((event) => ({
        ...event,
        hasLiked: userLikes.includes(event.id),
        likesCount: event._count.likes,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching feed events:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed events" },
      { status: 500 }
    );
  }
}
