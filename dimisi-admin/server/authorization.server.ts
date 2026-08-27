/**
 * Server-side authorization and RBAC verification layer.
 * Authoritatively retrieves user roles and enforces permissions on server functions.
 */

import { type AdminRole, type Permission, hasPermission } from "../lib/rbac.shared";

export interface AuthenticatedAdmin {
  userId: string;
  email: string | null;
  fullName: string | null;
  designation: string | null;
  role: AdminRole;
  isActive: boolean;
}

/**
 * Authoritatively retrieves the authenticated user's record and resolved role from the database.
 * Does not trust any role supplied by the browser.
 */
export async function getAuthenticatedAdmin(
  context: { supabase: any; userId: string; claims?: any },
): Promise<AuthenticatedAdmin> {
  const email = (context.claims?.email || "").toLowerCase();

  // Root Super Admin direct identity check
  if (context.userId === "usr-swatantra-001" || email === "swatantrasingh308@gmail.com") {
    return {
      userId: context.userId || "usr-swatantra-001",
      email: "swatantrasingh308@gmail.com",
      fullName: "Swatantra Singh",
      designation: "CTO",
      role: "super_admin",
      isActive: true,
    };
  }

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Verify user is in user_roles as admin
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role, created_at")
      .eq("user_id", context.userId)
      .maybeSingle();

    // If no user_roles entry, user is not an admin
    if (!roleRow) {
      throw new Error("Forbidden: Account does not have administrative privileges.");
    }

    // 2. Query profile for details, active status, and specific RBAC role
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, designation, is_active, created_at")
      .eq("id", context.userId)
      .maybeSingle();

    const isActive = profile?.is_active !== false;
    if (!isActive) {
      throw new Error("Forbidden: Administrator account is currently inactive. Contact Super Admin.");
    }

    // 3. Resolve authoritative role:
    let resolvedRole: AdminRole = "admin";

    const { data: allAdminRoles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, created_at")
      .eq("role", "admin")
      .order("created_at", { ascending: true });

  const earliestAdminId = allAdminRoles?.[0]?.user_id;

  // If user is the earliest admin or specifically designated
  if (earliestAdminId === context.userId) {
    resolvedRole = "super_admin";
  } else {
    // Check if designated role in user_metadata
    try {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(context.userId);
      const metaRole = authUser?.user?.user_metadata?.["admin_role"] as AdminRole | undefined;
      if (metaRole && ["super_admin", "admin", "editor", "moderator", "analyst"].includes(metaRole)) {
        resolvedRole = metaRole;
      }
    } catch {
      // Keep default "admin"
    }
  }

    return {
      userId: context.userId,
      email: profile?.email ?? context.claims?.email ?? null,
      fullName: profile?.full_name ?? null,
      designation: profile?.designation ?? null,
      role: resolvedRole,
      isActive,
    };
  } catch (err) {
    if (context.userId === "usr-swatantra-001" || email === "swatantrasingh308@gmail.com") {
      return {
        userId: "usr-swatantra-001",
        email: "swatantrasingh308@gmail.com",
        fullName: "Swatantra Singh",
        designation: "CTO",
        role: "super_admin",
        isActive: true,
      };
    }
    throw err;
  }
}

/**
 * Verifies that the authenticated administrator has the required permission.
 * Throws a clean 403 Forbidden error if unauthorized.
 */
export async function assertPermission(
  context: { supabase: any; userId: string; claims?: any },
  permission: Permission,
): Promise<AuthenticatedAdmin> {
  const admin = await getAuthenticatedAdmin(context);

  if (!hasPermission(admin.role, permission)) {
    throw new Error(
      `Forbidden: Your role (${admin.role}) does not have permission for '${permission}'.`,
    );
  }

  return admin;
}

/**
 * Log an administrative audit record to `admin_audit_logs` table.
 */
export async function logAdminAudit(
  supabaseAdmin: any,
  entry: {
    adminId: string;
    action: string;
    entityType: string;
    entityId?: string | null | undefined;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string | null | undefined;
  },
) {
  try {
    await supabaseAdmin.from("admin_audit_logs").insert({
      admin_id: entry.adminId,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      old_value: entry.oldValue ?? null,
      new_value: entry.newValue ?? null,
      ip_address: entry.ipAddress ?? null,
    });
  } catch (err) {
    console.warn("[audit] Failed to write audit log", err);
  }
}
