import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/users/cofounders - Get users looking for a cofounder
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    // Fetch users who have indicated they are looking for a cofounder
    const users = await prisma.user.findMany({
      where: {
        lookingForCofounder: true,
        id: { not: session.user.id }, // Exclude the current user
      },
      select: {
        id: true,
        slug: true,
        displayName: true,
        firstName: true,
        lastName: true,
        name: true,
        image: true,
        headline: true,
        city: true,
        country: true,
        techStack: true,
        buildingCategory: true,
        interests: true,
        karma: true,
        currentStreak: true,
      },
      orderBy: [
        { currentStreak: "desc" },
        { karma: "desc" },
      ],
      take: limit,
    });

    return NextResponse.json({
      users,
      total: users.length,
    });
  } catch (error) {
    console.error("Error fetching cofounder-seeking users:", error);
    return NextResponse.json(
      { error: "Failed to fetch cofounder-seeking users" },
      { status: 500 }
    );
  }
}
