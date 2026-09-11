/**
 * DIMISI Technologies — Admin Control Room Client Store
 * Manages Admin Overview, Admin Users, Roles, Permissions, and administrator grant logic.
 * Integrates directly with Express Backend with defensive data normalization.
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
  normalizeBackendPanelUser,
  type BackendPanelUserDoc,
  type NormalizedAdminUser,
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

const ADMINS_STORAGE_KEY = "dimisi_admin_users_v1";

export function normalizeAdminUser(raw: any): AdminUser {
  if (!raw) {
    return {
      user_id: "usr-" + Date.now().toString(36),
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
  const fullName = raw.full_name || raw.fullName || raw.name || (email ? email.split("@")[0].replace(/[._-]/g, " ") : "Administrator");

  let designationStr = "Not set";
  if (raw.designation) {
    if (typeof raw.designation === "string") {
      designationStr = raw.designation.trim() || "Not set";
    } else if (typeof raw.designation === "object") {
      designationStr = raw.designation.title || raw.designation.name || "Not set";
    }
  }

  return {
    user_id: String(raw.user_id || raw.id || raw._id || ("usr-" + Date.now().toString(36))),
    email: email,
    full_name: fullName,
    designation: designationStr,
    role: (raw.role as AdminRole) || "admin",
    is_active: raw.is_active !== undefined ? Boolean(raw.is_active) : raw.isActive !== undefined ? Boolean(raw.isActive) : true,
    created_at: raw.created_at || raw.createdAt || raw.since || raw.memberSince || new Date().toISOString(),
  };
}

export function getStoredAdmins(): AdminUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ADMINS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeAdminUser);
      }
    }
  } catch {}
  return [];
}

export function saveStoredAdmins(admins: AdminUser[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(admins.map(normalizeAdminUser)));
  } catch {}
}

export async function getAdminOverview(): Promise<AdminOverview> {
  let admins: AdminUser[] = [];

  try {
    const backendDocs = await getAllPanelAdmins();
    if (Array.isArray(backendDocs)) {
      admins = backendDocs.map(normalizeBackendPanelUser);
      saveStoredAdmins(admins);
    }
  } catch (err) {
    console.warn("Could not fetch real admin users from backend, reading cache:", err);
    admins = getStoredAdmins();
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

  // Resolve selfId from stored auth session
  let selfId = "";
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("dimisi_admin_session");
      if (raw) {
        const parsed = JSON.parse(raw);
        selfId = parsed?.user?.id || "";
      }
    } catch {}
  }

  return {
    isAdmin: true,
    role: "super_admin",
    stats: {
      users: admins.length || 1,
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
  let refreshedAdmins: AdminUser[] = [];
  try {
    const docs = await getAllPanelAdmins();
    refreshedAdmins = docs.map(normalizeBackendPanelUser);
    saveStoredAdmins(refreshedAdmins);
  } catch {
    refreshedAdmins = [newAdmin, ...getStoredAdmins().filter((a) => a.user_id !== newAdmin.user_id)];
    saveStoredAdmins(refreshedAdmins);
  }

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
  let refreshedAdmins: AdminUser[] = [];
  try {
    const docs = await getAllPanelAdmins();
    refreshedAdmins = docs.map(normalizeBackendPanelUser);
    saveStoredAdmins(refreshedAdmins);
  } catch {
    const current = getStoredAdmins();
    const idx = current.findIndex((a) => a.user_id === data.targetUserId);
    if (idx !== -1) {
      current[idx].role = targetRole;
    }
    refreshedAdmins = current;
    saveStoredAdmins(refreshedAdmins);
  }

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
  let refreshedAdmins: AdminUser[] = [];
  try {
    const docs = await getAllPanelAdmins();
    refreshedAdmins = docs.map(normalizeBackendPanelUser);
    saveStoredAdmins(refreshedAdmins);
  } catch {
    const current = getStoredAdmins();
    const idx = current.findIndex((a) => a.user_id === data.targetUserId);
    if (idx !== -1) {
      current[idx].is_active = isActive;
    }
    refreshedAdmins = current;
    saveStoredAdmins(refreshedAdmins);
  }

  return {
    success: true,
    message: res.message || ("Administrator " + (isActive ? "activated" : "deactivated") + " successfully."),
    admins: refreshedAdmins,
  };
}

/**
 * Deactivates an administrator account (Backend does not support permanent DB row deletion for audit integrity).
 */
export async function deleteUserAccount({
  data,
}: {
  data: { targetUserId: string; userId?: string };
}): Promise<{ success: boolean; message: string; admins: AdminUser[] }> {
  const targetId = data.targetUserId || data.userId || "";
  if (!targetId) throw new Error("Target user ID is required.");

  // Deactivate on backend
  const res = await deactivatePanelAdmin(targetId);

  let refreshedAdmins: AdminUser[] = [];
  try {
    const docs = await getAllPanelAdmins();
    refreshedAdmins = docs.map(normalizeBackendPanelUser);
    saveStoredAdmins(refreshedAdmins);
  } catch {
    const current = getStoredAdmins();
    const idx = current.findIndex((a) => a.user_id === targetId);
    if (idx !== -1) {
      current[idx].is_active = false;
    }
    refreshedAdmins = current;
    saveStoredAdmins(refreshedAdmins);
  }

  return {
    success: true,
    message: res.message || "Administrator access revoked (account deactivated).",
    admins: refreshedAdmins,
  };
}

export async function updateAdminProfile({
  data,
}: {
  data: { userId?: string; fullName?: string; email?: string; designation?: string };
}): Promise<{ success: boolean; message: string; admins: AdminUser[] }> {
  const admins = getStoredAdmins();
  if (data.userId) {
    const idx = admins.findIndex((a) => a.user_id === data.userId);
    if (idx !== -1) {
      if (data.fullName) admins[idx].full_name = data.fullName.trim();
      if (data.designation) admins[idx].designation = data.designation.trim();
      if (data.email) admins[idx].email = data.email.trim().toLowerCase();
      saveStoredAdmins(admins);
    }
  }
  return { success: true, message: "Profile view refreshed.", admins };
}

import { loginAdmin } from "@/services/adminAuth.service";

export async function loginAdminFn({
  data,
}: {
  data: { email: string; password: string };
}): Promise<{ success: boolean; token: string; user: any; expires_at: number }> {
  return loginAdmin(data);
}
