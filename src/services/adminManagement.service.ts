/**
 * DIMISI Admin Management — Express API Service
 * Handles Administrator access grant, listing, role updates, and lifecycle operations
 * against the Express backend API (/api/v1/admin-panel/admins).
 */
import { apiRequest, ApiError } from "./apiClient";
import { getStoredAdminSession } from "./adminAuth.service";
import type { AdminRole } from "../../dimisi-admin/lib/rbac.shared";

export interface BackendAdminUser {
  id: string;
  user_id: string;
  email: string;
  name: string;
  full_name: string;
  designation: string;
  role: AdminRole;
  status: string;
  is_active: boolean;
  since: string;
  created_at: string;
}

export interface GrantAdminPayload {
  email: string;
  role: AdminRole | string;
}

export interface BackendGrantResponse {
  status: string;
  message: string;
  data: {
    admin: BackendAdminUser;
  };
}

export interface BackendAdminsListResponse {
  status: string;
  results: number;
  data: {
    admins: BackendAdminUser[];
  };
}

/**
 * Grants administrator access to an existing account via Express Backend:
 * POST /api/v1/admin-panel/admins/grant
 */
export async function grantAdminAccessApi(
  payload: GrantAdminPayload,
): Promise<{ success: boolean; message: string; admin: BackendAdminUser }> {
  const cleanEmail = payload.email.trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error("Account Email is required.");
  }
  if (!payload.role) {
    throw new Error("Assigned Role is required.");
  }

  const session = getStoredAdminSession();
  const token = session?.token;

  const res = await apiRequest<BackendGrantResponse>("/api/v1/admin-panel/admins/grant", {
    method: "POST",
    token,
    body: JSON.stringify({
      email: cleanEmail,
      role: payload.role,
    }),
  });

  if (!res?.data?.admin) {
    throw new Error(res?.message || "Failed to grant administrator access.");
  }

  return {
    success: true,
    message: res.message || "Administrator access granted successfully.",
    admin: res.data.admin,
  };
}

/**
 * Retrieves the full administrator list from the Express backend:
 * GET /api/v1/admin-panel/admins
 */
export async function fetchAdminsApi(): Promise<BackendAdminUser[]> {
  const session = getStoredAdminSession();
  const token = session?.token;

  const res = await apiRequest<BackendAdminsListResponse>("/api/v1/admin-panel/admins", {
    method: "GET",
    token,
  });

  return Array.isArray(res?.data?.admins) ? res.data.admins : [];
}

/**
 * Updates an administrator role:
 * PATCH /api/v1/admin-panel/admins/:id/role
 */
export async function updateAdminRoleApi(
  userId: string,
  role: AdminRole | string,
): Promise<{ success: boolean; admin: BackendAdminUser }> {
  const session = getStoredAdminSession();
  const token = session?.token;

  const res = await apiRequest<{ status: string; message: string; data: { admin: BackendAdminUser } }>(
    `${"/api/v1/admin-panel/admins/"}${userId}/role`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify({ role }),
    },
  );

  return {
    success: true,
    admin: res.data.admin,
  };
}

/**
 * Toggles an administrator active status:
 * PATCH /api/v1/admin-panel/admins/:id/active
 */
export async function updateAdminActiveApi(
  userId: string,
  isActive: boolean,
): Promise<{ success: boolean; admin: BackendAdminUser }> {
  const session = getStoredAdminSession();
  const token = session?.token;

  const res = await apiRequest<{ status: string; message: string; data: { admin: BackendAdminUser } }>(
    `${"/api/v1/admin-panel/admins/"}${userId}/active`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify({ active: isActive }),
    },
  );

  return {
    success: true,
    admin: res.data.admin,
  };
}

/**
 * Deletes an administrator:
 * DELETE /api/v1/admin-panel/admins/:id
 */
export async function deleteAdminApi(userId: string): Promise<{ success: boolean }> {
  const session = getStoredAdminSession();
  const token = session?.token;

  await apiRequest<{ status: string; message: string }>(
    `${"/api/v1/admin-panel/admins/"}${userId}`,
    {
      method: "DELETE",
      token,
    },
  );

  return { success: true };
}
