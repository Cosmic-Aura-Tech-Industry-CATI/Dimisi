/** Secret passphrase that unlocks the admin login button in the DIMISI chat. */
const SECRET = /^dimisi[\s._-]*opps$/i;

export function isAdminIntent(text: string): boolean {
  return SECRET.test(text.trim());
}

export const ADMIN_ROUTE = "/dimisi-admin";

export const ADMIN_REPLY = "Access verified. Secure admin login niche button se kholo.";