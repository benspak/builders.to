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

    const body = await request.json();
    const { title, tagline, description, url, githubUrl, imageUrl, status, companyId, slug } = body;

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
