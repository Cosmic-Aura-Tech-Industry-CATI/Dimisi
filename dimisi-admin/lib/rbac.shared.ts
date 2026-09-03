/**
 * Centralized Role-Based Access Control (RBAC) definitions for DIMISI Admin Control Room.
 * Defines roles, permissions, role-to-permission mappings, and client-safe helper utilities.
 */

export type AdminRole = "super_admin" | "admin" | "editor" | "moderator" | "analyst";

export const ADMIN_ROLES: {
  id: AdminRole;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    id: "super_admin",
    label: "Super Admin",
    shortLabel: "SUPER ADMIN",
    description: "Full, unrestricted access to all system settings, admin accounts, roles, and CMS modules.",
    color: "#ffb300",
    bg: "rgba(255, 179, 0, 0.14)",
    border: "rgba(255, 179, 0, 0.35)",
  },
  {
    id: "admin",
    label: "Admin",
    shortLabel: "ADMIN",
    description: "Broad management access to all content, reviews, campaigns, analytics, and leads. Cannot manage Super Admins or system roles.",
    color: "#60a5fa",
    bg: "rgba(96, 165, 250, 0.14)",
    border: "rgba(96, 165, 250, 0.35)",
  },
  {
    id: "editor",
    label: "Editor",
    shortLabel: "EDITOR",
    description: "Content-focused access. Can create, edit, and publish Services, Case Studies, Careers, Blogs, and Events.",
    color: "#34d399",
    bg: "rgba(52, 211, 153, 0.14)",
    border: "rgba(52, 211, 153, 0.35)",
  },
  {
    id: "moderator",
    label: "Moderator",
    shortLabel: "MODERATOR",
    description: "Community and moderation access. Can approve/reject customer reviews, resolve moderation queue items, and view notifications.",
    color: "#c084fc",
    bg: "rgba(192, 132, 252, 0.14)",
    border: "rgba(192, 132, 252, 0.35)",
  },
  {
    id: "analyst",
    label: "Analyst",
    shortLabel: "ANALYST",
    description: "Read-only analytics and reporting access for metrics, leads, and review campaign statistics.",
    color: "#38bdf8",
    bg: "rgba(56, 189, 248, 0.14)",
    border: "rgba(56, 189, 248, 0.35)",
  },
];

export type Permission =
  // Admins & Roles
  | "admins.view"
  | "admins.create"
  | "admins.edit"
  | "admins.delete"
  | "admins.change_role"
  // Services & Sectors
  | "services.view"
  | "services.create"
  | "services.edit"
  | "services.delete"
  // Our Work & Case Studies
  | "work.view"
  | "work.create"
  | "work.edit"
  | "work.delete"
  // Products
  | "products.view"
  | "products.create"
  | "products.edit"
  | "products.delete"
  // Careers & Jobs
  | "careers.view"
  | "careers.create"
  | "careers.edit"
  | "careers.delete"
  // Blog & Journal
  | "blog.view"
  | "blog.create"
  | "blog.edit"
  | "blog.delete"
  // Events & Visual Gallery
  | "events.view"
  | "events.create"
  | "events.edit"
  | "events.delete"
  // Reviews & Moderation
  | "reviews.view"
  | "reviews.moderate"
  | "moderation.view"
  | "moderation.manage"
  // Campaigns & QR
  | "campaigns.view"
  | "campaigns.manage"
  // Analytics, Notifications, Leads, Settings
  | "analytics.view"
  | "notifications.manage"
  | "leads.view"
  | "settings.manage";

