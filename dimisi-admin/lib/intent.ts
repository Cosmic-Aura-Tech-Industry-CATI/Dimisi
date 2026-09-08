/**
 * Secret exact trigger token that unlocks the Admin Login button in the DIMISI Guide Robot.
 * Strictly triggers ONLY when the exact token "dimisi-admin" (case-insensitive) is present.
 */
export function isAdminIntent(text: string): boolean {
  if (!text) return false;
  const normalized = text.trim().toLowerCase();
  // Exact token match or discrete word boundary match for "dimisi-admin"
  return /\bdimisi-admin\b/i.test(normalized) || normalized === "dimisi-admin";
}

export const ADMIN_ROUTE = "/dimisi-admin";

export const ADMIN_REPLY = "Access verified. Please use the secure administrator portal below.";