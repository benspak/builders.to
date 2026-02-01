import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getPartnership,
  updatePartnership,
  getPartnershipCheckIns,
  getPartnershipStats,
} from "@/lib/services/accountability.service";
import { PartnershipStatus, CheckInFrequency } from "@prisma/client";

// GET /api/accountability/[id] - Get partnership details
export async function GET(
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

    const { id: partnershipId } = await params;

    const partnership = await getPartnership(partnershipId);

    if (!partnership) {
      return NextResponse.json(
        { error: "Partnership not found" },
        { status: 404 }
      );
    }

    // Only partners can view
    if (
      partnership.requester.id !== session.user.id &&
      partnership.partner.id !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Not authorized to view this partnership" },
        { status: 403 }
      );
    }

    // Get stats
    const stats = await getPartnershipStats(partnershipId);

    return NextResponse.json({
      partnership,
      stats,
    });
  } catch (error) {
    console.error("Error fetching partnership:", error);
    return NextResponse.json(
      { error: "Failed to fetch partnership" },
      { status: 500 }
    );
  }
}

// PATCH /api/accountability/[id] - Update partnership
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

    const { id: partnershipId } = await params;
    const body = await request.json();
    const { status, checkInFrequency, goal, endDate } = body;

    // Validate status if provided
    if (status && !["ACTIVE", "PAUSED", "ENDED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Validate checkInFrequency if provided
    if (checkInFrequency && !["DAILY", "WEEKDAYS", "WEEKLY"].includes(checkInFrequency)) {
      return NextResponse.json(
        { error: "Invalid check-in frequency" },
        { status: 400 }
      );
    }

    const updates: {
      status?: PartnershipStatus;
      checkInFrequency?: CheckInFrequency;
      goal?: string;
      endDate?: Date | null;
    } = {};

    if (status) updates.status = status as PartnershipStatus;
    if (checkInFrequency) updates.checkInFrequency = checkInFrequency as CheckInFrequency;
    if (goal !== undefined) updates.goal = goal;
    if (endDate !== undefined) updates.endDate = endDate ? new Date(endDate) : null;

    const result = await updatePartnership(
      partnershipId,
      session.user.id,
      updates
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating partnership:", error);
    return NextResponse.json(
      { error: "Failed to update partnership" },
      { status: 500 }
    );
  }
}
