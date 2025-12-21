/**
 * Zip code to city/state lookup utility
 * Uses the free Zippopotam.us API
 */

export interface ZipCodeLookupResult {
  city: string;
  state: string;
  stateAbbreviation: string;
}

/**
 * Looks up city and state information from a US zip code
 * @param zipCode - 5-digit US zip code
 * @returns Location info or null if not found
 */
export async function lookupZipCode(zipCode: string): Promise<ZipCodeLookupResult | null> {
  // Validate zip code format (5 digits)
  const cleanZip = zipCode.trim();
  if (!/^\d{5}$/.test(cleanZip)) {
    return null;
  }

  try {
    const response = await fetch(`https://api.zippopotam.us/us/${cleanZip}`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.places || data.places.length === 0) {
      return null;
    }

    const place = data.places[0];

    return {
      city: place["place name"],
      state: place.state,
      stateAbbreviation: place["state abbreviation"],
    };
  } catch (error) {
    console.error("Zip code lookup failed:", error);
    return null;
  }
}

/**
 * Format city and state for display
 * @param city - City name
 * @param state - State name or abbreviation
 * @returns Formatted location string
 */
export function formatLocation(city: string | null, state: string | null): string | null {
  if (city && state) {
    return `${city}, ${state}`;
  }
  if (city) {
    return city;
  }
  if (state) {
    return state;
  }
  return null;
}
