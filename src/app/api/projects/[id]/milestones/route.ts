import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MilestoneType } from "@prisma/client";
import { getMilestoneLabel } from "@/lib/utils";

// GET /api/projects/[id]/milestones - List all milestones for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const milestones = await prisma.projectMilestone.findMany({
      where: { projectId: id },
      orderBy: { achievedAt: "desc" },
    });

    return NextResponse.json(milestones);
  } catch (error) {
    console.error("Error fetching milestones:", error);
    return NextResponse.json(
      { error: "Failed to fetch milestones" },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/milestones - Add a milestone to a project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify project ownership and get project details
    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        userId: true,
        title: true,
        slug: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, title, description, achievedAt } = body;

    // Validate milestone type
    const validTypes: MilestoneType[] = [
      "V1_SHIPPED",
      "FIRST_USER",
      "FIRST_CUSTOMER",
      "MRR_1K",
      "MRR_10K",
      "PROFITABLE",
      "TEAM_HIRE",
      "FUNDING",
      "PIVOT",
      "CUSTOM",
    ];

    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid milestone type" },
        { status: 400 }
      );
    }

    // Check if non-custom milestone type already exists for this project
    if (type !== "CUSTOM") {
      const existing = await prisma.projectMilestone.findFirst({
        where: {
          projectId: id,
          type: type,
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "This milestone has already been achieved" },
          { status: 400 }
        );
      }
    }

    // Custom milestones require a title
    if (type === "CUSTOM" && !title) {
      return NextResponse.json(
        { error: "Custom milestones require a title" },
        { status: 400 }
      );
    }

    // Create milestone and feed event in a transaction
    const milestoneTitle = type === "CUSTOM" && title
      ? title
      : getMilestoneLabel(type).split(" ").slice(1).join(" ");

    const result = await prisma.$transaction(async (tx) => {
      // Create the milestone
      const milestone = await tx.projectMilestone.create({
        data: {
          type,
          title: type === "CUSTOM" ? title : null,
          description: description || null,
          achievedAt: achievedAt ? new Date(achievedAt) : new Date(),
          projectId: id,
        },
      });

      // Create the feed event
      const feedEvent = await tx.feedEvent.create({
        data: {
          type: "MILESTONE_ACHIEVED",
          userId: session.user.id,
          projectId: id,
          milestoneId: milestone.id,
          title: `${project.title} ${milestoneTitle}`,
          description: description || null,
        },
      });

      return { milestone, feedEvent };
    });

    return NextResponse.json(result.milestone, { status: 201 });
  } catch (error) {
    console.error("Error creating milestone:", error);
    return NextResponse.json(
      { error: "Failed to create milestone" },
      { status: 500 }
    );
  }
}
