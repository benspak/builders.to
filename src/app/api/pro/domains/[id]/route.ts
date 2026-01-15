import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/pro/domains/[id]
 * Remove a custom domain
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    // Find the domain and verify ownership
    const domain = await prisma.customDomain.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!domain) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404 }
      );
    }

    if (domain.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this domain" },
        { status: 403 }
      );
    }

    // Delete the domain
    await prisma.customDomain.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Pro Domains] Error deleting domain:", error);
    return NextResponse.json(
      { error: "Failed to delete domain" },
      { status: 500 }
    );
  }
}
