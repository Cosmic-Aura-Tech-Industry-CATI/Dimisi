/**
 * Server-side authorization and RBAC verification layer.
 * Authoritatively retrieves user roles and enforces permissions on server functions using MongoDB.
 */
import { type AdminRole, type Permission, hasPermission } from "../lib/rbac.shared";
import { adminsRepository, ROOT_SUPER_ADMIN } from "@/server/repositories/admins.repository";
import { auditLogsRepository } from "@/server/repositories/auditLogs.repository";

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
  context: { userId?: string; claims?: any; email?: string | null },
): Promise<AuthenticatedAdmin> {
  const email = (context.claims?.email || "").toLowerCase();
  const userId = context.userId || "";

  // 1. Root Super Admin direct identity check
  if (
    userId === ROOT_SUPER_ADMIN.user_id ||
    email === ROOT_SUPER_ADMIN.email ||
    userId === "usr-swatantra-001" ||
    email === "swatantrasingh308@gmail.com"
  ) {
    return {
      userId: ROOT_SUPER_ADMIN.user_id,
      email: ROOT_SUPER_ADMIN.email,
      fullName: ROOT_SUPER_ADMIN.full_name ?? "Swatantra Singh",
      designation: ROOT_SUPER_ADMIN.designation ?? "CTO & Founder",
      role: "super_admin",
      isActive: true,
    };
  }

  // 2. Query MongoDB admins repository
  let admin = userId ? await adminsRepository.findByUserId(userId) : null;
  if (!admin && email) {
    admin = await adminsRepository.findByEmail(email);
  }

  if (!admin) {
    throw new Error("Forbidden: Account does not have administrative privileges.");
  }

  if (!admin.is_active) {
    throw new Error("Forbidden: Administrator account is currently inactive. Contact Super Admin.");
  }

  return {
    userId: admin.user_id,
    email: admin.email,
    fullName: admin.full_name,
    designation: admin.designation,
    role: admin.role,
    isActive: admin.is_active,
  };
}

/**
 * Verifies that the authenticated administrator has the required permission.
 * Throws a clean 403 Forbidden error if unauthorized.
 */
export async function assertPermission(
  context: { userId?: string; claims?: any; email?: string | null },
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
 * Log an administrative audit record to `admin_audit_logs` in MongoDB.
 */
export async function logAdminAudit(
  _clientOrAdmin: any,
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
    await auditLogsRepository.log({
      admin_id: entry.adminId,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId || "unknown",
      old_value: entry.oldValue,
      new_value: entry.newValue,
      ip_address: entry.ipAddress,
    });
  } catch (err) {
    console.warn("[audit] Failed to write audit log to MongoDB:", err);
  }
}
