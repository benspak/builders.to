import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users/search - Search users for @mention autocomplete
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
    const query = searchParams.get("q")?.trim();
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 20);

    if (!query || query.length < 1) {
      return NextResponse.json({ users: [] });
    }

    // Search by name, firstName, lastName, or slug
    const users = await prisma.user.findMany({
      where: {
        AND: [
          // Don't include the current user in search results
          { id: { not: session.user.id } },
          // Must have a slug (for mentioning)
          { slug: { not: null } },
          // Search across multiple fields
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { firstName: { contains: query, mode: "insensitive" } },
              { lastName: { contains: query, mode: "insensitive" } },
              { slug: { contains: query, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        image: true,
        slug: true,
        headline: true,
      },
      take: limit,
      orderBy: [
        // Prioritize users with first/last names set
        { firstName: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
