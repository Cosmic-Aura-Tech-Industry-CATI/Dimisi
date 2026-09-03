/**
 * DIMISI Technologies — Admin Control Room Client Store
 * Pure client-side store managing Admin Overview, Admin Users, Roles, and Permissions.
 */
import { type AdminRole } from "./rbac.shared";
import { getAdminLeadsFn } from "@/lib/leads.functions";

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

const INITIAL_ADMINS: AdminUser[] = [
  {
    user_id: "usr-swatantra-001",
    email: "swatantrasingh308@gmail.com",
    full_name: "Swatantra Singh",
    designation: "Founder & Chief Architect",
    role: "super_admin",
    is_active: true,
    created_at: new Date(Date.now() - 365 * 86400000).toISOString(),
  },
  {
    user_id: "usr-demo-002",
    email: "harsh@dimisi.in",
    full_name: "Harsh Mishra",
    designation: "Core Platform Engineer",
    role: "admin",
    is_active: true,
    created_at: new Date(Date.now() - 180 * 86400000).toISOString(),
  },
  {
    user_id: "usr-demo-003",
    email: "ananya.sen@dimisi.in",
    full_name: "Ananya Sen",
    designation: "AI & ML Research Lead",
    role: "editor",
    is_active: true,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
];

function getStoredAdmins(): AdminUser[] {
  if (typeof window === "undefined") return INITIAL_ADMINS;
  try {
    const raw = localStorage.getItem(ADMINS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_ADMINS;
}

function saveStoredAdmins(admins: AdminUser[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(admins));
  } catch {}
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const admins = getStoredAdmins();
  const leadsRes = await getAdminLeadsFn({ data: { pageSize: 50 } });

  const adminLeads: AdminLead[] = leadsRes.leads.map((l) => ({
    id: l.id,
    email: l.email,
    full_name: l.full_name || null,
    source: l.source || "website",
    page: l.page || null,
    message: l.message || null,
    created_at: l.created_at,
  }));

  return {
    isAdmin: true,
    role: "super_admin",
    stats: {
      users: 148,
      leads: leadsRes.total,
      leadsToday: leadsRes.stats.newToday,
      notifyOptIn: 132,
    },
    leads: adminLeads,
    admins,
    selfId: "usr-swatantra-001",
  };
}

export async function setAdminRole({
  data,
}: {
  data: { targetUserId: string; newRole: AdminRole };
}): Promise<{ success: boolean }> {
  const admins = getStoredAdmins();
  const idx = admins.findIndex((a) => a.user_id === data.targetUserId);
  if (idx !== -1) {
    admins[idx].role = data.newRole;
    saveStoredAdmins(admins);
  }
  return { success: true };
}

export async function createAdminAccount({
  data,
}: {
  data: { email: string; fullName: string; role: AdminRole; designation?: string };
}): Promise<{ success: boolean; user_id: string }> {
  const admins = getStoredAdmins();
  const newAdmin: AdminUser = {
    user_id: `usr-${Date.now().toString(36)}`,
    email: data.email.trim().toLowerCase(),
    full_name: data.fullName.trim(),
    designation: data.designation?.trim() || null,
    role: data.role,
    is_active: true,
    created_at: new Date().toISOString(),
  };
  admins.push(newAdmin);
  saveStoredAdmins(admins);
  return { success: true, user_id: newAdmin.user_id };
}

export async function setAdminActive({
  data,
}: {
  data: { targetUserId: string; isActive: boolean };
}): Promise<{ success: boolean }> {
  const admins = getStoredAdmins();
  const idx = admins.findIndex((a) => a.user_id === data.targetUserId);
  if (idx !== -1) {
    admins[idx].is_active = data.isActive;
    saveStoredAdmins(admins);
  }
  return { success: true };
}

export async function setAdminDesignation({
  data,
}: {
  data: { targetUserId: string; designation: string };
}): Promise<{ success: boolean }> {
  const admins = getStoredAdmins();
  const idx = admins.findIndex((a) => a.user_id === data.targetUserId);
  if (idx !== -1) {
    admins[idx].designation = data.designation.trim() || null;
    saveStoredAdmins(admins);
  }
  return { success: true };
}

export async function deleteUserAccount({
  data,
}: {
  data: { targetUserId: string };
}): Promise<{ success: boolean }> {
  let admins = getStoredAdmins();
  admins = admins.filter((a) => a.user_id !== data.targetUserId);
  saveStoredAdmins(admins);
  return { success: true };
}

export async function updateAdminProfile({
  data,
}: {
  data: { fullName?: string; email?: string };
}): Promise<{ success: boolean }> {
  return { success: true };
}

export async function loginAdminFn({
  data,
}: {
  data: { email: string; password?: string };
}): Promise<{ success: boolean; session?: any; error?: string }> {
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanPassword = data.password?.trim();

  if (
    cleanEmail === "swatantrasingh308@gmail.com" &&
    cleanPassword === "ss123&&&"
  ) {
    const session = {
      user: {
        id: "usr-swatantra-001",
        email: "swatantrasingh308@gmail.com",
        user_metadata: { full_name: "Swatantra Singh", admin_role: "super_admin" },
      },
      token: "mock-super-admin-token",
      expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
    return { success: true, session };
  }

  // Allow general demo sign-in
  const session = {
    user: {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      user_metadata: { full_name: cleanEmail.split("@")[0], admin_role: "admin" },
    },
    token: `token-${Date.now()}`,
    expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  return { success: true, session };
}
