import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug, validateImageUrl } from "@/lib/utils";

// GET /api/projects/[id] - Get a single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
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

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check if current user has upvoted
    const session = await auth();
    let hasUpvoted = false;

    if (session?.user?.id) {
      const upvote = await prisma.upvote.findUnique({
        where: {
          userId_projectId: {
            userId: session.user.id,
            projectId: id,
          },
        },
      });
      hasUpvoted = !!upvote;
    }

    return NextResponse.json({ ...project, hasUpvoted });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Update a project
export async function PATCH(
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

    // Check ownership and get current status for comparison
    const existingProject = await prisma.project.findUnique({
      where: { id },
      select: { userId: true, status: true, title: true, slug: true },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (existingProject.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, tagline, description, url, githubUrl, imageUrl, status, companyId, slug, demoUrl, docsUrl, changelogUrl, coBuilderIds } = body;

    // Validate image URL
    const imageUrlError = validateImageUrl(imageUrl);
    if (imageUrlError) {
      return NextResponse.json(
        { error: imageUrlError },
        { status: 400 }
      );
    }

    // Validate slug if provided
    if (slug !== undefined && slug !== "") {
      const normalizedSlug = generateSlug(slug);
      const existingProject = await prisma.project.findFirst({
        where: {
          slug: normalizedSlug,
          NOT: { id },
        },
      });

      if (existingProject) {
        return NextResponse.json(
          { error: "This URL slug is already taken. Please choose a different one." },
          { status: 400 }
        );
      }
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

    // Handle co-builder updates if provided
    if (coBuilderIds !== undefined && Array.isArray(coBuilderIds)) {
      // Limit to 5 co-builders
      const limitedIds = coBuilderIds.slice(0, 5);

      // Filter out the owner (can't be co-builder of their own project)
      const filteredIds = limitedIds.filter((cbId: string) => cbId !== session.user.id);

      // Verify all users exist
      const existingUsers = await prisma.user.findMany({
        where: { id: { in: filteredIds } },
        select: { id: true },
      });
      const validCoBuilderIds = existingUsers.map(u => u.id);

      // Delete existing co-builders and create new ones (replace all)
      await prisma.projectCoBuilder.deleteMany({
        where: { projectId: id },
      });

      if (validCoBuilderIds.length > 0) {
        await prisma.projectCoBuilder.createMany({
          data: validCoBuilderIds.map(userId => ({
            projectId: id,
            userId,
          })),
        });
      }
    }

    // Check if status is changing
    const oldStatus = existingProject.status;
    const newStatus = status;
    const statusChanged = newStatus && newStatus !== oldStatus;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(tagline && { tagline }),
        ...(slug && { slug: generateSlug(slug) }),
        ...(description !== undefined && { description }),
        ...(url !== undefined && { url }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(status && { status }),
        ...(companyId !== undefined && { companyId: companyId || null }),
        // Artifact fields
        ...(demoUrl !== undefined && { demoUrl: demoUrl || null }),
        ...(docsUrl !== undefined && { docsUrl: docsUrl || null }),
        ...(changelogUrl !== undefined && { changelogUrl: changelogUrl || null }),
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
          select: {
            id: true,
            type: true,
            title: true,
            achievedAt: true,
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

    // Create a feed event if status changed
    if (statusChanged) {
      await prisma.feedEvent.create({
        data: {
          type: "PROJECT_STATUS_CHANGE",
          userId: session.user.id,
          projectId: id,
          title: `${oldStatus} → ${newStatus}`,
          description: title || existingProject.title,
        },
      });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
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

    // Check ownership
    const existingProject = await prisma.project.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (existingProject.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
