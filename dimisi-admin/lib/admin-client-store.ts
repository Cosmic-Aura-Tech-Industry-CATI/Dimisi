/**
 * DIMISI Technologies — Admin Control Room Client Store
 * Manages Admin Overview, Admin Users, Roles, Permissions, and administrator grant logic.
 * Integrates directly with Express Backend APIs (/api/v1/admin-panel/users/*).
 */
import { type AdminRole } from "./rbac.shared";
import { getAdminLeadsFn } from "@/lib/leads.functions";
import {
  getAllPanelAdmins,
  getPanelAdminById,
  createPanelAdmin,
  updatePanelAdminRole,
  activatePanelAdmin,
  deactivatePanelAdmin,
  revokePanelAdmin,
  normalizeBackendPanelUser,
  type BackendPanelUserDoc,
  type NormalizedAdminUser,
  type PanelUserFilters,
} from "@/services/adminManagement.service";

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
  employee_id?: string | null;
  emp_id?: string | null;
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

/**
 * Normalizes user objects into the clean frontend AdminUser model.
 */
export function normalizeAdminUser(raw: any): AdminUser {
  if (!raw) {
    return {
      user_id: "usr-" + Date.now().toString(36),
      employee_id: null,
      emp_id: null,
      email: null,
      full_name: "Unknown",
      designation: "Not set",
      role: "admin",
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }

  // If already normalized or raw backend document
  if (raw.user !== undefined) {
    return normalizeBackendPanelUser(raw as BackendPanelUserDoc);
  }

  const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : null;
  const fullName =
    raw.full_name ||
    raw.fullName ||
    raw.name ||
    (email ? email.split("@")[0].replace(/[._-]/g, " ") : "Administrator");
  const empId = raw.employee_id || raw.employeeId || raw.emp_id || raw.empId || null;

  let designationStr = "Not set";
  if (raw.designation) {
    if (typeof raw.designation === "string") {
      const trimmed = raw.designation.trim();
      if (/^[0-9a-fA-F]{24}$/.test(trimmed)) {
        designationStr = raw.role === "super_admin" ? "Super Admin" : "Administrator";
      } else {
        designationStr = trimmed || "Not set";
      }
    } else if (typeof raw.designation === "object") {
      designationStr = raw.designation.title || raw.designation.name || "Not set";
    }
  }

  return {
    user_id: String(raw.user_id || raw.id || raw._id || ("usr-" + Date.now().toString(36))),
    employee_id: empId ? String(empId) : null,
    emp_id: empId ? String(empId) : null,
    email: email,
    full_name: fullName,
    designation: designationStr,
    role: (raw.role as AdminRole) || "admin",
    is_active:
      raw.is_active !== undefined
        ? Boolean(raw.is_active)
        : raw.isActive !== undefined
          ? Boolean(raw.isActive)
          : true,
    created_at:
      raw.created_at || raw.createdAt || raw.since || raw.memberSince || new Date().toISOString(),
  };
}

/**
 * Loads overview metrics, leads, and administrator roster directly from Express backend.
 */
export async function getAdminOverview(): Promise<AdminOverview> {
  let admins: AdminUser[] = [];

  try {
    const backendDocs = await getAllPanelAdmins();
    if (Array.isArray(backendDocs)) {
      admins = backendDocs.map(normalizeBackendPanelUser);
    }
  } catch (err) {
    console.error("Failed to fetch admin users from backend:", err);
  }

  let leadsRes = { leads: [] as any[], total: 0, stats: { newToday: 0 } };
  try {
    leadsRes = await getAdminLeadsFn({ data: { pageSize: 50 } });
  } catch (err) {
    console.warn("Could not fetch leads:", err);
  }

  const adminLeads: AdminLead[] = (leadsRes?.leads ?? []).map((l: any) => ({
    id: l.id || `lead-${Date.now()}`,
    email: l.email || "",
    full_name: l.full_name || null,
    source: l.source || "website",
    page: l.page || null,
    message: l.message || null,
    created_at: l.created_at || new Date().toISOString(),
  }));

  // Resolve selfId and role from stored auth session
  let selfId = "";
  let currentRole: AdminRole = "super_admin";
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("dimisi_admin_session");
      if (raw) {
        const parsed = JSON.parse(raw);
        selfId = parsed?.user?.id || parsed?.user?._id || "";
        if (parsed?.user?.role) {
          currentRole = parsed.user.role as AdminRole;
        }
      }
    } catch {}
  }

  return {
    isAdmin: true,
    role: currentRole,
    stats: {
      users: admins.length || 0,
      leads: leadsRes.total || 0,
      leadsToday: leadsRes.stats?.newToday || 0,
      notifyOptIn: 0,
    },
    leads: adminLeads,
    admins,
    selfId,
  };
}

