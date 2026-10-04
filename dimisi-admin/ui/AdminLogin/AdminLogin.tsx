import { useState, useEffect } from "react";
import { Eye, EyeOff, ShieldCheck, Clock } from "lucide-react";
import { loginAdmin, ADMIN_EXPIRED_NOTICE_KEY } from "@/services/adminAuth.service";
import { ApiError } from "@/services/apiClient";
import styles from "../styles/admin.module.css";

const LAST_ADMIN_EMAIL_KEY = "dimisi_last_admin_email";

/** Secure sign-in gate for the DIMISI admin panel with Express backend authentication. */
export function AdminLogin() {
  const [email, setEmail] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(LAST_ADMIN_EMAIL_KEY) || "";
    }
    return "";
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sessionNotice, setSessionNotice] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const expiredReason = sessionStorage.getItem(ADMIN_EXPIRED_NOTICE_KEY);
      if (expiredReason) {
        sessionStorage.removeItem(ADMIN_EXPIRED_NOTICE_KEY);
        return expiredReason;
      }
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionNotice) {
      const timer = setTimeout(() => setSessionNotice(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [sessionNotice]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("Please provide both administrator email and password.");
      setBusy(false);
      return;
    }

    try {
      await loginAdmin({
        email: cleanEmail,
        password: cleanPassword,
      });
      if (typeof window !== "undefined") {
        localStorage.setItem(LAST_ADMIN_EMAIL_KEY, cleanEmail);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError(err.message && !err.message.includes("status 401") ? err.message : "Invalid administrator credentials.");
        } else if (err.status === 403) {
          setError(err.message || "You do not have permission to access the control room.");
        } else if (err.status === 408) {
          setError("Authentication request timed out. Please try again.");
        } else if (err.status === 0) {
          setError("Unable to reach the authentication service. Please verify the backend is running.");
        } else if (err.status >= 500) {
          setError("Authentication service is temporarily unavailable.");
        } else {
          setError(err.message || "Authentication failed.");
        }
      } else if (err instanceof Error) {
        setError(err.message || "Session could not be established.");
      } else {
        setError("Unexpected authentication error. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.center}>
      <div className={styles.card}>
        <div className={styles.lock} aria-hidden="true">
          <ShieldCheck size={20} color="var(--dm-amber, #ffb300)" />
        </div>
        <p className={styles.kicker}>DIMISI Admin Control Room</p>
        <h1 className={styles.title}>Super Admin Access</h1>
        <p className={styles.sub} style={{ marginBottom: "1.5rem" }}>
          Sign in with your authorized administrator credentials.
        </p>

        {sessionNotice && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.65rem 0.85rem",
              borderRadius: "0.5rem",
              background: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              color: "#fbbf24",
              fontSize: "0.85rem",
              marginBottom: "1rem",
              lineHeight: "1.4",
            }}
          >
            <Clock size={16} style={{ flexShrink: 0 }} />
            <span>{sessionNotice}</span>
          </div>
        )}

        <form className={styles.form} onSubmit={submit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="admin-email">
              Admin Email
            </label>
            <input
              id="admin-email"
              className={styles.input}
              type="email"
              required
              placeholder="swatantrasingh308@gmail.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="admin-password">
              Password
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                id="admin-password"
                className={styles.input}
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: "2.5rem" }}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.25rem",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button type="submit" className={styles.btn} disabled={busy}>
            {busy ? "Authenticating…" : "Enter Control Room"}
          </button>
        </form>
      </div>
    </div>
  );
}
