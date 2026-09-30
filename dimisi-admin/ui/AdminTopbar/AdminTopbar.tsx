import type { ReactNode } from "react";
import { Menu, Clock, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { AdminTab } from "../AdminSidebar/AdminSidebar";
import { AdminNotificationBell } from "./AdminNotificationBell";
import styles from "./AdminTopbar.module.css";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Admin topbar: mobile nav toggle, section title, live session countdown, notification hub, right-aligned profile icon. */
export function AdminTopbar({
  title,
  onToggleNav,
  profile,
  onTab,
}: {
  title: string;
  onToggleNav: () => void;
  profile?: ReactNode;
  onTab?: (tab: AdminTab) => void;
}) {
  const { remainingSeconds, isExpiringSoon } = useAuth();

  return (
    <header className={styles.topbar}>
      <button
        type="button"
        className={styles.menuBtn}
        aria-label="Toggle navigation"
        onClick={onToggleNav}
      >
        <Menu size={18} />
      </button>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.right}>
        {remainingSeconds > 0 && (
          <div
            className={`${styles.sessionPill} ${isExpiringSoon ? styles.sessionWarning : ""}`}
            title={
              isExpiringSoon
                ? "Security session expires in under 2 minutes. Please save your work or re-authenticate."
                : "Active 15-minute security session"
            }
          >
            {isExpiringSoon ? <AlertTriangle size={12} /> : <Clock size={12} />}
            <span>{formatTime(remainingSeconds)}</span>
          </div>
        )}
        <AdminNotificationBell onNavigate={onTab} />
        {profile}
      </div>
    </header>
  );
}
