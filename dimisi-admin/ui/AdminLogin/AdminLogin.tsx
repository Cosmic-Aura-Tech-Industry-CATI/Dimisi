import { useState } from "react";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { loginAdminFn } from "../../server/admin.functions";
import styles from "../styles/admin.module.css";

/** Secure sign-in gate for the DIMISI admin panel with Super Admin credentials support. */
export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const res = await loginAdminFn({
        data: {
          email: cleanEmail,
          password: cleanPassword,
        },
      });

      if (res?.success && res.user) {
        localStorage.setItem(
          "dimisi_admin_session",
          JSON.stringify({
            user: res.user,
            token: res.token,
            expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000,
          }),
        );
        window.dispatchEvent(new Event("dimisi-auth-change"));
      } else {
        setError("Invalid email or password.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
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
