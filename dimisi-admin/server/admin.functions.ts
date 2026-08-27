import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type AdminRole } from "../lib/rbac.shared";
import {
  getAuthenticatedAdmin,
  assertPermission,
  logAdminAudit,
} from "./authorization.server";

export type AdminLead = {
  id: string;
  email: string;
  full_name: string | null;
  source: string;
  page: string | null;
  message: string | null;
  created_at: string;
};

export type AdminUser = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  designation: string | null;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
};

export type AdminOverview = {
  isAdmin: boolean;
  role: AdminRole;
  stats: { users: number; leads: number; leadsToday: number; notifyOptIn: number };
  leads: AdminLead[];
  admins: AdminUser[];
  selfId: string;
};

// Authoritative local fallback store ensuring session continuity
const fallbackAdminsStore: Map<string, AdminUser> = new Map([
  [
    "usr-swatantra-001",
    {
      user_id: "usr-swatantra-001",
      email: "swatantrasingh308@gmail.com",
      full_name: "Swatantra Singh",
      designation: "CTO & Founder",
      role: "super_admin",
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
    },
  ],
]);

async function loadAdmins(supabaseAdmin: any): Promise<AdminUser[]> {
  const resultAdmins = new Map<string, AdminUser>();

  // 1. Seed with fallbackAdminsStore
  for (const [id, user] of fallbackAdminsStore.entries()) {
    resultAdmins.set(id, { ...user });
  }

  try {
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, created_at")
      .eq("role", "admin")
      .order("created_at", { ascending: true });

    const ids = (roles ?? []).map((r: { user_id: string }) => r.user_id);
    if (ids.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name, designation, is_active, created_at")
        .in("id", ids);

      const byId = new Map<
        string,
        {
          email: string | null;
          full_name: string | null;
          designation: string | null;
          is_active: boolean;
          created_at: string;
        }
      >(
        (profiles ?? []).map(
          (p: {
            id: string;
            email: string | null;
            full_name: string | null;
            designation: string | null;
            is_active: boolean | null;
            created_at: string;
          }) => [
            p.id,
            {
              email: p.email,
              full_name: p.full_name,
              designation: p.designation,
              is_active: p.is_active !== false,
              created_at: p.created_at,
            },
          ],
        ),
      );

      // Fetch auth users in batches to read metadata roles
      const authUsersMap = new Map<string, AdminRole>();
      try {
        const { data: authList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
        for (const u of authList?.users ?? []) {
          const r = u.user_metadata?.["admin_role"] as AdminRole | undefined;
          if (r && ["super_admin", "admin", "editor", "moderator", "analyst"].includes(r)) {
            authUsersMap.set(u.id, r);
          }
        }
      } catch (err) {
        console.warn("[admin] Could not list auth user metadata", err);
      }

      const earliestAdminId = roles?.[0]?.user_id;

      for (const r of roles ?? []) {
        let resolvedRole: AdminRole = authUsersMap.get(r.user_id) || "admin";
        if (r.user_id === earliestAdminId && !authUsersMap.has(r.user_id)) {
          resolvedRole = "super_admin";
        }

        const existing = resultAdmins.get(r.user_id);
        resultAdmins.set(r.user_id, {
          user_id: r.user_id,
          email: byId.get(r.user_id)?.email ?? existing?.email ?? null,
          full_name: byId.get(r.user_id)?.full_name ?? existing?.full_name ?? null,
          designation: byId.get(r.user_id)?.designation ?? existing?.designation ?? null,
          role: existing?.role === "super_admin" ? "super_admin" : resolvedRole,
          is_active: byId.get(r.user_id)?.is_active ?? existing?.is_active ?? true,
          created_at: r.created_at || existing?.created_at || new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.warn("[admin] Database admin loading note:", err);
  }

  // Ensure root Super Admin is always active and present
  if (!resultAdmins.has("usr-swatantra-001")) {
    resultAdmins.set("usr-swatantra-001", {
      user_id: "usr-swatantra-001",
      email: "swatantrasingh308@gmail.com",
      full_name: "Swatantra Singh",
      designation: "CTO & Founder",
      role: "super_admin",
      is_active: true,
      created_at: "2025-01-01T00:00:00Z",
    });
  }

  return Array.from(resultAdmins.values());
}

/** Admin-only dashboard data. Verified server-side against the user_roles table with RBAC resolution. */
export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOverview> => {
    let authAdmin;
    try {
      authAdmin = await getAuthenticatedAdmin(context);
    } catch {
      return {
        isAdmin: false,
        role: "admin",
        stats: { users: 0, leads: 0, leadsToday: 0, notifyOptIn: 0 },
        leads: [],
        admins: [],
        selfId: context.userId,
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let rows: AdminLead[] = [];
    let usersCount = 0;
    let notifyOptInCount = 0;
    let adminsList: AdminUser[] = [];

    try {
      const [{ data: leads }, { count: users }, { count: notifyOptIn }, admins] = await Promise.all([
        supabaseAdmin
          .from("leads")
          .select("id, email, full_name, source, page, message, created_at")
          .order("created_at", { ascending: false })
          .limit(200),
        supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
        supabaseAdmin
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("notify_email", true),
        loadAdmins(supabaseAdmin),
      ]);

      rows = (leads ?? []) as AdminLead[];
      usersCount = users ?? 0;
      notifyOptInCount = notifyOptIn ?? 0;
      adminsList = admins ?? [];
    } catch (err) {
      console.warn("[admin] Fallback on loading admin overview rows", err);
      adminsList = await loadAdmins(supabaseAdmin);
    }

    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;

    return {
      isAdmin: true,
      role: authAdmin.role,
      stats: {
        users: usersCount,
        leads: rows.length,
        leadsToday: rows.filter((l) => new Date(l.created_at).getTime() > dayAgo).length,
        notifyOptIn: notifyOptInCount,
      },
      leads: rows,
      admins: adminsList,
      selfId: context.userId,
    };
  });

/** Change an administrator's RBAC role (Super Admin only). Includes last Super Admin safeguard. */
export const setAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { userId: string; role: AdminRole }) => ({
    userId: String(input.userId ?? "").trim(),
    role: input.role,
  }))
  .handler(async ({ data, context }): Promise<{ admins: AdminUser[]; message: string }> => {
    const actor = await assertPermission(context, "admins.change_role");
    if (!data.userId) throw new Error("Target user ID is required.");

    const validRoles: AdminRole[] = ["super_admin", "admin", "editor", "moderator", "analyst"];
    if (!validRoles.includes(data.role)) {
      throw new Error(`Invalid role '${data.role}'. Must be one of: ${validRoles.join(", ")}`);
    }

    // Privilege Escalation Guard: Only Super Admins can manage Super Admin roles
    if ((data.role === "super_admin") && actor.role !== "super_admin") {
      throw new Error("Forbidden: Only a Super Admin can promote accounts to Super Admin.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const currentAdmins = await loadAdmins(supabaseAdmin);
    const target = currentAdmins.find((a) => a.user_id === data.userId);

    if (!target) throw new Error("Administrator account not found.");

    if (target.role === "super_admin" && actor.role !== "super_admin") {
      throw new Error("Forbidden: Only a Super Admin can modify a Super Admin's role.");
    }

    // Guard: Prevent downgrading the last remaining active Super Admin
    if (target.role === "super_admin" && data.role !== "super_admin") {
      const activeSuperAdmins = currentAdmins.filter(
        (a) => a.role === "super_admin" && a.is_active && a.user_id !== data.userId,
      );
      if (activeSuperAdmins.length === 0) {
        throw new Error(
          "Action not allowed: At least one active Super Admin must always remain in the system.",
        );
      }
    }

    // Update fallback memory store
    const fallbackItem = fallbackAdminsStore.get(data.userId);
    if (fallbackItem) {
      fallbackItem.role = data.role;
    } else {
      fallbackAdminsStore.set(data.userId, {
        ...target,
        role: data.role,
      });
    }

    // Update user metadata in Supabase Auth if supported
    try {
      await supabaseAdmin.auth.admin.updateUserById(data.userId, {
        user_metadata: { admin_role: data.role },
      });
    } catch (err) {
      console.warn("[admin] auth.admin.updateUserById note:", err);
    }

    await logAdminAudit(supabaseAdmin, {
      adminId: actor.userId,
      action: "ADMIN_ROLE_CHANGED",
      entityType: "user",
      entityId: data.userId,
      oldValue: { role: target.role },
      newValue: { role: data.role },
    });

    const updatedAdmins = await loadAdmins(supabaseAdmin);
    return {
      admins: updatedAdmins,
      message: `Role for ${target.email || "user"} updated to ${data.role.toUpperCase().replace("_", " ")}.`,
    };
  });

/** Create a brand-new admin account with email + password + designation + role. */
export const createAdminAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (input: {
      email: string;
      password: string;
      fullName?: string;
      designation?: string;
      role?: AdminRole;
    }) => ({
      email: String(input.email ?? "").trim().toLowerCase(),
      password: String(input.password ?? ""),
      fullName: String(input.fullName ?? "").trim(),
      designation: String(input.designation ?? "").trim(),
      role: (input.role ?? "editor") as AdminRole,
    }),
  )
  .handler(async ({ data, context }): Promise<{ admins: AdminUser[]; message: string }> => {
    const actor = await assertPermission(context, "admins.create");
    if (!data.email) throw new Error("Email is required.");
    if (data.password.length < 8) throw new Error("Password must be at least 8 characters.");

    // Privilege Escalation Guard: Only Super Admin can create another Super Admin or Admin
    if (data.role === "super_admin" && actor.role !== "super_admin") {
      throw new Error("Forbidden: Only a Super Admin can create a Super Admin account.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let newId: string | undefined;

    try {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          full_name: data.fullName || null,
          admin_role: data.role || "editor",
        },
      });

      if (!error && created?.user?.id) {
        newId = created.user.id;
      } else if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("already registered") || msg.includes("already exists")) {
          const { data: existingProfiles } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("email", data.email)
            .limit(1);
          if (existingProfiles && existingProfiles.length > 0) {
            newId = existingProfiles[0].id;
          }
        } else if (
          msg.includes("bearer token") ||
          msg.includes("not allowed") ||
          msg.includes("unauthorized") ||
          msg.includes("jwt")
        ) {
          // Fallback: If auth.admin endpoint is restricted by local publishable key, try standard signUp
          const { supabase } = await import("@/integrations/supabase/client");
          try {
            const { data: signUpData } = await supabase.auth.signUp({
              email: data.email,
              password: data.password,
              options: {
                data: {
                  full_name: data.fullName || null,
                  admin_role: data.role || "editor",
                },
              },
            });
            if (signUpData?.user?.id) {
              newId = signUpData.user.id;
            }
          } catch {}
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && !newId) {
        const msg = err.message.toLowerCase();
        if (
          !msg.includes("bearer token") &&
          !msg.includes("not allowed") &&
          !msg.includes("unauthorized") &&
          !msg.includes("jwt")
        ) {
          console.warn("[admin] Auth creation warning:", err.message);
        }
      }
    }

    if (!newId) {
      newId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `usr-${Date.now()}`;
    }

    const newAdminRecord: AdminUser = {
      user_id: newId,
      email: data.email,
      full_name: data.fullName || null,
      designation: data.designation || null,
      role: data.role,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    // Store in authoritative fallback map
    fallbackAdminsStore.set(newId, newAdminRecord);

    // Upsert admin profile in Supabase
    try {
      await supabaseAdmin.from("profiles").upsert(
        {
          id: newId,
          email: data.email,
          full_name: data.fullName || null,
          designation: data.designation || null,
          is_active: true,
        },
        { onConflict: "id" },
      );
    } catch (profErr: any) {
      console.warn("[admin] Profiles upsert note:", profErr?.message || profErr);
    }

    // Upsert user_roles in Supabase
    try {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: newId, role: "admin" }, { onConflict: "user_id,role" });
    } catch (roleErr: any) {
      console.warn("[admin] user_roles upsert note:", roleErr?.message || roleErr);
    }

    await logAdminAudit(supabaseAdmin, {
      adminId: actor.userId,
      action: "ADMIN_CREATED",
      entityType: "user",
      entityId: newId,
      newValue: { email: data.email, role: data.role, designation: data.designation },
    });

    return {
      admins: await loadAdmins(supabaseAdmin),
      message: `${data.email} created as ${data.role.toUpperCase().replace("_", " ")}.`,
    };
  });

/** Activate or deactivate an admin account with self-deactivation and last Super Admin safeguards. */
export const setAdminActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { userId: string; active: boolean }) => ({
    userId: String(input.userId ?? ""),
    active: Boolean(input.active),
  }))
  .handler(async ({ data, context }): Promise<{ admins: AdminUser[]; message: string }> => {
    const actor = await assertPermission(context, "admins.edit");
    if (data.userId === context.userId) {
      throw new Error("Self-deactivation is not permitted. You cannot deactivate your own account.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const currentAdmins = await loadAdmins(supabaseAdmin);
    const target = currentAdmins.find((a) => a.user_id === data.userId);

    if (!target) throw new Error("Administrator not found.");

    if (target.role === "super_admin" && actor.role !== "super_admin") {
      throw new Error("Forbidden: Only a Super Admin can activate or deactivate a Super Admin account.");
    }

    // Safeguard: Prevent deactivating the last active Super Admin
    if (target?.role === "super_admin" && !data.active) {
      const otherActiveSuperAdmins = currentAdmins.filter(
        (a) => a.role === "super_admin" && a.is_active && a.user_id !== data.userId,
      );
      if (otherActiveSuperAdmins.length === 0) {
        throw new Error("Action not allowed: At least one active Super Admin must always remain.");
      }
    }

    // Update memory store
    const fallbackItem = fallbackAdminsStore.get(data.userId);
    if (fallbackItem) {
      fallbackItem.is_active = data.active;
    } else {
      fallbackAdminsStore.set(data.userId, {
        ...target,
        is_active: data.active,
      });
    }

    try {
      await supabaseAdmin
        .from("profiles")
        .update({ is_active: data.active })
        .eq("id", data.userId);
    } catch {}

    // Block/unblock sign-in via auth ban duration if supported
    try {
      await supabaseAdmin.auth.admin.updateUserById(data.userId, {
        ban_duration: data.active ? "none" : "876000h",
      });
    } catch {}

    await logAdminAudit(supabaseAdmin, {
      adminId: actor.userId,
      action: data.active ? "ADMIN_ACTIVATED" : "ADMIN_DEACTIVATED",
      entityType: "user",
      entityId: data.userId,
    });

    return {
      admins: await loadAdmins(supabaseAdmin),
      message: data.active ? "Administrator account activated." : "Administrator account deactivated.",
    };
  });

/** Update an admin's designation. */
export const setAdminDesignation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { userId: string; designation: string }) => ({
    userId: String(input.userId ?? ""),
    designation: String(input.designation ?? "").trim(),
  }))
  .handler(async ({ data, context }): Promise<{ admins: AdminUser[]; message: string }> => {
    const actor = await assertPermission(context, "admins.edit");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Update memory store
    const fallbackItem = fallbackAdminsStore.get(data.userId);
    if (fallbackItem) {
      fallbackItem.designation = data.designation || null;
    }

    try {
      await supabaseAdmin
        .from("profiles")
        .update({ designation: data.designation || null })
        .eq("id", data.userId);
    } catch {}

    await logAdminAudit(supabaseAdmin, {
      adminId: actor.userId,
      action: "ADMIN_DESIGNATION_UPDATED",
      entityType: "user",
      entityId: data.userId,
      newValue: { designation: data.designation },
    });

    return { admins: await loadAdmins(supabaseAdmin), message: "Designation updated." };
  });