/**
 * Grant administrator access to an existing account using Account Email and Assigned Role.
 * Calls POST /api/v1/admin-panel/users/create on Express Backend.
 */
export async function grantAdminAccess({
  data,
}: {
  data: { email: string; role: AdminRole };
}): Promise<{ success: boolean; message: string; admins: AdminUser[]; admin: AdminUser }> {
  const cleanEmail = data.email?.trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error("Account Email is required.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new Error("Please provide a valid email address.");
  }

  if (!data.role) {
    throw new Error("Assigned Role is required.");
  }

  // Call Express backend endpoint POST /api/v1/admin-panel/users/create
  const res = await createPanelAdmin({ mailId: cleanEmail, role: data.role });
  const newAdmin = normalizeBackendPanelUser(res.admin);

  // Refetch full list from backend to maintain absolute source of truth
  const docs = await getAllPanelAdmins();
  const refreshedAdmins = docs.map(normalizeBackendPanelUser);

  return {
    success: true,
    message: res.message || "Administrator access granted successfully.",
    admins: refreshedAdmins,
    admin: newAdmin,
  };
}

/**
 * Updates administrator role on Express backend: PUT /api/v1/admin-panel/users/:userId
 */
export async function setAdminRole({
  data,
}: {
  data: { targetUserId: string; role?: AdminRole; newRole?: AdminRole };
}): Promise<{ success: boolean; message: string; admins: AdminUser[] }> {
  const targetRole = data.role || data.newRole;
  if (!targetRole) {
    throw new Error("Target role is required.");
  }
  if (!data.targetUserId) {
    throw new Error("Target user ID is required.");
  }

  const res = await updatePanelAdminRole(data.targetUserId, targetRole);

  // Refetch full list from backend
  const docs = await getAllPanelAdmins();
  const refreshedAdmins = docs.map(normalizeBackendPanelUser);

  return {
    success: true,
    message: res.message || "Administrator role updated successfully.",
    admins: refreshedAdmins,
  };
}

/**
 * Toggles administrator active/inactive status:
 * PUT /api/v1/admin-panel/users/:userId/activate or deactivate
 */
export async function setAdminActive({
  data,
}: {
  data: { targetUserId: string; active?: boolean; isActive?: boolean };
}): Promise<{ success: boolean; message: string; admins: AdminUser[] }> {
  const isActive = data.active !== undefined ? Boolean(data.active) : Boolean(data.isActive);
  if (!data.targetUserId) {
    throw new Error("Target user ID is required.");
  }

  let res;
  if (isActive) {
    res = await activatePanelAdmin(data.targetUserId);
  } else {
    res = await deactivatePanelAdmin(data.targetUserId);
  }

  // Refetch list from backend
  const docs = await getAllPanelAdmins();
  const refreshedAdmins = docs.map(normalizeBackendPanelUser);

  return {
    success: true,
    message: res.message || ("Administrator " + (isActive ? "activated" : "deactivated") + " successfully."),
    admins: refreshedAdmins,
  };
}

/**
 * Revokes an administrator's access permanently:
 * Calls DELETE /api/v1/admin-panel/users/:userId/revoke on Express Backend.
 */
export async function revokeAdminAccess({
  data,
}: {
  data: { targetUserId: string; userId?: string };
}): Promise<{ success: boolean; message: string; admins: AdminUser[] }> {
  const targetId = data.targetUserId || data.userId || "";
  if (!targetId) throw new Error("Target user ID is required.");

  // Delete from backend panelusers collection
  const res = await revokePanelAdmin(targetId);

  // Refetch full live list from backend
  const docs = await getAllPanelAdmins();
  const refreshedAdmins = docs.map(normalizeBackendPanelUser);

  return {
    success: true,
    message: res.message || "Administrator access revoked successfully.",
    admins: refreshedAdmins,
  };
}

// Alias for compatibility
export const deleteUserAccount = revokeAdminAccess;

export async function updateAdminProfile({
  data,
}: {
  data: { userId?: string; fullName?: string; email?: string; designation?: string };
}): Promise<{ success: boolean; message: string; admins: AdminUser[] }> {
  const docs = await getAllPanelAdmins();
  const admins = docs.map(normalizeBackendPanelUser);
  return { success: true, message: "Profile view refreshed.", admins };
}

import { loginAdmin } from "@/services/adminAuth.service";

export async function loginAdminFn({
  data,
}: {
  data: { email: string; password: string };
}): Promise<{ success: boolean; user: any; session: any }> {
  return loginAdmin(data);
}
