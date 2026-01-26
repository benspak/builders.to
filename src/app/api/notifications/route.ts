import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unread") === "true";
    const skip = (page - 1) * limit;

    const where = {
      userId: session.user.id,
      ...(unreadOnly && { read: false }),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          feedEvent: {
            select: {
              id: true,
              type: true,
              projectId: true,
              milestone: {
                select: {
                  project: {
                    select: {
                      slug: true,
                    },
                  },
                },
              },
            },
          },
          feedEventComment: {
            select: {
              id: true,
              feedEventId: true,
            },
          },
          updateComment: {
            select: {
              id: true,
              updateId: true,
            },
          },
          update: {
            select: {
              id: true,
              user: {
                select: {
                  slug: true,
                },
              },
            },
          },
          project: {
            select: {
              id: true,
              slug: true,
              title: true,
            },
          },
        },
      }).then(notifications =>
        // Fetch actor slugs for notifications with actorId
        Promise.all(notifications.map(async (notification) => {
          if (notification.actorId) {
            const actor = await prisma.user.findUnique({
              where: { id: notification.actorId },
              select: { slug: true },
            });
            return { ...notification, actorSlug: actor?.slug };
          }
          return { ...notification, actorSlug: null };
        }))
      ),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: session.user.id, read: false },
      }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Mark all as read
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === "mark_all_read") {
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false,
        },
        data: { read: true },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
