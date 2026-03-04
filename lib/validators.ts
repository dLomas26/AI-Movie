/**
 * Validates an IMDb ID format (tt followed by 7-8 digits)
 */
export function validateImdbId(id: string): boolean {
  return /^tt\d{7,8}$/.test(id.trim());
}

/**
 * Sanitizes the IMDb ID input
 */
export function sanitizeImdbId(id: string): string {
  return id.trim().toLowerCase();
}
