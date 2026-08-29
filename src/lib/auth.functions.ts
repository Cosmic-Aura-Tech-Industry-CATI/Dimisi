/**
 * Authentication Server Functions & Google OAuth Synchronization
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { adminsRepository } from "@/server/repositories/admins.repository";
import { sanitizeText } from "./reviews.shared";

const GoogleSyncSchema = z.object({
  id: z.string().min(1).max(100),
  email: z.string().email().max(160),
  fullName: z.string().max(120).optional(),
  avatarUrl: z.string().url().max(500).optional().nullable(),
});

/**
 * Server Function: Get Google OAuth 2.0 configuration.
 */
export const getGoogleAuthConfigFn = createServerFn({ method: "GET" })
  .handler(async (): Promise<{ clientId: string | null }> => {
    const clientId =
      process.env.GOOGLE_CLIENT_ID ||
      process.env.VITE_GOOGLE_CLIENT_ID ||
      "33385750247-t0h4ckf0u5d7r9f6m1e8d9q1n4j5k6p7.apps.googleusercontent.com";
    return { clientId };
  });

/**
 * Server Function: Synchronize Google OAuth user with MongoDB profiles collection.
 * Idempotent: Updates if existing, creates if new.
 * Security: NEVER grants admin privileges automatically.
 */
export const syncGoogleUserFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => GoogleSyncSchema.parse(input))
  .handler(async ({ data }): Promise<{ success: boolean; user: any }> => {
    const cleanEmail = sanitizeText(data.email, 160).toLowerCase();
    const cleanName = sanitizeText(data.fullName || cleanEmail.split("@")[0], 120);

    // Check if an existing profile exists with this email or id
    const existing = await adminsRepository.getProfile(data.id);

    const profileDoc = await adminsRepository.upsertProfile({
      id: data.id,
      email: cleanEmail,
      full_name: existing?.full_name || cleanName,
      avatar_url: data.avatarUrl || existing?.avatar_url || null,
      is_active: true,
      notify_email: existing?.notify_email ?? true,
    });

    return {
      success: true,
      user: {
        id: profileDoc.id,
        email: profileDoc.email,
        full_name: profileDoc.full_name,
        avatar_url: profileDoc.avatar_url,
      },
    };
  });