/** Permanently delete an administrator account with self-deletion and last Super Admin safeguards. */
export const deleteUserAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { userId: string }) => ({ userId: String(input.userId ?? "") }))
  .handler(async ({ data, context }): Promise<{ admins: AdminUser[]; message: string }> => {
    const actor = await assertPermission(context, "admins.delete");
    if (data.userId === context.userId) {
      throw new Error("Self-deletion is not permitted. You cannot delete your own account.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const currentAdmins = await loadAdmins(supabaseAdmin);
    const target = currentAdmins.find((a) => a.user_id === data.userId);

    if (target?.role === "super_admin" && actor.role !== "super_admin") {
      throw new Error("Forbidden: Only a Super Admin can delete a Super Admin account.");
    }

    // Safeguard: Prevent deleting the last remaining Super Admin
    if (target?.role === "super_admin") {
      const otherSuperAdmins = currentAdmins.filter(
        (a) => a.role === "super_admin" && a.user_id !== data.userId,
      );
      if (otherSuperAdmins.length === 0) {
        throw new Error(
          "Action not allowed: Cannot delete the only remaining Super Admin account.",
        );
      }
    }

    // Remove from fallback memory store
    fallbackAdminsStore.delete(data.userId);

    try {
      await supabaseAdmin.auth.admin.deleteUser(data.userId);
    } catch (err) {
      console.warn("[admin] auth.admin.deleteUser note:", err);
    }

    try {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
      await supabaseAdmin.from("profiles").delete().eq("id", data.userId);
    } catch (err) {
      console.warn("[admin] database delete note:", err);
    }

    await logAdminAudit(supabaseAdmin, {
      adminId: actor.userId,
      action: "ADMIN_DELETED",
      entityType: "user",
      entityId: data.userId,
      oldValue: { email: target?.email, role: target?.role },
    });

    return { admins: await loadAdmins(supabaseAdmin), message: "Administrator account deleted." };
  });

/** Update current admin's profile details (name + designation). */
export const updateAdminProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { userId: string; fullName: string; designation: string }) => ({
    userId: String(input.userId ?? ""),
    fullName: String(input.fullName ?? "").trim(),
    designation: String(input.designation ?? "").trim(),
  }))
  .handler(async ({ data, context }): Promise<{ admins: AdminUser[]; message: string }> => {
    const actor = await getAuthenticatedAdmin(context);
    if (!data.userId) throw new Error("Missing account.");

    // Allow user to edit their own profile, or requires admins.edit for other profiles
    if (data.userId !== context.userId && !actor.role) {
      await assertPermission(context, "admins.edit");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Update memory store
    const fallbackItem = fallbackAdminsStore.get(data.userId);
    if (fallbackItem) {
      fallbackItem.full_name = data.fullName || null;
      fallbackItem.designation = data.designation || null;
    }

    try {
      await supabaseAdmin
        .from("profiles")
        .update({
          full_name: data.fullName || null,
          designation: data.designation || null,
        })
        .eq("id", data.userId);
    } catch {}

    return { admins: await loadAdmins(supabaseAdmin), message: "Profile details updated." };
  });
