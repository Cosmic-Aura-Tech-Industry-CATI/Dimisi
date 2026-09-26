/**
 * DIMISI Technologies — Unified Admin Authentication Hook
 * Manages reactive admin session state, cross-tab synchronization,
 * 10-minute proactive heartbeats, and tab visibility recovery.
 */
import { useEffect, useState, useCallback } from "react";
import {
  getStoredAdminSession,
  refreshAdminTokenApi,
  logoutAdmin,
  type AdminAuthUser,
  type AdminAuthSession,
  type AdminRole,
} from "@/services/adminAuth.service";

export type { AdminAuthUser, AdminAuthSession, AdminRole };
// Legacy alias for backward compatibility across components
export type AuthUser = AdminAuthUser;
export type AuthSession = AdminAuthSession;

export interface UseAuthReturn {
  user: AdminAuthUser | null;
  session: AdminAuthSession | null;
  isAuthenticated: boolean;
  role: AdminRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<AdminAuthSession | null>(null);
  const [user, setUser] = useState<AdminAuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkLocalSession = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    try {
      const stored = getStoredAdminSession();
      if (stored && stored.user) {
        setUser(stored.user);
        setSession(stored);
        setLoading(false);
        return true;
      }
    } catch {}
    return false;
  }, []);

  useEffect(() => {
    // 1. Initial local session check
    const hasSession = checkLocalSession();
    if (!hasSession) {
      setSession(null);
      setUser(null);
      setLoading(false);
    }

    // 2. Event listener for auth changes (same window & cross-tab)
    const onAuthChange = (e?: Event) => {
      const customEvt = e as CustomEvent<{ expired?: boolean; message?: string }>;
      if (customEvt?.detail?.expired) {
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      const found = checkLocalSession();
      if (!found) {
        setSession(null);
        setUser(null);
        setLoading(false);
      }
    };

    window.addEventListener("dimisi-auth-change", onAuthChange as EventListener);
    window.addEventListener("storage", onAuthChange as EventListener);

    // 3. Proactive Heartbeat every 10 minutes (600,000 ms) to keep tokens fresh
    const heartbeatTimer = setInterval(async () => {
      if (typeof window !== "undefined" && document.visibilityState === "visible") {
        const hasActive = checkLocalSession();
        if (hasActive) {
          await refreshAdminTokenApi();
        }
      }
    }, 10 * 60 * 1000);

    // 4. Tab Focus / Resume Handler (refresh when user returns to tab)
    const handleVisibilityChange = async () => {
      if (typeof window !== "undefined" && document.visibilityState === "visible") {
        const hasActive = checkLocalSession();
        if (hasActive) {
          await refreshAdminTokenApi();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      window.removeEventListener("dimisi-auth-change", onAuthChange as EventListener);
      window.removeEventListener("storage", onAuthChange as EventListener);
      clearInterval(heartbeatTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [checkLocalSession]);

  const signOut = useCallback(async () => {
    await logoutAdmin();
  }, []);

  const refreshSession = useCallback(async () => {
    return await refreshAdminTokenApi();
  }, []);

  return {
    user,
    session,
    isAuthenticated: Boolean(user),
    role: user?.role || null,
    loading,
    signOut,
    refreshSession,
  };
}