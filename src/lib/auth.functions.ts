/**
 * Authentication Client Helpers & Google OAuth Synchronization
 * Pure client-side implementation.
 */
import { sanitizeText } from "./reviews.shared";

export async function getGoogleAuthConfigFn(): Promise<{ clientId: string | null }> {
  const clientId =
    (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
    (import.meta as any).env?.GOOGLE_CLIENT_ID ||
    null;
  return { clientId };
}

export async function syncGoogleUserFn({
  data,
}: {
  data: {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string | null;
  };
}): Promise<{ success: boolean; user: any }> {
  const cleanEmail = sanitizeText(data.email, 160).toLowerCase();
  const cleanName = sanitizeText(data.fullName || cleanEmail.split("@")[0], 120);

  const user = {
    id: data.id,
    email: cleanEmail,
    full_name: cleanName,
    avatar_url: data.avatarUrl || null,
  };

  return {
    success: true,
    user,
  };
}
