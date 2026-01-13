import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/projects/[id]/clicks - Track a click
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { visitorId, clickType = "url" } = body;

    // Find the project
    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Create the click record
    await prisma.projectClick.create({
      data: {
        projectId: project.id,
        visitorId: visitorId || null,
        clickType,
      },
    });

    return NextResponse.json({ tracked: true });
  } catch (error) {
    console.error("Error tracking project click:", error);
    return NextResponse.json(
      { error: "Failed to track click" },
      { status: 500 }
    );
  }
}
