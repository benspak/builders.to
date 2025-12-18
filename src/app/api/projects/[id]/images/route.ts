import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/projects/[id]/images - Get all gallery images
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const images = await prisma.projectImage.findMany({
      where: { projectId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching project images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/images - Add images to gallery
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

    // Check ownership
    const project = await prisma.project.findUnique({
      where: { id },
      select: { userId: true },
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
    const { images } = body;

    if (!images || !Array.isArray(images)) {
      return NextResponse.json(
        { error: "Images array is required" },
        { status: 400 }
      );
    }

    // Get current max order
    const maxOrder = await prisma.projectImage.findFirst({
      where: { projectId: id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const startOrder = (maxOrder?.order ?? -1) + 1;

    // Create images
    const createdImages = await Promise.all(
      images.map((img: { url: string; caption?: string }, index: number) =>
        prisma.projectImage.create({
          data: {
            url: img.url,
            caption: img.caption || null,
            order: startOrder + index,
            projectId: id,
          },
        })
      )
    );

    return NextResponse.json(createdImages, { status: 201 });
  } catch (error) {
    console.error("Error adding project images:", error);
    return NextResponse.json(
      { error: "Failed to add images" },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id]/images - Reorder images
export async function PUT(
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
    const project = await prisma.project.findUnique({
      where: { id },
      select: { userId: true },
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
    const { imageIds } = body;

    if (!imageIds || !Array.isArray(imageIds)) {
      return NextResponse.json(
        { error: "Image IDs array is required" },
        { status: 400 }
      );
    }

    // Update order for each image
    await Promise.all(
      imageIds.map((imageId: string, index: number) =>
        prisma.projectImage.update({
          where: { id: imageId },
          data: { order: index },
        })
      )
    );

    const images = await prisma.projectImage.findMany({
      where: { projectId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error("Error reordering project images:", error);
    return NextResponse.json(
      { error: "Failed to reorder images" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/images - Delete an image
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
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    // Check ownership
    const project = await prisma.project.findUnique({
      where: { id },
      select: { userId: true },
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

    await prisma.projectImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
