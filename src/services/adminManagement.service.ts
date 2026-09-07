/**
 * DIMISI Admin Management — Express API Service
 * Handles Administrator access grant, listing, role updates, and lifecycle operations
 * against the Express backend API (/api/v1/admin-panel/users/*).
 */
import { apiRequest, ApiError } from "./apiClient";
import type { AdminRole } from "../../dimisi-admin/lib/rbac.shared";

export interface BackendPopulatedUser {
  _id: string;
  empId?: string;
  email?: string;
  name?: string;
  fullName?: string;
  department?: string | { _id: string; name?: string; title?: string };
  designation?: string | { _id: string; name?: string; title?: string };
  role?: string;
  isActive?: boolean;
  joinDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendPanelUserDoc {
  _id: string;
  user: BackendPopulatedUser | string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackendAdminsListResponse {
  success: boolean;
  message: string;
  admins: BackendPanelUserDoc[];
}

export interface BackendAdminSingleResponse {
  success: boolean;
  message: string;
  admin: BackendPanelUserDoc;
}

export interface GrantAdminPayload {
  mailId: string;
  role: AdminRole;
}

export interface NormalizedAdminUser {
  user_id: string;
  email: string | null;
  full_name: string | null;
  designation: string | null;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
}

/**
 * Safely normalizes backend IPanelUser documents into the clean frontend AdminUser model.
 */
export function normalizeBackendPanelUser(doc: BackendPanelUserDoc | null | undefined): NormalizedAdminUser {
  if (!doc) {
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

  const populatedUser = typeof doc.user === "object" && doc.user !== null ? doc.user : null;
  const rawUserId = populatedUser?._id || (typeof doc.user === "string" ? doc.user : "") || doc._id;

  const email = populatedUser?.email || null;
  const fullName =
    populatedUser?.name ||
    populatedUser?.fullName ||
    (email ? email.split("@")[0].replace(/[._-]/g, " ") : "Administrator");

  let designationStr = "Not set";
  if (populatedUser?.designation) {
    if (typeof populatedUser.designation === "string") {
      designationStr = populatedUser.designation.trim() || "Not set";
    } else if (typeof populatedUser.designation === "object") {
      designationStr =
        populatedUser.designation.title || populatedUser.designation.name || "Not set";
    }
  }

  return {
    user_id: String(rawUserId),
    email: email,
    full_name: fullName,
    designation: designationStr,
    role: (doc.role as AdminRole) || "admin",
    is_active: doc.isActive !== undefined ? Boolean(doc.isActive) : true,
    created_at: doc.createdAt || populatedUser?.createdAt || new Date().toISOString(),
  };
}

/**
 * 1. GET ALL PANEL ADMINS
 * Endpoint: GET /api/v1/admin-panel/users/admins
 */
export async function getAllPanelAdmins(): Promise<BackendPanelUserDoc[]> {
  const res = await apiRequest<BackendAdminsListResponse>("/api/v1/admin-panel/users/admins", {
    method: "GET",
  });

  if (Array.isArray(res?.admins)) {
    return res.admins;
  }
  return [];
}

/**
 * 2. GET PANEL ADMIN BY USER ID
 * Endpoint: GET /api/v1/admin-panel/users/:userId
 */
export async function getPanelAdminById(userId: string): Promise<BackendPanelUserDoc | null> {
  if (!userId) throw new Error("User ID is required.");

  const res = await apiRequest<BackendAdminSingleResponse>(
    `/api/v1/admin-panel/users/${encodeURIComponent(userId)}`,
    {
      method: "GET",
    },
  );

  return res?.admin || null;
}

/**
 * 3. CREATE / GRANT PANEL ADMIN ACCESS
 * Endpoint: POST /api/v1/admin-panel/users/create
 * Body: { mailId: string, role: AdminRole }
 */
export async function createPanelAdmin(payload: GrantAdminPayload): Promise<{
  success: boolean;
  message: string;
  admin: BackendPanelUserDoc;
}> {
  const cleanEmail = payload.mailId?.trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error("Account Email is required.");
  }
  if (!payload.role) {
    throw new Error("Assigned Role is required.");
  }

  const res = await apiRequest<BackendAdminSingleResponse>("/api/v1/admin-panel/users/create", {
    method: "POST",
    body: JSON.stringify({
      mailId: cleanEmail,
      role: payload.role,
    }),
  });

  if (!res?.admin) {
    throw new Error(res?.message || "Failed to grant administrator access.");
  }

  return {
    success: true,
    message: res.message || "Administrator access granted successfully.",
    admin: res.admin,
  };
}

/**
 * 4. UPDATE PANEL ADMIN ROLE
 * Endpoint: PUT /api/v1/admin-panel/users/:userId
 * Body: { role: AdminRole }
 */
export async function updatePanelAdminRole(
  userId: string,
  role: AdminRole,
): Promise<{ success: boolean; message: string; admin: BackendPanelUserDoc }> {
  if (!userId) throw new Error("User ID is required.");
  if (!role) throw new Error("Role is required.");

  const res = await apiRequest<BackendAdminSingleResponse>(
    `/api/v1/admin-panel/users/${encodeURIComponent(userId)}`,
    {
      method: "PUT",
      body: JSON.stringify({ role }),
    },
  );

  return {
    success: true,
    message: res?.message || "Administrator role updated successfully.",
    admin: res.admin,
  };
}

/**
 * 5. ACTIVATE PANEL ADMIN
 * Endpoint: PUT /api/v1/admin-panel/users/:userId/activate
 */
export async function activatePanelAdmin(userId: string): Promise<{
  success: boolean;
  message: string;
  admin: BackendPanelUserDoc;
}> {
  if (!userId) throw new Error("User ID is required.");

  const res = await apiRequest<BackendAdminSingleResponse>(
    `/api/v1/admin-panel/users/${encodeURIComponent(userId)}/activate`,
    {
      method: "PUT",
    },
  );

  return {
    success: true,
    message: res?.message || "Administrator activated successfully.",
    admin: res.admin,
  };
}

/**
 * 6. DEACTIVATE PANEL ADMIN
 * Endpoint: PUT /api/v1/admin-panel/users/:userId/deactivate
 */
export async function deactivatePanelAdmin(userId: string): Promise<{
  success: boolean;
  message: string;
  admin: BackendPanelUserDoc;
}> {
  if (!userId) throw new Error("User ID is required.");

  const res = await apiRequest<BackendAdminSingleResponse>(
    `/api/v1/admin-panel/users/${encodeURIComponent(userId)}/deactivate`,
    {
      method: "PUT",
    },
  );

  return {
    success: true,
    message: res?.message || "Administrator deactivated successfully.",
    admin: res.admin,
  };
}

// Aliases for compatibility
export const fetchAdminsApi = getAllPanelAdmins;
export const grantAdminAccessApi = async (payload: { email: string; role: AdminRole | string }) => {
  return createPanelAdmin({
    mailId: payload.email,
    role: payload.role as AdminRole,
  });
};
export const updateAdminRoleApi = async (userId: string, role: AdminRole | string) => {
  return updatePanelAdminRole(userId, role as AdminRole);
};
export const updateAdminActiveApi = async (userId: string, isActive: boolean) => {
  if (isActive) {
    return activatePanelAdmin(userId);
  }
  return deactivatePanelAdmin(userId);
};
export const deleteAdminApi = async (userId: string): Promise<{ success: boolean }> => {
  // Backend does not expose a DELETE endpoint; deactivate the user instead.
  await deactivatePanelAdmin(userId);
  return { success: true };
};
