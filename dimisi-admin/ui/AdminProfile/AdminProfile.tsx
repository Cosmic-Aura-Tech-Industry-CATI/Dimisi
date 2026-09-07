import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { type AdminRole, getRoleMeta } from "../../lib/rbac.shared";
import styles from "./AdminProfile.module.css";

function initials(name: string | null | undefined, email: string | null | undefined) {
  const src = (name ?? email ?? "A").trim();
  const parts = src.split(/[\s.@_-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "A") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export interface AdminProfileProps {
  email: string | null | undefined;
  fullName: string | null;
  designation: string | null;
  role?: AdminRole | undefined;
  userId: string;
  memberSince?: string | undefined;
}

/** Topbar admin identity chip + detail popover with role awareness. */
export function AdminProfile({
  email,
  fullName,
  designation,
  role = "super_admin",
  userId,
  memberSince,
}: AdminProfileProps) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

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
              <p className={styles.name}>{fullName || "DIMISI Admin"}</p>
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
        </div>
      ) : null}
    </div>
  );
}
