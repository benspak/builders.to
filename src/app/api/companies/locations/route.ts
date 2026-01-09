import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/companies/locations - Get all unique locations with company counts
export async function GET(request: NextRequest) {
  try {
    // Get all companies with location data
    const companies = await prisma.company.findMany({
      where: {
        locationSlug: { not: null },
      },
      select: {
        location: true,
        locationSlug: true,
      },
    });

    // Group by locationSlug and count
    const locationMap = new Map<string, { location: string; locationSlug: string; count: number }>();

    for (const company of companies) {
      if (company.locationSlug && company.location) {
        const existing = locationMap.get(company.locationSlug);
        if (existing) {
          existing.count += 1;
        } else {
          locationMap.set(company.locationSlug, {
            location: company.location,
            locationSlug: company.locationSlug,
            count: 1,
          });
        }
      }
    }

    // Convert to array and sort by count (descending)
    const locations = Array.from(locationMap.values())
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ locations });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
