import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/projects/[slug]/views - Get view and click stats for a project
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;

    // Find the project
    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Get counts in parallel
    const [totalViews, totalClicks, uniqueViewers] = await Promise.all([
      prisma.projectView.count({
        where: { projectId: project.id },
      }),
      prisma.projectClick.count({
        where: { projectId: project.id },
      }),
      prisma.projectView.groupBy({
        by: ["visitorId"],
        where: {
          projectId: project.id,
          visitorId: { not: null },
        },
      }),
    ]);

    // Calculate CTR (Click-Through Rate)
    const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    return NextResponse.json({
      views: totalViews,
      clicks: totalClicks,
      uniqueViewers: uniqueViewers.length,
      ctr: Math.round(ctr * 10) / 10, // Round to 1 decimal
    });
  } catch (error) {
    console.error("Error fetching project views:", error);
    return NextResponse.json(
      { error: "Failed to fetch views" },
      { status: 500 }
    );
  }
}

// POST /api/projects/[slug]/views - Track a view
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { visitorId } = body;

    // Find the project
    const project = await prisma.project.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Debounce: Check if this visitor has viewed this project in the last hour
    if (visitorId) {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const recentView = await prisma.projectView.findFirst({
        where: {
          projectId: project.id,
          visitorId,
          createdAt: { gt: oneHourAgo },
        },
      });

      if (recentView) {
        return NextResponse.json({ tracked: false, reason: "debounced" });
      }
    }

    // Create the view record
    await prisma.projectView.create({
      data: {
        projectId: project.id,
        visitorId: visitorId || null,
      },
    });

    return NextResponse.json({ tracked: true });
  } catch (error) {
    console.error("Error tracking project view:", error);
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    );
  }
}