/** Mapping of Roles to their authorized Permission sets */
export const ROLE_PERMISSIONS: Record<AdminRole, Set<Permission>> = {
  super_admin: new Set<Permission>([
    "admins.view",
    "admins.create",
    "admins.edit",
    "admins.delete",
    "admins.change_role",
    "services.view",
    "services.create",
    "services.edit",
    "services.delete",
    "work.view",
    "work.create",
    "work.edit",
    "work.delete",
    "products.view",
    "products.create",
    "products.edit",
    "products.delete",
    "careers.view",
    "careers.create",
    "careers.edit",
    "careers.delete",
    "blog.view",
    "blog.create",
    "blog.edit",
    "blog.delete",
    "events.view",
    "events.create",
    "events.edit",
    "events.delete",
    "reviews.view",
    "reviews.moderate",
    "moderation.view",
    "moderation.manage",
    "campaigns.view",
    "campaigns.manage",
    "analytics.view",
    "notifications.manage",
    "leads.view",
    "settings.manage",
  ]),

  admin: new Set<Permission>([
    "admins.view",
    "services.view",
    "services.create",
    "services.edit",
    "services.delete",
    "work.view",
    "work.create",
    "work.edit",
    "work.delete",
    "products.view",
    "products.create",
    "products.edit",
    "products.delete",
    "careers.view",
    "careers.create",
    "careers.edit",
    "careers.delete",
    "blog.view",
    "blog.create",
    "blog.edit",
    "blog.delete",
    "events.view",
    "events.create",
    "events.edit",
    "events.delete",
    "reviews.view",
    "reviews.moderate",
    "moderation.view",
    "moderation.manage",
    "campaigns.view",
    "campaigns.manage",
    "analytics.view",
    "notifications.manage",
    "leads.view",
  ]),

  editor: new Set<Permission>([
    "services.view",
    "services.create",
    "services.edit",
    "work.view",
    "work.create",
    "work.edit",
    "products.view",
    "products.create",
    "products.edit",
    "careers.view",
    "careers.create",
    "careers.edit",
    "blog.view",
    "blog.create",
    "blog.edit",
    "events.view",
    "events.create",
    "events.edit",
  ]),

  moderator: new Set<Permission>([
    "reviews.view",
    "reviews.moderate",
    "moderation.view",
    "moderation.manage",
    "notifications.manage",
  ]),

  analyst: new Set<Permission>([
    "services.view",
    "work.view",
    "products.view",
    "blog.view",
    "events.view",
    "reviews.view",
    "campaigns.view",
    "analytics.view",
    "leads.view",
  ]),
};

/** Mapping of Admin Control Room Tab IDs to required primary view permission */
export const TAB_PERMISSION_MAP: Record<string, Permission> = {
  overview: "analytics.view", // Overview summary
  services: "services.view",
  work: "work.view",
  careers: "careers.view",
  blog: "blog.view",
  events: "events.view",
  reviews: "reviews.view",
  campaigns: "campaigns.view",
  reports: "moderation.view",
  analytics: "analytics.view",
  settings: "notifications.manage",
  leads: "leads.view",
  admins: "admins.view",
};

/** Check if a given role has a specific permission */
export function hasPermission(role: AdminRole | string | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  const normalizedRole = (role as AdminRole);
  const permissions = ROLE_PERMISSIONS[normalizedRole];
  if (!permissions) return false;
  return permissions.has(permission);
}

/** Check if a role can access a specific Admin sidebar tab */
export function canAccessTab(role: AdminRole | string | null | undefined, tab: string): boolean {
  if (!role) return false;
  const normalizedRole = role as AdminRole;
  if (normalizedRole === "super_admin") return true;

  // Overview is accessible to all recognized roles
  if (tab === "overview") return true;

  const requiredPermission = TAB_PERMISSION_MAP[tab];
  if (!requiredPermission) return false;
  return hasPermission(normalizedRole, requiredPermission);
}

/** Check if a role is Super Admin */
export function isSuperAdmin(role: AdminRole | string | null | undefined): boolean {
  return role === "super_admin";
}

/** Get UI metadata for an AdminRole */
export function getRoleMeta(role: AdminRole | string | null | undefined) {
  const found = ADMIN_ROLES.find((r) => r.id === role);
  return (
    found ?? {
      id: "admin" as AdminRole,
      label: "Admin",
      shortLabel: "ADMIN",
      description: "Standard administrator",
      color: "#60a5fa",
      bg: "rgba(96, 165, 250, 0.14)",
      border: "rgba(96, 165, 250, 0.35)",
    }
  );
}
