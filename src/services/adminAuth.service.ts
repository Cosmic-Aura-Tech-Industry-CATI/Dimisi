/**
 * DIMISI Admin Panel — Express Authentication Service
 * Connects the Admin Panel frontend directly to the Express backend API.
 *
 * Backend route: POST /api/v1/admin-panel/auth/login
 */
import { apiRequest, ApiError } from "./apiClient";
import type { AuthUser } from "@/hooks/useAuth";

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface BackendLoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
  };
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

  const token = response?.data?.token;
  if (!token) {
    throw new Error("Authentication response did not contain a valid access token.");
  }

  // Decode JWT payload to extract user ID & expiration
  const payload = decodeJwtPayload(token);
  const userId = payload?.id || `admin-${Date.now()}`;
  const expiresAt = payload?.exp ? payload.exp * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000;

  const user: AuthUser = {
    id: userId,
    email: cleanEmail,
    user_metadata: {
      full_name: cleanEmail.split("@")[0].replace(/[._-]/g, " "),
      admin_role: "super_admin",
    },
  };

  // Save session to localStorage for persistent state across refreshes
  const sessionData: AdminAuthSession = {
    token,
    user,
    expires_at: expiresAt,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
    window.dispatchEvent(new Event("dimisi-auth-change"));
  }

  return {
    success: true,
    token,
    user,
    expires_at: expiresAt,
  };
}

/**
 * Invalidate admin session and clear credentials.
 */
export function logoutAdmin(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    window.dispatchEvent(new Event("dimisi-auth-change"));
  }
}

/**
 * Retrieve current active admin session if not expired.
 */
export function getStoredAdminSession(): AdminAuthSession | null {
  if (typeof window !== "undefined") return null;
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
