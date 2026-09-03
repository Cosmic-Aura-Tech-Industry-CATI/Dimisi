/**
 * DIMISI Technologies — Client Profiles Storage
 * Pure client-side implementation backed by localStorage.
 */
import { sanitizeText } from "./reviews.shared";

const PROFILE_KEY = "dimisi_user_profile_v1";

export async function getProfileFn({
  data,
}: {
  data: { id: string };
}): Promise<{ profile: any | null }> {
  if (typeof window === "undefined" || !data.id) return { profile: null };
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.id === data.id) return { profile: parsed };
    }
  } catch {}
  return { profile: null };
}

export async function updateProfileFn({
  data,
}: {
  data: {
    id: string;
    email?: string;
    fullName?: string;
    notifyEmail?: boolean;
  };
}): Promise<{ success: boolean }> {
  if (typeof window === "undefined" || !data.id) return { success: false };
  try {
    const profile = {
      id: data.id,
      email: data.email ? sanitizeText(data.email, 160).toLowerCase() : null,
      full_name: data.fullName ? sanitizeText(data.fullName, 120) : null,
      notify_email: data.notifyEmail !== undefined ? Boolean(data.notifyEmail) : true,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

    // Also sync with dimisi_admin_session if active
    const sessionRaw = localStorage.getItem("dimisi_admin_session");
    if (sessionRaw) {
      const session = JSON.parse(sessionRaw);
      if (session?.user) {
        if (profile.full_name) session.user.user_metadata = { ...(session.user.user_metadata || {}), full_name: profile.full_name };
        if (profile.email) session.user.email = profile.email;
        localStorage.setItem("dimisi_admin_session", JSON.stringify(session));
        window.dispatchEvent(new Event("dimisi-auth-change"));
      }
    }
  } catch {}
  return { success: true };
}
