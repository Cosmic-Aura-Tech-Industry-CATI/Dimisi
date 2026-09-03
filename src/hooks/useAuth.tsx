import { useEffect, useState } from "react";

export type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string | null;
    admin_role?: string;
    [key: string]: any;
  };
};

export type AuthSession = {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  refresh_token?: string;
  user: AuthUser;
};

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function checkLocalSession(): boolean {
      if (typeof window === "undefined") return false;
      try {
        const raw = localStorage.getItem("dimisi_admin_session");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.user && (!parsed.expires_at || parsed.expires_at > Date.now())) {
            setUser(parsed.user as AuthUser);
            setSession({
              access_token: parsed.token || "mock-super-admin-token",
              token_type: "bearer",
              expires_in: 3600 * 24 * 7,
              expires_at: Math.floor((parsed.expires_at || Date.now() + 86400000 * 7) / 1000),
              refresh_token: "mock-refresh",
              user: parsed.user as AuthUser,
            });
            setLoading(false);
            return true;
          }
        }
      } catch {}
      return false;
    }

    // Check local session
    const hasSession = checkLocalSession();
    if (!hasSession) {
      setSession(null);
      setUser(null);
      setLoading(false);
    }

    const onAuthChange = () => {
      const found = checkLocalSession();
      if (!found) {
        setSession(null);
        setUser(null);
      }
    };
    window.addEventListener("dimisi-auth-change", onAuthChange);

    return () => {
      window.removeEventListener("dimisi-auth-change", onAuthChange);
    };
  }, []);

  return { session, user, loading };
}