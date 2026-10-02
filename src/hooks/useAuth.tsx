/**
 * DIMISI Technologies — Unified Admin Authentication Hook
 * Manages reactive admin session state, cross-tab synchronization,
 * and live 15-minute session countdown matching Backend JWT architecture.
 */
import { useEffect, useState, useCallback } from "react";
import {
  getStoredAdminSession,
  getRemainingSessionSeconds,
  logoutAdmin,
  clearAdminSession,
  type AdminAuthUser,
  type AdminAuthSession,
  type AdminRole,
} from "@/services/adminAuth.service";

export type { AdminAuthUser, AdminAuthSession, AdminRole };
export type AuthUser = AdminAuthUser;
export type AuthSession = AdminAuthSession;

export interface UseAuthReturn {
  user: AdminAuthUser | null;
  session: AdminAuthSession | null;
  isAuthenticated: boolean;
  role: AdminRole | null;
  loading: boolean;
  remainingSeconds: number;
  isExpiringSoon: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<AdminAuthSession | null>(null);
  const [user, setUser] = useState<AdminAuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => getRemainingSessionSeconds());

  const checkLocalSession = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    try {
      const stored = getStoredAdminSession();
      if (stored && stored.user) {
        setUser(stored.user);
        setSession(stored);
        setRemainingSeconds(getRemainingSessionSeconds());
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
      setRemainingSeconds(0);
      setLoading(false);
    }

    // 2. Event listener for auth changes (same window & cross-tab)
    const onAuthChange = (e?: Event) => {
      const customEvt = e as CustomEvent<{ expired?: boolean; message?: string }>;
      if (customEvt?.detail?.expired) {
        setSession(null);
        setUser(null);
        setRemainingSeconds(0);
        setLoading(false);
        return;
      }
      const found = checkLocalSession();
      if (!found) {
        setSession(null);
        setUser(null);
        setRemainingSeconds(0);
        setLoading(false);
      }
    };

    window.addEventListener("dimisi-auth-change", onAuthChange as EventListener);
    window.addEventListener("storage", onAuthChange as EventListener);

    // 3. Live 1-second countdown ticker for 15-minute security session
    const countdownTimer = setInterval(() => {
      const remaining = getRemainingSessionSeconds();
      setRemainingSeconds(remaining);
      if (remaining <= 0 && getStoredAdminSession()) {
        clearAdminSession("Security session expired (15m limit). Please sign in again.");
      }
    }, 1000);

    return () => {
      window.removeEventListener("dimisi-auth-change", onAuthChange as EventListener);
      window.removeEventListener("storage", onAuthChange as EventListener);
      clearInterval(countdownTimer);
    };
  }, [checkLocalSession]);

  const signOut = useCallback(async () => {
    await logoutAdmin();
  }, []);

  const refreshSession = useCallback(async () => {
    // Manual local session re-check
    const found = checkLocalSession();
    return found;
  }, [checkLocalSession]);

  const isExpiringSoon = remainingSeconds > 0 && remainingSeconds <= 120; // Under 2 minutes remaining

  return {
    user,
    session,
    isAuthenticated: Boolean(user),
    role: user?.role || null,
    loading,
    remainingSeconds,
    isExpiringSoon,
    signOut,
    refreshSession,
  };
}