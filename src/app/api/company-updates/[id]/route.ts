import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/company-updates/[id] - Update a company update
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get the update and verify ownership through company
    const existingUpdate = await prisma.companyUpdate.findUnique({
      where: { id },
      include: {
        company: {
          select: { userId: true },
        },
      },
    });

    if (!existingUpdate) {
      return NextResponse.json(
        { error: "Update not found" },
        { status: 404 }
      );
    }

    if (existingUpdate.company.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to edit this update" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content, imageUrl, isPinned } = body;

    if (content !== undefined && content.trim().length === 0) {
      return NextResponse.json(
        { error: "Update content cannot be empty" },
        { status: 400 }
      );
    }

    if (content !== undefined && content.length > 5000) {
      return NextResponse.json(
        { error: "Update content must be 5000 characters or less" },
        { status: 400 }
      );
    }

    const update = await prisma.companyUpdate.update({
      where: { id },
      data: {
        ...(content !== undefined && { content: content.trim() }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(isPinned !== undefined && { isPinned }),
      },
    });

    return NextResponse.json(update);
  } catch (error) {
    console.error("Error updating company update:", error);
    return NextResponse.json(
      { error: "Failed to update" },
      { status: 500 }
    );
  }
}

// DELETE /api/company-updates/[id] - Delete a company update
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get the update and verify ownership through company
    const existingUpdate = await prisma.companyUpdate.findUnique({
      where: { id },
      include: {
        company: {
          select: { userId: true },
        },
      },
    });

    if (!existingUpdate) {
      return NextResponse.json(
        { error: "Update not found" },
        { status: 404 }
      );
    }

    if (existingUpdate.company.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this update" },
        { status: 403 }
      );
    }

    await prisma.companyUpdate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting company update:", error);
    return NextResponse.json(
      { error: "Failed to delete update" },
      { status: 500 }
    );
  }
}
