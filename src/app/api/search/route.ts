import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export type SearchResultType = "user" | "project" | "update";

export interface UnifiedSearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  url: string;
  meta?: {
    status?: string;
    category?: string;
    author?: {
      name: string | null;
      image: string | null;
      slug: string | null;
    };
  };
}

// GET /api/search - Unified search across all entity types
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const types = searchParams.get("types")?.split(",") || ["user", "project", "update"];
    const limit = Math.min(parseInt(searchParams.get("limit") || "5"), 20);

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [], query });
    }

    const results: UnifiedSearchResult[] = [];

    // Run all searches in parallel
    const searchPromises: Promise<void>[] = [];

    // Search Users
    if (types.includes("user")) {
      searchPromises.push(
        prisma.user.findMany({
          where: {
            AND: [
              { slug: { not: null } },
              {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { displayName: { contains: query, mode: "insensitive" } },
                  { firstName: { contains: query, mode: "insensitive" } },
                  { lastName: { contains: query, mode: "insensitive" } },
                  { slug: { contains: query, mode: "insensitive" } },
                  { headline: { contains: query, mode: "insensitive" } },
                ],
              },
            ],
          },
          select: {
            id: true,
            name: true,
            displayName: true,
            firstName: true,
            lastName: true,
            image: true,
            slug: true,
            headline: true,
          },
          take: limit,
          orderBy: { createdAt: "desc" },
        }).then((users) => {
          users.forEach((user) => {
            const displayName = user.displayName ||
              (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
              user.name;
            results.push({
              id: user.id,
              type: "user",
              title: displayName || user.slug || "Builder",
              subtitle: user.headline,
              imageUrl: user.image,
              url: `/${user.slug}`,
              meta: {
                author: {
                  name: displayName,
                  image: user.image,
                  slug: user.slug,
                },
              },
            });
          });
        })
      );
    }

    // Search Projects
    if (types.includes("project")) {
      searchPromises.push(
        prisma.project.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { tagline: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            slug: true,
            title: true,
            tagline: true,
            imageUrl: true,
            status: true,
            user: {
              select: {
                name: true,
                displayName: true,
                image: true,
                slug: true,
              },
            },
          },
          take: limit,
          orderBy: { createdAt: "desc" },
        }).then((projects) => {
          projects.forEach((project) => {
            results.push({
              id: project.id,
              type: "project",
              title: project.title,
              subtitle: project.tagline,
              imageUrl: project.imageUrl,
              url: `/projects/${project.slug || project.id}`,
              meta: {
                status: project.status,
                author: {
                  name: project.user.displayName || project.user.name,
                  image: project.user.image,
                  slug: project.user.slug,
                },
              },
            });
          });
        })
      );
    }

    // Search Updates (Daily Updates)
    if (types.includes("update")) {
      searchPromises.push(
        prisma.dailyUpdate.findMany({
          where: {
            content: { contains: query, mode: "insensitive" },
          },
          select: {
            id: true,
            content: true,
            imageUrl: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                displayName: true,
                firstName: true,
                lastName: true,
                image: true,
                slug: true,
              },
            },
          },
          take: limit,
          orderBy: { createdAt: "desc" },
        }).then((updates) => {
          updates.forEach((update) => {
            const authorName = update.user.displayName ||
              (update.user.firstName && update.user.lastName
                ? `${update.user.firstName} ${update.user.lastName}`
                : null) ||
              update.user.name;
            // Truncate content for subtitle
            const contentPreview = update.content.length > 80
              ? update.content.slice(0, 80) + "..."
              : update.content;
            results.push({
              id: update.id,
              type: "update",
              title: authorName || "Builder",
              subtitle: contentPreview,
              imageUrl: update.user.image,
              url: `/${update.user.slug}/updates/${update.id}`,
              meta: {
                author: {
                  name: authorName,
                  image: update.user.image,
                  slug: update.user.slug,
                },
              },
            });
          });
        })
      );
    }

    // Wait for all searches to complete
    await Promise.all(searchPromises);

    // Group and sort results by type for better UX
    const groupedResults: Record<SearchResultType, UnifiedSearchResult[]> = {
      user: [],
      project: [],
      update: [],
    };

    results.forEach((result) => {
      groupedResults[result.type].push(result);
    });

    return NextResponse.json({
      results,
      grouped: groupedResults,
      query,
      counts: {
        user: groupedResults.user.length,
        project: groupedResults.project.length,
        update: groupedResults.update.length,
        total: results.length,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
