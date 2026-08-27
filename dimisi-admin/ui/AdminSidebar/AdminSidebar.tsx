import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Users,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Star,
  QrCode,
  Flag,
  TrendingUp,
  Settings,
  Calendar,
  Layers,
  FolderGit2,
  Briefcase,
  BookOpen,
} from "lucide-react";
import { type AdminRole, canAccessTab } from "../../lib/rbac.shared";
import styles from "./AdminSidebar.module.css";

export type AdminTab =
  | "overview"
  | "services"
  | "work"
  | "careers"
  | "blog"
  | "events"
  | "reviews"
  | "campaigns"
  | "reports"
  | "analytics"
  | "settings"
  | "leads"
  | "admins";

export const ADMIN_NAV: {
  id: AdminTab;
  label: string;
  icon: typeof BarChart3;
  badgeKey?: "pendingReviews" | "openReports";
}[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "services", label: "Services & Sectors", icon: Layers },
  { id: "work", label: "Our Work & Products", icon: FolderGit2 },
  { id: "careers", label: "Careers & Jobs", icon: Briefcase },
  { id: "blog", label: "Blog & Journal", icon: BookOpen },
  { id: "events", label: "Events & Gallery", icon: Calendar },
  { id: "reviews", label: "Reviews", icon: Star, badgeKey: "pendingReviews" },
  { id: "campaigns", label: "Campaigns & QR", icon: QrCode },
  { id: "reports", label: "Moderation Queue", icon: Flag, badgeKey: "openReports" },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "settings", label: "Notifications", icon: Settings },
  { id: "leads", label: "Leads", icon: Users },
  { id: "admins", label: "Admins", icon: ShieldCheck },
];

/** Fixed left navigation for the admin area with role-based filtering. */
export function AdminSidebar({
  tab,
  onTab,
  open,
  onClose,
  onSignOut,
  userRole = "super_admin",
  pendingReviewsCount = 0,
  openReportsCount = 0,
}: {
  tab: AdminTab;
  onTab: (t: AdminTab) => void;
  open: boolean;
  onClose: () => void;
  onSignOut: () => void;
  userRole?: AdminRole | undefined;
  pendingReviewsCount?: number;
  openReportsCount?: number;
}) {
  // Filter navigation items based on the authenticated user's role
  const visibleNav = ADMIN_NAV.filter((item) => canAccessTab(userRole, item.id));

  return (
    <>
      <aside className={[styles.sidebar, open ? styles.sidebarOpen : ""].join(" ")}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>DM</span>
          <span className={styles.brandText}>DIMISI Admin</span>
        </div>
        <nav className={styles.nav}>
          {visibleNav.map((item) => {
            const badge =
              item.badgeKey === "pendingReviews"
                ? pendingReviewsCount
                : item.badgeKey === "openReports"
                ? openReportsCount
                : 0;

            return (
              <button
                key={item.id}
                type="button"
                className={[styles.navItem, tab === item.id ? styles.navItemActive : ""].join(" ")}
                onClick={() => {
                  onTab(item.id);
                  onClose();
                }}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
                {badge > 0 ? (
                  <span
                    className={[
                      styles.sidebarBadge,
                      item.badgeKey === "pendingReviews" ? styles.sidebarBadgeAmber : "",
                    ].join(" ")}
                  >
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
        <div className={styles.foot}>
          <Link to="/" className={styles.navItem}>
            <ExternalLink size={16} />
            <span>View website</span>
          </Link>
          <button type="button" className={styles.navItem} onClick={onSignOut}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {open ? <div className={styles.scrim} onClick={onClose} aria-hidden="true" /> : null}
    </>
  );
}
