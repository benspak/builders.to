import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDeterministicPrivacyOffset, geocodeLocation } from "@/lib/geocoding";

export const dynamic = "force-dynamic";

interface MapUser {
  id: string;
  latitude: number;
  longitude: number;
  city: string | null;
  country: string | null;
}

/**
 * GET /api/map
 * Returns all users with location data, with privacy offset applied
 */
export async function GET() {
  try {
    // Fetch users who have either:
    // 1. Already geocoded coordinates, OR
    // 2. A city (which we can geocode)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            AND: [
              { latitude: { not: null } },
              { longitude: { not: null } },
            ],
          },
          {
            city: { not: null },
          },
        ],
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        city: true,
        country: true,
      },
    });

    const mapUsers: MapUser[] = [];

    for (const user of users) {
      let lat = user.latitude;
      let lon = user.longitude;

      // If no coordinates but has city, try to geocode
      if ((lat === null || lon === null) && user.city) {
        const result = await geocodeLocation(user.city, user.country);
        if (result) {
          lat = result.latitude;
          lon = result.longitude;

          // Optionally save the geocoded coordinates back to the database
          // to avoid repeated API calls (done in background, don't await)
          prisma.user
            .update({
              where: { id: user.id },
              data: {
                latitude: result.latitude,
                longitude: result.longitude,
              },
            })
            .catch((err) => console.error("Failed to save geocoded coords:", err));
        }
      }

      // Only include users with valid coordinates
      if (lat !== null && lon !== null) {
        // Apply privacy offset (deterministic based on user ID)
        const offsetCoords = addDeterministicPrivacyOffset(lat, lon, user.id);

        mapUsers.push({
          id: user.id,
          latitude: offsetCoords.latitude,
          longitude: offsetCoords.longitude,
          city: user.city,
          country: user.country,
        });
      }
    }

    return NextResponse.json({
      users: mapUsers,
      count: mapUsers.length,
    });
  } catch (error) {
    console.error("Map API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch map data" },
      { status: 500 }
    );
  }
}
