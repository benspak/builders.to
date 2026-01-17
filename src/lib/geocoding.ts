/**
 * Geocoding utility for converting city/country to coordinates
 * Uses the free Nominatim (OpenStreetMap) API
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
}

/**
 * Geocodes a city and country to latitude/longitude coordinates
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 * @param city - City name
 * @param country - Country name
 * @returns Coordinates or null if not found
 */
export async function geocodeLocation(
  city: string,
  country?: string | null
): Promise<GeocodingResult | null> {
  if (!city) {
    return null;
  }

  try {
    // Build search query
    const query = country ? `${city}, ${country}` : city;
    const encodedQuery = encodeURIComponent(query);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1`,
      {
        headers: {
          // Required by Nominatim usage policy
          "User-Agent": "Builders.to (https://builders.to)",
        },
        next: { revalidate: 86400 * 30 }, // Cache for 30 days
      }
    );

    if (!response.ok) {
      console.error("Geocoding API error:", response.status);
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    const result = data[0];
    const latitude = parseFloat(result.lat);
    const longitude = parseFloat(result.lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return null;
    }

    return { latitude, longitude };
  } catch (error) {
    console.error("Geocoding failed:", error);
    return null;
  }
}

/**
 * Adds a random offset to coordinates for privacy (within approximately 10 miles / 16 km)
 * This ensures user's exact location is not revealed while still showing general area
 * @param latitude - Original latitude
 * @param longitude - Original longitude
 * @returns Offset coordinates
 */
export function addPrivacyOffset(
  latitude: number,
  longitude: number
): GeocodingResult {
  // 10 miles ≈ 16.09 km
  // 1 degree of latitude ≈ 111 km
  // So 10 miles ≈ 0.145 degrees of latitude
  const maxOffsetDegrees = 0.145;

  // Random offset in range [-maxOffset, +maxOffset]
  const latOffset = (Math.random() * 2 - 1) * maxOffsetDegrees;

  // Longitude degrees vary by latitude, so we need to adjust
  // At equator, 1 degree longitude ≈ 111 km
  // At other latitudes, multiply by cos(latitude)
  const cosLat = Math.cos((latitude * Math.PI) / 180);
  const lonMaxOffset = maxOffsetDegrees / Math.max(cosLat, 0.1); // Prevent division issues near poles
  const lonOffset = (Math.random() * 2 - 1) * lonMaxOffset;

  return {
    latitude: latitude + latOffset,
    longitude: longitude + lonOffset,
  };
}

/**
 * Generate a deterministic privacy offset based on user ID
 * This ensures the same user always appears in the same offset location
 * (prevents dot from jumping around on each page load)
 * @param latitude - Original latitude
 * @param longitude - Original longitude
 * @param seed - A string to use as seed (e.g., user ID)
 * @returns Offset coordinates
 */
export function addDeterministicPrivacyOffset(
  latitude: number,
  longitude: number,
  seed: string
): GeocodingResult {
  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use hash to generate pseudo-random but deterministic values between 0 and 1
  const pseudoRandom1 = Math.abs(Math.sin(hash)) ;
  const pseudoRandom2 = Math.abs(Math.cos(hash));

  // 10 miles ≈ 0.145 degrees latitude
  const maxOffsetDegrees = 0.145;

  // Convert to offset range [-maxOffset, +maxOffset]
  const latOffset = (pseudoRandom1 * 2 - 1) * maxOffsetDegrees;

  // Adjust longitude offset for latitude
  const cosLat = Math.cos((latitude * Math.PI) / 180);
  const lonMaxOffset = maxOffsetDegrees / Math.max(cosLat, 0.1);
  const lonOffset = (pseudoRandom2 * 2 - 1) * lonMaxOffset;

  return {
    latitude: latitude + latOffset,
    longitude: longitude + lonOffset,
  };
}
