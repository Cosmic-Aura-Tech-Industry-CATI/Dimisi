/**
 * DIMISI Admin Panel — Clean Authentication Service
 * Seamlessly interfaces with Express Backend:
 * - Login:  POST /api/v1/admin-panel/auth/login
 * - Logout: POST /api/v1/admin-panel/auth/logout
 * - Refresh: POST /api/v1/auth/refresh
 */
import { apiRequest, clearApiCache, API_BASE_URL } from "./apiClient";
import type {
  AdminRole,
  AdminAuthUser,
  AdminAuthSession,
  BackendLoginResponse,
  IPanelUserBackend,
} from "@/types/adminAuth.types";

export type { AdminRole, AdminAuthUser, AdminAuthSession, BackendLoginResponse, IPanelUserBackend };

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export const ADMIN_SESSION_KEY = "dimisi_admin_session";
export const ADMIN_EXPIRED_NOTICE_KEY = "dimisi_admin_session_expired";

/**
 * Normalizes backend IPanelUser into client-safe AdminAuthUser
 */
export function transformBackendPanelUser(backendUser: IPanelUserBackend, fallbackEmail?: string): AdminAuthUser {
  const baseUser = typeof backendUser.user === "object" ? backendUser.user : null;
  const userId = baseUser?._id || (typeof backendUser.user === "string" ? backendUser.user : backendUser._id);
  const userEmail = (baseUser?.email || fallbackEmail || "").trim().toLowerCase();
  const userName = baseUser?.name || userEmail.split("@")[0].replace(/[._-]/g, " ") || "Administrator";
  const userRole: AdminRole = backendUser.role || "admin";

  const rawDesignation =
    typeof baseUser?.designation === "string"
      ? baseUser.designation
      : baseUser?.designation?.title || baseUser?.designation?.name || null;

  const cleanDesignation =
    rawDesignation && !/^[0-9a-fA-F]{24}$/.test(String(rawDesignation).trim())
      ? String(rawDesignation).trim()
      : userRole === "super_admin"
        ? "Super Admin"
        : userRole.charAt(0).toUpperCase() + userRole.slice(1);

  const empId = baseUser?.empId || baseUser?.employeeId ? String(baseUser.empId || baseUser.employeeId) : null;
  const avatarUrl = baseUser?.avatar || null;
  const permissions = Array.isArray(backendUser.permissions) ? backendUser.permissions : [];

  return {
    id: String(userId),
    email: userEmail,
    name: userName,
    role: userRole,
    isActive: backendUser.isActive !== false,
    designation: cleanDesignation,
    empId,
    permissions,
    avatarUrl,
    user_metadata: {
      full_name: userName,
      admin_role: userRole,
      designation: cleanDesignation,
      emp_id: empId,
      employee_id: empId,
      avatar_url: avatarUrl,
    },
  };
}

/**
 * Perform login against the Express backend API: POST /api/v1/admin-panel/auth/login
 * Tokens (accessToken & refreshToken) are transmitted and stored in HttpOnly secure cookies.
 */
export async function loginAdmin(
  credentials: AdminLoginCredentials,
): Promise<{ success: boolean; user: AdminAuthUser; session: AdminAuthSession }> {
  const cleanEmail = credentials.email.trim().toLowerCase();
  const cleanPassword = credentials.password.trim();

  if (!cleanEmail || !cleanPassword) {
    throw new Error("Email and password are required.");
  }

  // 1. Send Login Request to Express Backend
  const response = await apiRequest<BackendLoginResponse>("/api/v1/admin-panel/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: cleanEmail,
      password: cleanPassword,
    }),
  });

  const rawUser = response?.user || response?.data?.user;
  if (!response || (!response.success && !rawUser)) {
    throw new Error(response?.message || "Invalid email or password.");
  }

  if (!rawUser) {
    throw new Error("Invalid response format: Missing user payload.");
  }

  // 2. Transform User Model
  const user = transformBackendPanelUser(rawUser, cleanEmail);

  // 3. Create Session (Rolling 30-day session)
  const now = Date.now();
  const session: AdminAuthSession = {
    user,
    authenticated_at: now,
    expires_at: now + 30 * 24 * 60 * 60 * 1000,
    token: "cookie-session",
  };

  // 4. Save to localStorage and notify UI subscribers
  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    sessionStorage.removeItem(ADMIN_EXPIRED_NOTICE_KEY);
    window.dispatchEvent(new CustomEvent("dimisi-auth-change", { detail: { user } }));
  }

  return {
    success: true,
    user,
    session,
  };
}

/**
 * Invalidate admin session on backend and clear local credentials.
 * Endpoint: POST /api/v1/admin-panel/auth/logout
 */
export async function logoutAdmin(): Promise<void> {
  try {
    await apiRequest("/api/v1/admin-panel/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    if (import.meta.env?.DEV) {
      console.warn("Backend admin logout request note:", error);
    }
  } finally {
    clearAdminSession();
  }
}

/**
 * Explicitly clears the local admin session and emits auth state change.
 */
export function clearAdminSession(reason?: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    clearApiCache();
    if (reason) {
      sessionStorage.setItem(ADMIN_EXPIRED_NOTICE_KEY, reason);
    } else {
      sessionStorage.removeItem(ADMIN_EXPIRED_NOTICE_KEY);
    }
    window.dispatchEvent(
      new CustomEvent("dimisi-auth-change", {
        detail: {
          expired: Boolean(reason),
          message: reason || "Logged out",
        },
      }),
    );
  } catch {}
}

/**
 * Retrieve current active admin session.
 */
export function getStoredAdminSession(): AdminAuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AdminAuthSession;
    if (!session.user || !session.user.id) return null;
    return session;
  } catch {
    return null;
  }
}

// Mutex lock state to prevent race conditions across concurrent refresh calls
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Calls backend POST /api/v1/auth/refresh with HttpOnly cookies.
 * Uses a Mutex Lock to deduplicate concurrent refresh requests across the application.
 */
export async function refreshAdminTokenApi(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const targetUrl = API_BASE_URL ? `${API_BASE_URL}/api/v1/auth/refresh` : `/api/v1/auth/refresh`;
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include", // Sends the 30-day refreshToken HttpOnly cookie
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data?.status === "success" || data?.success) {
        const session = getStoredAdminSession();
        if (session) {
          session.expires_at = Date.now() + 30 * 24 * 60 * 60 * 1000;
          localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
        }
        if (import.meta.env?.DEV) {
          console.debug("[AUTH REFRESH] Session tokens successfully refreshed on backend.");
        }
        return true;
      }
      return false;
    } catch (err) {
      if (import.meta.env?.DEV) {
        console.warn("[AUTH REFRESH FAILED]", err);
      }
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
