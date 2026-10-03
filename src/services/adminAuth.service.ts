/**
 * DIMISI Admin Panel — Clean Authentication Service
 * Seamlessly interfaces with Express Backend:
 * - Login:  POST /api/v1/admin-panel/auth/login
 * - Logout: POST /api/v1/admin-panel/auth/logout
 * - Refresh: POST /api/v1/admin-panel/auth/refresh-token
 */
import { apiRequest, clearApiCache } from "./apiClient";
import {
  type AdminRole,
  type AdminAuthUser,
  type AdminAuthSession,
  type BackendLoginResponse,
  type IPanelUserBackend,
  ADMIN_SESSION_LIFETIME_MS,
} from "@/types/adminAuth.types";

export { ADMIN_SESSION_LIFETIME_MS };
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
 * Aligns session expiration with backend JWT 15-minute lifespan.
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

  // 3. Create Session with exact 15-minute expiration matching backend JWT policy
  const now = Date.now();
  const session: AdminAuthSession = {
    user,
    authenticated_at: now,
    expires_at: now + ADMIN_SESSION_LIFETIME_MS,
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
 * Refreshes the admin session silently using backend POST /api/v1/admin-panel/auth/refresh-token.
 * HttpOnly cookie 'refreshToken' is automatically sent by the browser.
 * On success, backend extends the 30-day session and sets a fresh 15-minute 'accessToken' cookie.
 * Frontend updates local session 'expires_at' to fresh 15 minutes.
 */
export async function refreshAdminSession(signal?: AbortSignal): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await apiRequest<{ status?: string; message?: string }>(
      "/api/v1/admin-panel/auth/refresh-token",
      {
        method: "POST",
        cacheTtlMs: 0,
        _isRetry: true, // Prevents infinite recursion in apiClient 401 interceptor
        ...(signal ? { signal } : {}),
      },
    );

    if (res?.status === "success") {
      const raw = localStorage.getItem(ADMIN_SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw) as AdminAuthSession;
        if (session && session.user) {
          session.expires_at = Date.now() + ADMIN_SESSION_LIFETIME_MS;
          localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
          window.dispatchEvent(
            new CustomEvent("dimisi-auth-change", {
              detail: { refreshed: true, user: session.user },
            }),
          );
          return true;
        }
      }
    }
    return false;
  } catch (err: any) {
    if (err?.name === "AbortError" || signal?.aborted) {
      return false;
    }
    // Refresh token expired or user is banned/inactive on backend (401 or 403)
    if (err?.status === 401 || err?.status === 403) {
      clearAdminSession("Your session has expired. Please sign in again.");
    }
    return false;
  }
}

/**
 * Retrieve current active admin session from localStorage.
 * Does not prematurely kill session on client side if 15 minutes pass;
 * silent refresh handles extending the session seamlessly.
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

/**
 * Get remaining session duration in seconds.
 */
export function getRemainingSessionSeconds(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return 0;
    const session = JSON.parse(raw) as AdminAuthSession;
    if (!session.expires_at) return 0;
    const remaining = Math.floor((session.expires_at - Date.now()) / 1000);
    return Math.max(0, remaining);
  } catch {
    return 0;
  }
}
