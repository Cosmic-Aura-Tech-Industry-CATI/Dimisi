import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { useAuth } from "@/hooks/useAuth";
import { submitLeadFn } from "@/lib/leads.functions";
import { signInWithGoogleOAuth, handleGoogleOAuthCallback } from "@/lib/google-auth";
import { loginAdmin } from "@/services/adminAuth.service";
import styles from "@/styles/auth.module.css";

type Mode = "signin" | "signup";

export function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Check for existing session or Google OAuth redirect callback
  useEffect(() => {
    let active = true;
    void handleGoogleOAuthCallback().then((googleUser) => {
      if (!active) return;
      if (googleUser) {
        void navigate({ to: "/account", replace: true });
      }
    });

    if (!loading && user) void navigate({ to: "/account", replace: true });

    return () => {
      active = false;
    };
  }, [loading, user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("Please enter your email and password.");
      setBusy(false);
      return;
    }

    try {
      if (mode === "signup") {
        // 1. Record registration inquiry in MongoDB leads collection
        await submitLeadFn({
          data: {
            email: cleanEmail,
            fullName: name || undefined,
            source: "signup-form",
            page: window.location.pathname,
            message: `Account Signup (Notify: ${notify})`,
          },
        });

        setNotice("Account registration received! Welcome to DIMISI.");
        setTimeout(() => {
          void navigate({ to: "/account", replace: true });
        }, 1000);
      } else {
        // Sign in against Express backend authentication
        await loginAdmin({
          email: cleanEmail,
          password: cleanPassword,
        });

        setNotice("Signed in successfully. Redirecting…");
        setTimeout(() => {
          void navigate({ to: "/dimisi-admin", replace: true });
        }, 500);
      }
    } catch (err: any) {
      setError(err?.message || "Invalid email or password. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    try {
      const result = await signInWithGoogleOAuth({
        redirectUri: `${window.location.origin}/auth`,
      });

      if (!result.success) {
        if (result.error && !result.error.includes("cancelled")) {
          setError(result.error || "Google sign-in failed. Please try again.");
        }
        setBusy(false);
        return;
      }

      if (result.redirected) return;

      if (result.user) {
        setNotice("Signed in with Google successfully.");
        setTimeout(() => {
          void navigate({ to: "/account", replace: true });
        }, 600);
      }
    } catch (err: any) {
      setError(err?.message || "Unable to sign in with Google. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    if (!email) {
      setError("Please enter your email address to reset password.");
      return;
    }
    setError(null);
    setNotice("If an account exists with this email, password reset instructions have been sent.");
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>DIMISI Account</p>
        <h1 className={styles.title}>{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
        <p className={styles.sub}>
          Sign up to receive product updates, launch announcements and project information from
          DIMISI Technologies directly on your email.
        </p>

        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            className={[styles.tab, mode === "signup" ? styles.tabActive : ""].join(" ")}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signin"}
            className={[styles.tab, mode === "signin" ? styles.tabActive : ""].join(" ")}
            onClick={() => setMode("signin")}
          >
            Sign In
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <div className={styles.field}>
              <label htmlFor="auth-name">Full name</label>
              <input
                id="auth-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          ) : null}

          <div className={styles.field}>
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={6}
              required
            />
          </div>

          {mode === "signup" ? (
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
              />
              <span>Email me DIMISI updates, product news and announcements.</span>
            </label>
          ) : null}

          <div className={styles.row}>
            <MagneticButton type="submit" disabled={busy}>
              {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </MagneticButton>
            {mode === "signin" ? (
              <button type="button" className={styles.linkBtn} onClick={handleReset}>
                Forgot password?
              </button>
            ) : null}
          </div>
        </form>

        <div className={styles.divider}>or</div>

        <button type="button" className={styles.google} onClick={handleGoogle} disabled={busy}>
          Continue with Google
        </button>

        {error ? <p className={[styles.msg, styles.error].join(" ")}>{error}</p> : null}
        {notice ? <p className={[styles.msg, styles.ok].join(" ")}>{notice}</p> : null}
      </div>
    </div>
  );
}
