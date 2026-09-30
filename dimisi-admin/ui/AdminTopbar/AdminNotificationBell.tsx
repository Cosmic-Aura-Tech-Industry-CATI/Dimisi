import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCheck,
  ArrowRight,
  Settings,
  Trash2,
  Users,
  Star,
  Flag,
  Shield,
  Calendar,
  ScrollText,
  BarChart3,
  Inbox,
} from "lucide-react";
import type { AdminTab } from "../AdminSidebar/AdminSidebar";
import {
  type AdminNotificationItem,
  type NotificationCategory,
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  NOTIFICATIONS_EVENT,
} from "@/services";
import styles from "./AdminNotificationBell.module.css";

function formatRelativeTime(dateStr: string): string {
  try {
    const delta = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (delta < 60) return "just now";
    if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
    if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
    if (delta < 604800) return `${Math.floor(delta / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getCategoryConfig(category: NotificationCategory) {
  switch (category) {
    case "lead":
      return {
        icon: Users,
        color: "#60a5fa",
        bg: "rgba(59, 130, 246, 0.16)",
        label: "Lead",
      };
    case "review":
      return {
        icon: Star,
        color: "#fbbf24",
        bg: "rgba(245, 158, 11, 0.16)",
        label: "Review",
      };
    case "report":
      return {
        icon: Flag,
        color: "#f87171",
        bg: "rgba(239, 68, 68, 0.16)",
        label: "Moderation",
      };
    case "visitor":
      return {
        icon: Shield,
        color: "#22d3ee",
        bg: "rgba(6, 182, 212, 0.16)",
        label: "Visitor",
      };
    case "event":
      return {
        icon: Calendar,
        color: "#c084fc",
        bg: "rgba(168, 85, 247, 0.16)",
        label: "Events",
      };
    case "log":
      return {
        icon: ScrollText,
        color: "#34d399",
        bg: "rgba(16, 185, 129, 0.16)",
        label: "Admin Log",
      };
    case "campaign":
      return {
        icon: BarChart3,
        color: "#818cf8",
        bg: "rgba(99, 102, 241, 0.16)",
        label: "Campaign",
      };
    default:
      return {
        icon: Inbox,
        color: "#ff9d42",
        bg: "rgba(255, 122, 24, 0.16)",
        label: "General",
      };
  }
}

interface AdminNotificationBellProps {
  onNavigate?: (tab: AdminTab) => void;
}

export function AdminNotificationBell({ onNavigate }: AdminNotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | NotificationCategory>("all");
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync notifications from local store & listen for custom events
  useEffect(() => {
    const sync = () => {
      setNotifications(getAdminNotifications());
    };
    sync();

    window.addEventListener(NOTIFICATIONS_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(NOTIFICATIONS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "all") return true;
    return item.category === filter;
  });

  const handleItemClick = (item: AdminNotificationItem) => {
    markNotificationAsRead(item.id);
    setIsOpen(false);
    if (onNavigate && item.targetTab) {
      onNavigate(item.targetTab);
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
  };

  const handleClearAll = () => {
    if (window.confirm("Clear all notifications from the tray?")) {
      clearAllNotifications();
    }
  };

  const handleConfigureClick = () => {
    setIsOpen(false);
    if (onNavigate) {
      onNavigate("settings");
    }
  };

  return (
    <div className={styles.wrap} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        className={`${styles.bellBtn} ${isOpen ? styles.bellBtnActive : ""}`}
        aria-label={`Admin notifications, ${unreadCount} unread`}
        title={`Admin notifications (${unreadCount} unread)`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <>
            <span className={styles.badge}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
            <span className={styles.pingDot} />
          </>
        )}
      </button>

      {/* Flyout Tray */}
      {isOpen && (
        <div className={styles.dropdown} role="dialog" aria-modal="true">
          {/* Header */}
          <div className={styles.dropHeader}>
            <div className={styles.dropHeaderLeft}>
              <h2 className={styles.dropTitle}>Notifications</h2>
              {unreadCount > 0 && (
                <span className={styles.unreadPill}>{unreadCount} unread</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className={styles.markAllBtn}
                onClick={handleMarkAllRead}
                title="Mark all as read"
              >
                <CheckCheck size={14} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Chips Bar */}
          <div className={styles.filterBar}>
            <button
              type="button"
              className={`${styles.filterChip} ${filter === "all" ? styles.filterChipActive : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${filter === "lead" ? styles.filterChipActive : ""}`}
              onClick={() => setFilter("lead")}
            >
              Leads
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${filter === "review" ? styles.filterChipActive : ""}`}
              onClick={() => setFilter("review")}
            >
              Reviews
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${filter === "report" ? styles.filterChipActive : ""}`}
              onClick={() => setFilter("report")}
            >
              Reports
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${filter === "log" ? styles.filterChipActive : ""}`}
              onClick={() => setFilter("log")}
            >
              Logs
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${filter === "event" ? styles.filterChipActive : ""}`}
              onClick={() => setFilter("event")}
            >
              Events
            </button>
          </div>

          {/* Notifications Scroll List */}
          <div className={styles.list}>
            {filteredNotifications.length === 0 ? (
              <div className={styles.empty}>
                <Inbox size={32} color="#64748b" style={{ opacity: 0.6 }} />
                <p className={styles.emptyTitle}>No notifications</p>
                <p className={styles.emptyDesc}>
                  {filter === "all"
                    ? "You are completely caught up."
                    : `No ${filter} alerts recorded right now.`}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const conf = getCategoryConfig(item.category);
                const IconComponent = conf.icon;

                return (
                  <div
                    key={item.id}
                    className={`${styles.item} ${!item.isRead ? styles.itemUnread : ""}`}
                    onClick={() => handleItemClick(item)}
                    role="button"
                    tabIndex={0}
                  >
                    <div
                      className={styles.iconCircle}
                      style={{ background: conf.bg, color: conf.color }}
                    >
                      <IconComponent size={16} />
                    </div>

                    <div className={styles.itemContent}>
                      <div className={styles.itemHeader}>
                        <span className={styles.itemTitle}>{item.title}</span>
                        {!item.isRead && <span className={styles.unreadDot} />}
                      </div>

                      <p className={styles.itemMessage}>{item.message}</p>

                      <div className={styles.itemFooter}>
                        <span className={styles.time}>
                          {formatRelativeTime(item.timestamp)}
                        </span>
                        <span className={styles.actionHint}>
                          <span>View {item.targetTab}</span>
                          <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className={styles.dropFooter}>
            <button
              type="button"
              className={styles.footerLink}
              onClick={handleConfigureClick}
            >
              <Settings size={13} />
              <span>Configure Triggers</span>
            </button>

            {notifications.length > 0 && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={handleClearAll}
                title="Clear all alerts"
              >
                <Trash2 size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
