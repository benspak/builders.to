import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";

// GET /api/projects - List all projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "recent";
    const status = searchParams.get("status") as ProjectStatus | null;
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { tagline: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const orderBy = sort === "popular"
      ? { upvotes: { _count: "desc" as const } }
      : { createdAt: "desc" as const };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              upvotes: true,
              comments: true,
            },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    // Get current user's upvotes if authenticated
    const session = await auth();
    let userUpvotes: string[] = [];

    if (session?.user?.id) {
      const upvotes = await prisma.upvote.findMany({
        where: {
          userId: session.user.id,
          projectId: { in: projects.map((p: { id: string }) => p.id) },
        },
        select: { projectId: true },
      });
      userUpvotes = upvotes.map((u: { projectId: string }) => u.projectId);
    }

    return NextResponse.json({
      projects: projects.map((project: (typeof projects)[number]) => ({
        ...project,
        hasUpvoted: userUpvotes.includes(project.id),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
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
    const { title, tagline, description, url, githubUrl, imageUrl, status } = body;

    if (!title || !tagline) {
      return NextResponse.json(
        { error: "Title and tagline are required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        title,
        tagline,
        description,
        url,
        githubUrl,
        imageUrl,
        status: status || "IDEA",
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            upvotes: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
