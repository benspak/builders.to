import { NextResponse } from "next/server";
import { getSuggestedTechStacks, getSuggestedInterests } from "@/lib/services/matching.service";

// GET /api/users/similar/suggestions - Get suggested tech stacks and interests
export async function GET() {
  try {
    const [techStacks, interests] = await Promise.all([
      getSuggestedTechStacks(),
      getSuggestedInterests(),
    ]);

    return NextResponse.json({
      techStacks,
      interests,
    });
  } catch (error) {
    console.error("Error getting suggestions:", error);
    return NextResponse.json(
      { error: "Failed to get suggestions" },
      { status: 500 }
    );
  }
}
