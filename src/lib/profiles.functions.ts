import { createServerFn } from "@tanstack/react-start";
import { adminsRepository } from "@/server/repositories/admins.repository";
import { sanitizeText } from "./reviews.shared";

export const getProfileFn = createServerFn({ method: "GET" })
  .validator((input: { id: string }) => ({ id: String(input.id ?? "").trim() }))
  .handler(async ({ data }): Promise<{ profile: any | null }> => {
    if (!data.id) return { profile: null };
    const profile = await adminsRepository.getProfile(data.id);
    return { profile };
  });

export const updateProfileFn = createServerFn({ method: "POST" })
  .validator(
    (input: {
      id: string;
      email?: string;
      fullName?: string;
      notifyEmail?: boolean;
    }) => ({
      id: String(input.id ?? "").trim(),
      email: sanitizeText(input.email, 160).toLowerCase(),
      fullName: sanitizeText(input.fullName, 120),
      notifyEmail: Boolean(input.notifyEmail),
    }),
  )
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    if (!data.id) throw new Error("User ID is required.");
    await adminsRepository.upsertProfile({
      id: data.id,
      email: data.email || null,
      full_name: data.fullName || null,
      notify_email: data.notifyEmail,
    });
    return { success: true };
  });
