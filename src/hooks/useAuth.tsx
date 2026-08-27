import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function checkLocalSession(): boolean {
      if (typeof window === "undefined") return false;
      try {
        const raw = localStorage.getItem("dimisi_admin_session");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.user && (!parsed.expires_at || parsed.expires_at > Date.now())) {
            setUser(parsed.user as User);
            setSession({
              access_token: parsed.token || "mock-super-admin-token",
              token_type: "bearer",
              expires_in: 3600 * 24 * 7,
              expires_at: Math.floor((parsed.expires_at || Date.now() + 86400000 * 7) / 1000),
              refresh_token: "mock-refresh",
              user: parsed.user as User,
            });
            setLoading(false);
            return true;
          }
        }
      } catch {}
      return false;
    }

    // First check local admin session
    checkLocalSession();

    let sub: { subscription: { unsubscribe: () => void } } | null = null;
    try {
      const authSub = supabase.auth.onAuthStateChange((_event, next) => {
        if (next?.user) {
          setSession(next);
          setUser(next.user);
          setLoading(false);
        } else {
          const found = checkLocalSession();
          if (!found) {
            setSession(null);
            setUser(null);
            setLoading(false);
          }
        }
      });
      sub = authSub.data;
    } catch {}

    try {
      supabase.auth
        .getSession()
        .then(({ data }) => {
          if (data?.session?.user) {
            setSession(data.session);
            setUser(data.session.user);
            setLoading(false);
          } else {
            const found = checkLocalSession();
            if (!found) {
              setSession(null);
              setUser(null);
              setLoading(false);
            }
          }
        })
        .catch(() => {
          checkLocalSession();
          setLoading(false);
        });
    } catch {
      checkLocalSession();
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
      if (sub?.subscription) sub.subscription.unsubscribe();
      window.removeEventListener("dimisi-auth-change", onAuthChange);
    };
  }, []);

  return { session, user, loading };
}