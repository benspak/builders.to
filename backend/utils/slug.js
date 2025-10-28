/**
 * Generate a URL-safe slug from a title
 * @param {string} title - The title to convert to a slug
 * @returns {string} - URL-safe slug
 */
export function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    // Replace multiple spaces with single space
    .replace(/\s+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^\w\-]+/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/\-\-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Generate a unique slug by appending a number if needed
 * @param {string} baseSlug - The base slug
 * @param {number} existingCount - Count of existing slugs with this base
 * @returns {string} - Unique slug
 */
export function generateUniqueSlug(baseSlug, existingCount = 0) {
  if (existingCount === 0) {
    return baseSlug;
  }
  return `${baseSlug}-${existingCount + 1}`;
}
