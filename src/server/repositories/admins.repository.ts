/**
 * Admin Users & Profiles Repository — MongoDB RBAC & Identity Management
 */
import {
  getCollection,
  COLLECTIONS,
  type MongoAdminUser,
  type MongoProfile,
} from "../db/collections";
import type { AdminRole, AdminUser } from "@/lib/rbac.shared";

export const ROOT_SUPER_ADMIN: AdminUser = {
  user_id: "usr-swatantra-001",
  email: "swatantrasingh308@gmail.com",
  full_name: "Swatantra Singh",
  designation: "CTO & Founder",
  role: "super_admin",
  is_active: true,
  created_at: "2025-01-01T00:00:00Z",
};

export class AdminsRepository {
  /**
   * Find an admin by user ID with Super Admin fallback.
   */
  async findByUserId(userId: string): Promise<AdminUser | null> {
    if (userId === ROOT_SUPER_ADMIN.user_id) {
      return ROOT_SUPER_ADMIN;
    }

    const col = await getCollection<MongoAdminUser>(COLLECTIONS.ADMIN_USERS);
    if (!col) return null;

    const doc = await col.findOne({ user_id: userId });
    if (!doc) return null;

    return {
      user_id: doc.user_id,
      email: doc.email,
      full_name: doc.full_name ?? null,
      designation: doc.designation ?? null,
      role: doc.role,
      is_active: doc.is_active !== false,
      created_at: doc.created_at,
    };
  }

  /**
   * Find an admin by email.
   */
  async findByEmail(email: string): Promise<AdminUser | null> {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === ROOT_SUPER_ADMIN.email) {
      return ROOT_SUPER_ADMIN;
    }

    const col = await getCollection<MongoAdminUser>(COLLECTIONS.ADMIN_USERS);
    if (!col) return null;

    const doc = await col.findOne({ email: cleanEmail });
    if (!doc) return null;

