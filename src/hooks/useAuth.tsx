/**
 * DIMISI Technologies — Unified Admin Authentication Hook
 * Manages reactive admin session state, cross-tab synchronization,
 * live countdown, and proactive silent background refresh matching Backend JWT architecture.
 */
import { useEffect, useState, useCallback, useRef } from "react";
import {
  getStoredAdminSession,
  getRemainingSessionSeconds,
  logoutAdmin,
  clearAdminSession,
  refreshAdminSession,
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

  // Guard to prevent overlapping background refresh attempts
  const isRefreshingRef = useRef<boolean>(false);

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
    // Cleaner function controller for background refresh requests on unmount
    const abortController = new AbortController();

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

    // 3. Live 1-second countdown ticker with proactive silent refresh
    const countdownTimer = setInterval(() => {
      const remaining = getRemainingSessionSeconds();
      setRemainingSeconds(remaining);

      const currentStored = getStoredAdminSession();
      if (!currentStored) return;

      // Proactive silent refresh: When 2 minutes or less remain on the 15-minute access token,
      // silently request a fresh token from backend before it expires
      if (remaining <= 120 && !isRefreshingRef.current) {
        isRefreshingRef.current = true;
        refreshAdminSession(abortController.signal)
          .then((refreshed) => {
            isRefreshingRef.current = false;
            if (refreshed) {
              checkLocalSession();
            } else if (getRemainingSessionSeconds() <= 0) {
              // Refresh token is expired/invalid (e.g. 30 days passed or revoked), log out
              clearAdminSession("Security session expired. Please sign in again.");
            }
          })
          .catch((err) => {
            isRefreshingRef.current = false;
            // Ignore abort error caused by cleaner function on unmount
            if (err?.name === "AbortError" || abortController.signal.aborted) return;
            if (getRemainingSessionSeconds() <= 0) {
              clearAdminSession("Security session expired. Please sign in again.");
            }
          });
      }
    }, 1000);

    // Cleaner function: Clean up event listeners, countdown interval, and abort in-flight refresh requests
    return () => {
      window.removeEventListener("dimisi-auth-change", onAuthChange as EventListener);
      window.removeEventListener("storage", onAuthChange as EventListener);
      clearInterval(countdownTimer);
      abortController.abort();
    };
  }, [checkLocalSession]);

  const signOut = useCallback(async () => {
    await logoutAdmin();
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const success = await refreshAdminSession();
      if (success) {
        checkLocalSession();
        return true;
      }
    } catch {}
    return false;
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