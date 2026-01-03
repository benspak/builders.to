import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/endorsements/[id] - Delete an endorsement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const endorsement = await prisma.endorsement.findUnique({
      where: { id },
    });

    if (!endorsement) {
      return NextResponse.json(
        { error: "Endorsement not found" },
        { status: 404 }
      );
    }

    // Only the endorser can delete their endorsement
    if (endorsement.endorserId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.endorsement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting endorsement:", error);
    return NextResponse.json(
      { error: "Failed to delete endorsement" },
      { status: 500 }
    );
  }
}
