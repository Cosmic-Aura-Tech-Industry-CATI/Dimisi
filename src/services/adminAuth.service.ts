/**
 * DIMISI Admin Panel — Express Authentication Service
 * Connects the Admin Panel frontend directly to the Express backend API.
 *
 * Backend route: POST /api/v1/admin-panel/auth/login
 */
import { apiRequest, clearApiCache, ApiError } from "./apiClient";
import type { AuthUser } from "@/hooks/useAuth";

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface BackendLoginResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    accessToken?: string;
    refreshToken?: string;
    user?: any;
  };
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: any;
}

export interface AdminAuthSession {
  token: string;
  user: AuthUser;
  expires_at: number;
}

const ADMIN_SESSION_KEY = "dimisi_admin_session";

/**
 * Safely decodes a JWT payload on the client without external dependencies.
 */
export function decodeJwtPayload(token: string): { id?: string; exp?: number; [key: string]: any } | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Perform login against the Express backend API: POST /api/v1/admin-panel/auth/login
 */
export async function loginAdmin(
  credentials: AdminLoginCredentials,
): Promise<{ success: boolean; token: string; user: AuthUser; expires_at: number }> {
  const cleanEmail = credentials.email.trim().toLowerCase();
  const cleanPassword = credentials.password.trim();

  if (!cleanEmail || !cleanPassword) {
    throw new Error("Email and password are required.");
  }

  // Call Express backend endpoint
  const response = await apiRequest<BackendLoginResponse>("/api/v1/admin-panel/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: cleanEmail,
      password: cleanPassword,
    }),
  });

  if (!response || (!response.success && response.user === undefined && response.data?.user === undefined)) {
    throw new Error(response?.message || "Unexpected authentication response.");
  }

  // Extract token if present in JSON payload; otherwise backend set HttpOnly cookies
  const rawToken =
    response?.data?.token ||
    response?.data?.accessToken ||
    response?.token ||
    response?.accessToken ||
    "cookie-session";

  // Extract user details from backend response or decode JWT payload if available
  const payload = rawToken !== "cookie-session" ? decodeJwtPayload(rawToken) : null;
  const backendPanelUser = response?.user || response?.data?.user;
  const backendBaseUser = backendPanelUser?.user;

  const userId =
    (typeof backendBaseUser === "object" ? backendBaseUser?._id : backendBaseUser) ||
    backendPanelUser?._id ||
    payload?.id ||
    `admin-${Date.now()}`;

  const userName =
    (typeof backendBaseUser === "object" ? backendBaseUser?.name : null) ||
    backendPanelUser?.name ||
    cleanEmail.split("@")[0].replace(/[._-]/g, " ");

  const adminRole = backendPanelUser?.role || "super_admin";

  const empId =
    (typeof backendBaseUser === "object" ? backendBaseUser?.empId || backendBaseUser?.employeeId : null) ||
    backendPanelUser?.empId ||
    backendPanelUser?.employeeId ||
    null;

  const rawDesignation =
    typeof backendBaseUser === "object"
      ? typeof backendBaseUser?.designation === "string"
        ? backendBaseUser.designation
        : backendBaseUser?.designation?.title || backendBaseUser?.designation?.name
      : null;

  const cleanDesignation =
    rawDesignation && !/^[0-9a-fA-F]{24}$/.test(String(rawDesignation).trim())
      ? String(rawDesignation).trim()
      : adminRole === "super_admin"
        ? "Super Admin"
        : "Administrator";

  const expiresAt = payload?.exp ? payload.exp * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000;

  const user: AuthUser = {
    id: String(userId),
    email: cleanEmail,
    user_metadata: {
      full_name: userName,
      admin_role: adminRole,
      employee_id: empId ? String(empId) : null,
      emp_id: empId ? String(empId) : null,
      designation: cleanDesignation,
    },
  };

  // Save session to localStorage for persistent state across refreshes
  const sessionData: AdminAuthSession = {
    token: rawToken,
    user,
    expires_at: expiresAt,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
    sessionStorage.removeItem("dimisi_admin_session_expired");
    window.dispatchEvent(new CustomEvent("dimisi-auth-change", { detail: { user } }));
  }

  return {
    success: true,
    token: rawToken,
    user,
    expires_at: expiresAt,
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
    console.warn(
      "Backend admin logout request failed, proceeding with local cleanup:",
      error,
    );
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
      sessionStorage.setItem("dimisi_admin_session_expired", reason);
    } else {
      sessionStorage.removeItem("dimisi_admin_session_expired");
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
 * Retrieve current active admin session if not expired.
 */
export function getStoredAdminSession(): AdminAuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AdminAuthSession;
    if (!session.token || !session.user) return null;
    if (session.expires_at && session.expires_at <= Date.now()) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

