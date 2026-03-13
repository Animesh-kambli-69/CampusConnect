/**
 * Extracts the domain from an email address.
 * e.g., "student@vjti.ac.in" → "vjti.ac.in"
 */
export function extractEmailDomain(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) {
    throw new Error('Invalid email format');
  }
  return parts[1].toLowerCase();
}

/**
 * Validates that an email looks like a college email.
 * Must contain a domain with at least one dot (e.g., college.edu, vjti.ac.in).
 */
export function isCollegeEmail(email: string): boolean {
  const domain = extractEmailDomain(email);
  // College domains typically have at least two parts (e.g., college.edu)
  const parts = domain.split('.');
  return parts.length >= 2;
}

/**
 * Generates a college name from the email domain.
 * e.g., "vjti.ac.in" → "VJTI"
 */
export function collegeNameFromDomain(domain: string): string {
  const parts = domain.split('.');
  return parts[0].toUpperCase();
}

/**
 * Parse pagination query params with defaults.
 */
export function parsePagination(query: { page?: string; limit?: string }) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(query.limit || '20', 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
