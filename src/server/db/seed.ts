/**
 * Idempotent Seed Runner for MongoDB
 * Ensures that if collections are empty, initial curated data is loaded.
 */
import { ensureMongoIndexes } from "./indexes";
import { getCollection, COLLECTIONS } from "./collections";
import { ROOT_SUPER_ADMIN } from "../repositories/admins.repository";

export async function seedMongoDatabaseIfEmpty(): Promise<void> {
  try {
    await ensureMongoIndexes();

    // 1. Ensure Super Admin exists in admin_users
    const adminsCol = await getCollection(COLLECTIONS.ADMIN_USERS);
    if (adminsCol) {
      await adminsCol.updateOne(
        { email: ROOT_SUPER_ADMIN.email },
        {
          $setOnInsert: {
            user_id: ROOT_SUPER_ADMIN.user_id,
            email: ROOT_SUPER_ADMIN.email,
            full_name: ROOT_SUPER_ADMIN.full_name,
            designation: ROOT_SUPER_ADMIN.designation,
            role: ROOT_SUPER_ADMIN.role,
            is_active: true,
            created_at: ROOT_SUPER_ADMIN.created_at,
          },
        },
        { upsert: true },
      );
    }

    // 2. Ensure Profiles has Super Admin
    const profilesCol = await getCollection(COLLECTIONS.PROFILES);
    if (profilesCol) {
      await profilesCol.updateOne(
        { id: ROOT_SUPER_ADMIN.user_id },
        {
          $setOnInsert: {
            id: ROOT_SUPER_ADMIN.user_id,
            email: ROOT_SUPER_ADMIN.email,
            full_name: ROOT_SUPER_ADMIN.full_name,
            designation: ROOT_SUPER_ADMIN.designation,
            is_active: true,
            notify_email: true,
            created_at: ROOT_SUPER_ADMIN.created_at,
            updated_at: ROOT_SUPER_ADMIN.created_at,
          },
        },
        { upsert: true },
      );
    }

    // 3. Ensure Default Review Settings
    const settingsCol = await getCollection(COLLECTIONS.SETTINGS);
    if (settingsCol) {
      await settingsCol.updateOne(
        { id: true },
        {
          $setOnInsert: {
            id: true,
            notify_on_submit: true,
            notify_on_approve: true,
            notify_on_reject: false,
            notify_on_report: true,
            notify_campaign_summary: false,
            notify_email: "hello@dimisi.in",
            updated_at: new Date().toISOString(),
          },
        },
        { upsert: true },
      );
    }
  } catch (err) {
    console.warn("[mongodb] Note seeding database:", err instanceof Error ? err.message : String(err));
  }
}
