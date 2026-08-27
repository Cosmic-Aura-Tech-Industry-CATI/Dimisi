import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { useAuth } from "@/hooks/useAuth";
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

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/account", replace: true });
  }, [loading, user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
            data: { full_name: name, notify_email: notify },
          },
        });
        if (signUpError) throw signUpError;

        await supabase.from("leads").insert({
          email,
          full_name: name || null,
          source: "signup-form",
          page: window.location.pathname,
        });

        setNotice(
          "Account banaya gaya. Apna email inbox check karo — confirmation link bheja gaya hai.",
        );
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        void navigate({ to: "/account", replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in failed. Please try again.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/account", replace: true });
  }

  async function handleReset() {
    if (!email) {
      setError("Pehle apna email likho, phir reset link bhejenge.");
      return;
    }
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account`,
    });
    if (resetError) setError(resetError.message);
    else setNotice("Password reset link aapke email pe bhej diya gaya hai.");
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
