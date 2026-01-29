/**
 * Geographic utility functions for distance calculations and radius-based filtering
 */

/**
 * Calculate the distance between two points using the Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate bounding box for a given center point and radius
 * Useful for initial database queries before applying precise distance filter
 * @param latitude Center latitude
 * @param longitude Center longitude
 * @param radiusKm Radius in kilometers
 * @returns Bounding box coordinates
 */
export function getBoundingBox(
  latitude: number,
  longitude: number,
  radiusKm: number
): {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
} {
  // Approximate degrees per km at the equator
  const kmPerDegreeLat = 111.32;
  const kmPerDegreeLon = 111.32 * Math.cos(toRadians(latitude));

  const latDelta = radiusKm / kmPerDegreeLat;
  const lonDelta = radiusKm / kmPerDegreeLon;

  return {
    minLat: latitude - latDelta,
    maxLat: latitude + latDelta,
    minLon: longitude - lonDelta,
    maxLon: longitude + lonDelta,
  };
}

/**
 * Filter items by radius from a center point
 * @param items Array of items with latitude and longitude
 * @param centerLat Center latitude
 * @param centerLon Center longitude
 * @param radiusKm Radius in kilometers
 * @returns Filtered items with distance added
 */
export function filterByRadius<
  T extends { latitude?: number | null; longitude?: number | null }
>(
  items: T[],
  centerLat: number,
  centerLon: number,
  radiusKm: number
): (T & { distance: number })[] {
  return items
    .filter((item) => item.latitude != null && item.longitude != null)
    .map((item) => ({
      ...item,
      distance: haversineDistance(
        centerLat,
        centerLon,
        item.latitude!,
        item.longitude!
      ),
    }))
    .filter((item) => item.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Format distance for display
 * @param distanceKm Distance in kilometers
 * @returns Formatted string (e.g., "2.5 km" or "500 m")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Parse radius from query string with validation
 * @param radiusStr String value from query
 * @param defaultRadius Default radius if invalid
 * @param maxRadius Maximum allowed radius
 * @returns Validated radius in km
 */
export function parseRadius(
  radiusStr: string | null,
  defaultRadius: number = 50,
  maxRadius: number = 500
): number {
  if (!radiusStr) return defaultRadius;

  const radius = parseFloat(radiusStr);
  if (isNaN(radius) || radius <= 0) return defaultRadius;
  if (radius > maxRadius) return maxRadius;

  return radius;
}

/**
 * Parse coordinates from query strings with validation
 * @param latStr Latitude string
 * @param lonStr Longitude string
 * @returns Validated coordinates or null if invalid
 */
export function parseCoordinates(
  latStr: string | null,
  lonStr: string | null
): { latitude: number; longitude: number } | null {
  if (!latStr || !lonStr) return null;

  const latitude = parseFloat(latStr);
  const longitude = parseFloat(lonStr);

  // Validate ranges
  if (
    isNaN(latitude) ||
    isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}
