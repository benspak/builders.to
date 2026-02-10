import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";
import { generateSlug, generateUniqueSlug, validateImageUrl } from "@/lib/utils";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";
import { isProMember } from "@/lib/stripe-subscription";

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
              slug: true,
            },
          },
          coBuilders: {
            include: {
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
          milestones: {
            orderBy: { achievedAt: "desc" },
            take: 3,
            select: {
              id: true,
              type: true,
              title: true,
            },
          },
          _count: {
            select: {
              upvotes: true,
              comments: true,
              milestones: true,
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
    // Rate limit check
    const { success, reset } = rateLimit(request, RATE_LIMITS.createProject);
    if (!success) {
      return rateLimitResponse(reset);
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is a Pro member
    const isPro = await isProMember(session.user.id);
    if (!isPro) {
      return NextResponse.json(
        { error: "Pro membership required to create projects", code: "PRO_REQUIRED" },
        { status: 403 }
      );
    }

    // Check if user has completed their profile (username and image required to share)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true, image: true },
    });

    if (!user?.username || !user?.image) {
      const missingFields = [];
      if (!user?.username) missingFields.push("username");
      if (!user?.image) missingFields.push("profile image");
      
      return NextResponse.json(
        { 
          error: `Please complete your profile before sharing a project. Missing: ${missingFields.join(" and ")}.`,
          code: "PROFILE_INCOMPLETE",
          missingFields,
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, tagline, description, url, githubUrl, imageUrl, status, companyId, slug, demoUrl, docsUrl, changelogUrl, coBuilderIds } = body;

    if (!title || !tagline) {
      return NextResponse.json(
        { error: "Title and tagline are required" },
        { status: 400 }
      );
    }

    // Validate image URL
    const imageUrlError = validateImageUrl(imageUrl);
    if (imageUrlError) {
      return NextResponse.json(
        { error: imageUrlError },
        { status: 400 }
      );
    }

    // Generate or validate slug
    let finalSlug = slug ? generateSlug(slug) : generateSlug(title);

    // Check if slug already exists
    const existingProject = await prisma.project.findUnique({
      where: { slug: finalSlug },
    });

    if (existingProject) {
      // If user provided a custom slug that exists, return error
      if (slug) {
        return NextResponse.json(
          { error: "This URL slug is already taken. Please choose a different one." },
          { status: 400 }
        );
      }
      // If auto-generated slug exists, add a random suffix
      finalSlug = generateUniqueSlug(title);
    }

    // Verify company ownership if companyId is provided
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { userId: true },
      });

      if (!company || company.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Invalid company selection" },
          { status: 400 }
        );
      }
    }

    // Validate co-builder IDs if provided
    const validCoBuilderIds: string[] = [];
    if (coBuilderIds && Array.isArray(coBuilderIds) && coBuilderIds.length > 0) {
      // Limit to 5 co-builders
      const limitedIds = coBuilderIds.slice(0, 5);

      // Filter out the owner (can't be co-builder of their own project)
      const filteredIds = limitedIds.filter((id: string) => id !== session.user.id);

      // Verify all users exist
      const existingUsers = await prisma.user.findMany({
        where: { id: { in: filteredIds } },
        select: { id: true },
      });

      validCoBuilderIds.push(...existingUsers.map(u => u.id));
    }

    const project = await prisma.project.create({
      data: {
        title,
        slug: finalSlug,
        tagline,
        description,
        url,
        githubUrl,
        imageUrl,
        status: status || "IDEA",
        userId: session.user.id,
        companyId: companyId || null,
        // Artifact fields
        demoUrl: demoUrl || null,
        docsUrl: docsUrl || null,
        changelogUrl: changelogUrl || null,
        // Create co-builder relationships
        coBuilders: validCoBuilderIds.length > 0 ? {
          create: validCoBuilderIds.map(userId => ({ userId })),
        } : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            slug: true,
          },
        },
        coBuilders: {
          include: {
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
        milestones: {
          orderBy: { achievedAt: "desc" },
          take: 3,
          select: {
            id: true,
            type: true,
            title: true,
          },
        },
        _count: {
          select: {
            upvotes: true,
            comments: true,
            milestones: true,
          },
        },
      },
    });

    // Create a feed event for the new project
    await prisma.feedEvent.create({
      data: {
        type: "PROJECT_CREATED",
        userId: session.user.id,
        projectId: project.id,
        title: title,
        description: tagline,
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
