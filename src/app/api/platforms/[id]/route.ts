import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SocialPlatform } from "@prisma/client";
import { disconnectPlatform, getConnection } from "@/lib/services/platforms.service";

// DELETE /api/platforms/[id] - Disconnect a platform
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
    const platform = id.toUpperCase() as SocialPlatform;

    // Validate platform
    if (!Object.values(SocialPlatform).includes(platform)) {
      return NextResponse.json(
        { error: "Invalid platform" },
        { status: 400 }
      );
    }

    // Check if platform is connected
    const connection = await getConnection(session.user.id, platform);
    if (!connection) {
      return NextResponse.json(
        { error: "Platform not connected" },
        { status: 404 }
      );
    }

    const success = await disconnectPlatform(session.user.id, platform);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to disconnect platform" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting platform:", error);
    return NextResponse.json(
      { error: "Failed to disconnect platform" },
      { status: 500 }
    );
  }
}
