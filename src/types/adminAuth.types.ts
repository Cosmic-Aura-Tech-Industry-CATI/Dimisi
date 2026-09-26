/**
 * DIMISI Admin Panel — Unified Authentication & Role-Based Access Control Types
 * Synchronized with Backend: dimisi-ops-backend/modules/adminPanel/auth & user
 */

export type AdminRole = "super_admin" | "admin" | "editor" | "moderator" | "analyst";

/**
 * Raw panel user document structure returned by Backend Express API:
 * POST /api/v1/admin-panel/auth/login
 */
export interface IPanelUserBackend {
  _id: string;
  user:
    | string
    | {
        _id: string;
        name?: string;
        email?: string;
        empId?: string | number;
        employeeId?: string | number;
        designation?: string | { title?: string; name?: string; code?: string };
        isActive?: boolean;
        role?: string;
        avatar?: string;
        [key: string]: any;
      };
  role: AdminRole;
  isActive: boolean;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Standardized client-side Admin User representation
 */
export interface AdminAuthUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  designation: string;
  empId?: string | null;
  permissions: string[];
  avatarUrl?: string | null;
  // Legacy compatibility accessor
  user_metadata: {
    full_name: string;
    admin_role: AdminRole;
    designation: string;
    emp_id: string | null;
    employee_id: string | null;
    avatar_url: string | null;
    provider?: string;
    [key: string]: any;
  };
}

/**
 * Persistent Admin session record in browser localStorage
 */
export interface AdminAuthSession {
  user: AdminAuthUser;
  authenticated_at: number;
  expires_at: number;
  token?: string;
}

/**
 * Backend API login response
 */
export interface BackendLoginResponse {
  success: boolean;
  status?: string;
  message: string;
  user?: IPanelUserBackend;
  data?: {
    user?: IPanelUserBackend;
    [key: string]: any;
  };
}
