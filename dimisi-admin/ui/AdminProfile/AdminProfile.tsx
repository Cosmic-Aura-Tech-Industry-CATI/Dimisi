import { useEffect, useRef, useState } from "react";
import { ChevronDown, Shield } from "lucide-react";
import { type AdminRole, getRoleMeta } from "../../lib/rbac.shared";
import styles from "./AdminProfile.module.css";

export const DESIGNATIONS = [
  "CEO",
  "CTO",
  "CFO",
  "COO",
  "CMO",
  "Product Manager",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "UI/UX Designer",
  "DevOps Engineer",
  "QA Engineer",
  "HR Manager",
  "Intern",
];

function initials(name: string | null | undefined, email: string | null | undefined) {
  const src = (name ?? email ?? "A").trim();
  const parts = src.split(/[\s.@_-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "A") + (parts[1]?.[0] ?? "")).toUpperCase();
}

/** Topbar admin identity chip + detail popover with role awareness. */
export function AdminProfile({
  email,
  fullName,
  designation,
  role = "super_admin",
  userId,
  memberSince,
  onSave,
}: {
  email: string | null | undefined;
  fullName: string | null;
  designation: string | null;
  role?: AdminRole | undefined;
  userId: string;
  memberSince?: string | undefined;
  onSave: (values: { fullName: string; designation: string }) => Promise<string>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(fullName ?? "");
  const [desig, setDesig] = useState(designation ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setName(fullName ?? "");
    setDesig(designation ?? "");
  }, [fullName, designation]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function save() {
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      setMsg(await onSave({ fullName: name, designation: desig }));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  const roleMeta = getRoleMeta(role);

  return (
    <div className={styles.wrap} ref={box}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Admin profile"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.avatar}>{initials(fullName, email)}</span>
        <ChevronDown size={14} />
      </button>

      {open ? (
        <div className={styles.panel} role="dialog" aria-label="Admin details">
          <div className={styles.head}>
            <span className={[styles.avatar, styles.headAvatar].join(" ")}>
              {initials(fullName, email)}
            </span>
            <div>
              <p className={styles.name}>{fullName || email || "DIMISI Admin"}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.2rem" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "0.15rem 0.45rem",
                    borderRadius: "4px",
                    color: roleMeta.color,
                    background: roleMeta.bg,
                    border: `1px solid ${roleMeta.border}`,
                  }}
                >
                  {roleMeta.shortLabel}
                </span>
                <span className={styles.role}>{designation || "Staff"}</span>
              </div>
            </div>
          </div>

          <div className={styles.rows}>
            <div className={styles.row}>
              <span className={styles.key}>Email</span>
              <span className={styles.val}>{email ?? "—"}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.key}>Designation</span>
              <span className={styles.val}>{designation || "Not set"}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.key}>System Role</span>
              <span className={styles.val} style={{ color: roleMeta.color, fontWeight: 700 }}>
                {roleMeta.label}
              </span>
            </div>
            {memberSince ? (
              <div className={styles.row}>
                <span className={styles.key}>Admin since</span>
                <span className={styles.val}>{new Date(memberSince).toLocaleDateString()}</span>
              </div>
            ) : null}
            <div className={styles.row}>
              <span className={styles.key}>Account ID</span>
              <span className={styles.val}>{userId.slice(0, 8)}…</span>
            </div>
          </div>

          <div className={styles.form}>
            <input
              className={styles.input}
              value={name}
              placeholder="Full name"
              onChange={(e) => setName(e.target.value)}
            />
            <select
              className={styles.select}
              value={desig}
              onChange={(e) => setDesig(e.target.value)}
            >
              <option value="">Select designation…</option>
              {DESIGNATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <div className={styles.actions}>
              <button type="button" className={styles.save} disabled={busy} onClick={() => void save()}>
                {busy ? "Saving…" : "Save details"}
              </button>
              {msg ? <p className={styles.msg}>{msg}</p> : null}
              {err ? <p className={styles.err}>{err}</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
