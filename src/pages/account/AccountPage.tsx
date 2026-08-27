import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { MagneticButton } from "@/components/common/MagneticButton/MagneticButton";
import { useAuth } from "@/hooks/useAuth";
import styles from "@/styles/auth.module.css";

export function AccountPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [notify, setNotify] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void supabase
      .from("profiles")
      .select("full_name, notify_email")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active || !data) return;
        setFullName(data.full_name ?? "");
        setNotify(data.notify_email ?? true);
      });
    return () => {
      active = false;
    };
  }, [user]);

  async function save() {
    if (!user) return;
    setSaving(true);
    setNotice(null);
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email ?? null,
        full_name: fullName,
        notify_email: notify,
      });
    setSaving(false);
    setNotice(error ? error.message : "Saved.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    void navigate({ to: "/", replace: true });
  }

  if (loading || !user) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <p className={styles.sub}>Loading your account…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>DIMISI Account</p>
        <h1 className={styles.title}>{fullName || user.email}</h1>
        <p className={styles.sub}>{user.email}</p>

        <div className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="acc-name">Full name</label>
            <input id="acc-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <label className={styles.check}>
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            <span>Send me DIMISI updates, product news and announcements by email.</span>
          </label>

          <div className={styles.row}>
            <MagneticButton onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </MagneticButton>
            <MagneticButton variant="ghost" onClick={signOut}>
              Sign out
            </MagneticButton>
          </div>
        </div>

        {notice ? <p className={[styles.msg, styles.ok].join(" ")}>{notice}</p> : null}
      </div>
    </div>
  );
}