    return {
      user_id: doc.user_id,
      email: doc.email,
      full_name: doc.full_name ?? null,
      designation: doc.designation ?? null,
      role: doc.role,
      is_active: doc.is_active !== false,
      created_at: doc.created_at,
    };
  }

  /**
   * List all admin users with roles and designations.
   */
  async getAllAdmins(): Promise<AdminUser[]> {
    const col = await getCollection<MongoAdminUser>(COLLECTIONS.ADMIN_USERS);
    const result = new Map<string, AdminUser>();

    // Always include Root Super Admin
    result.set(ROOT_SUPER_ADMIN.user_id, ROOT_SUPER_ADMIN);

    if (col) {
      const docs = await col.find().sort({ created_at: 1 }).toArray();
      for (const d of docs) {
        result.set(d.user_id, {
          user_id: d.user_id,
          email: d.email,
          full_name: d.full_name ?? null,
          designation: d.designation ?? null,
          role: d.user_id === ROOT_SUPER_ADMIN.user_id ? "super_admin" : d.role,
          is_active: d.is_active !== false,
          created_at: d.created_at,
        });
      }
    }

    return Array.from(result.values());
  }

  /**
   * Create a new administrative user in MongoDB.
   */
  async createAdmin(user: {
    email: string;
    full_name?: string;
    designation?: string;
    role: AdminRole;
    password_hash?: string;
  }): Promise<AdminUser> {
    const cleanEmail = user.email.trim().toLowerCase();
    const userId = `usr-adm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    const doc: MongoAdminUser = {
      user_id: userId,
      email: cleanEmail,
      full_name: user.full_name?.trim() || null,
      designation: user.designation?.trim() || null,
      role: user.role,
      is_active: true,
      password_hash: user.password_hash || null,
      created_at: now,
      updated_at: now,
    };

    const col = await getCollection<MongoAdminUser>(COLLECTIONS.ADMIN_USERS);
    if (col) {
      await col.updateOne({ email: cleanEmail }, { $set: doc }, { upsert: true });
    }

    // Also update profiles collection
    const profilesCol = await getCollection<MongoProfile>(COLLECTIONS.PROFILES);
    if (profilesCol) {
      await profilesCol.updateOne(
        { id: userId },
        {
          $set: {
            id: userId,
            email: cleanEmail,
            full_name: doc.full_name,
            designation: doc.designation,
            is_active: true,
            created_at: now,
            updated_at: now,
          },
        },
        { upsert: true },
      );
    }

    return {
      user_id: userId,
      email: cleanEmail,
      full_name: doc.full_name,
      designation: doc.designation,
      role: doc.role,
      is_active: true,
      created_at: now,
    };
  }

  /**
   * Update admin role or designation.
   */
  async updateAdmin(
    userId: string,
    updates: {
      role?: AdminRole;
      designation?: string | null;
      full_name?: string | null;
      is_active?: boolean;
    },
  ): Promise<boolean> {
    if (userId === ROOT_SUPER_ADMIN.user_id && updates.is_active === false) {
      throw new Error("Root Super Admin cannot be deactivated.");
    }

    const col = await getCollection<MongoAdminUser>(COLLECTIONS.ADMIN_USERS);
    if (!col) return false;

    const setFields: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.role !== undefined) setFields.role = updates.role;
    if (updates.designation !== undefined) setFields.designation = updates.designation;
    if (updates.full_name !== undefined) setFields.full_name = updates.full_name;
    if (updates.is_active !== undefined) setFields.is_active = updates.is_active;

    const res = await col.updateOne({ user_id: userId }, { $set: setFields });

    // Also sync with profiles collection
    const profilesCol = await getCollection<MongoProfile>(COLLECTIONS.PROFILES);
    if (profilesCol) {
      const profileUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (updates.designation !== undefined) profileUpdates.designation = updates.designation;
      if (updates.full_name !== undefined) profileUpdates.full_name = updates.full_name;
      if (updates.is_active !== undefined) profileUpdates.is_active = updates.is_active;
      await profilesCol.updateOne({ id: userId }, { $set: profileUpdates });
    }

    return res.acknowledged;
  }

  /**
   * Delete an admin user account.
   */
  async deleteAdmin(userId: string): Promise<boolean> {
    if (userId === ROOT_SUPER_ADMIN.user_id) {
      throw new Error("Root Super Admin cannot be deleted.");
    }

    const col = await getCollection<MongoAdminUser>(COLLECTIONS.ADMIN_USERS);
    if (!col) return false;

    await col.deleteOne({ user_id: userId });

    const profilesCol = await getCollection<MongoProfile>(COLLECTIONS.PROFILES);
    if (profilesCol) {
      await profilesCol.deleteOne({ id: userId });
    }

    return true;
  }

  /**
   * User profile management for Account Page.
   */
  async getProfile(id: string): Promise<MongoProfile | null> {
    const col = await getCollection<MongoProfile>(COLLECTIONS.PROFILES);
    if (!col) return null;
    const doc = await col.findOne({ id });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return rest as MongoProfile;
  }

  async upsertProfile(profile: Partial<MongoProfile> & { id: string }): Promise<MongoProfile> {
    const col = await getCollection<MongoProfile>(COLLECTIONS.PROFILES);
    const now = new Date().toISOString();
    const doc: MongoProfile = {
      id: profile.id,
      email: profile.email || null,
      full_name: profile.full_name || null,
      avatar_url: profile.avatar_url || null,
      designation: profile.designation || null,
      is_active: profile.is_active !== false,
      notify_email: profile.notify_email !== false,
      created_at: profile.created_at || now,
      updated_at: now,
    };

    if (col) {
      await col.updateOne({ id: profile.id }, { $set: doc }, { upsert: true });
    }
    return doc;
  }

  async countProfiles(): Promise<number> {
    const col = await getCollection<MongoProfile>(COLLECTIONS.PROFILES);
    if (!col) return 1;
    return (await col.countDocuments()) || 1;
  }

  async countNotifyOptIns(): Promise<number> {
    const col = await getCollection<MongoProfile>(COLLECTIONS.PROFILES);
    if (!col) return 1;
    return (await col.countDocuments({ notify_email: true })) || 1;
  }
}

export const adminsRepository = new AdminsRepository();
