import { useState, type ReactNode } from "react";
import { AdminTopbar } from "../AdminTopbar/AdminTopbar";
import { AdminSidebar, ADMIN_NAV, type AdminTab } from "../AdminSidebar/AdminSidebar";
import { type AdminRole } from "../../lib/rbac.shared";
import styles from "./AdminShell.module.css";

export type { AdminTab };

/** Admin-only chrome: fixed left sidebar navigation + topbar. */
export function AdminShell({
  tab,
  onTab,
  profile,
  onSignOut,
  userRole = "super_admin",
  pendingReviewsCount = 0,
  openReportsCount = 0,
  children,
}: {
  tab: AdminTab;
  onTab: (t: AdminTab) => void;
  profile?: ReactNode;
  onSignOut: () => void;
  userRole?: AdminRole | undefined;
  pendingReviewsCount?: number;
  openReportsCount?: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <AdminSidebar
        tab={tab}
        onTab={onTab}
        open={open}
        onClose={() => setOpen(false)}
        onSignOut={onSignOut}
        userRole={userRole}
        pendingReviewsCount={pendingReviewsCount}
        openReportsCount={openReportsCount}
      />

      <div className={styles.main}>
        <AdminTopbar
          title={ADMIN_NAV.find((n) => n.id === tab)?.label ?? "Admin"}
          onToggleNav={() => setOpen((v) => !v)}
          profile={profile}
        />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
