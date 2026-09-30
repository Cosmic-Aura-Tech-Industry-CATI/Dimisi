import {
  type AdminNotificationItem,
  type NotificationCategory,
  type NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} from "../lib/notifications.types";

const SETTINGS_KEY = "dimisi_notification_settings_v2";
const NOTIFICATIONS_KEY = "dimisi_admin_notifications_v2";
export const NOTIFICATIONS_EVENT = "dimisi-notifications-updated";

/**
 * Default starter notifications to provide immediate interactive feedback
 * aligned with the 7 administrative trigger categories.
 */
const SEED_NOTIFICATIONS: AdminNotificationItem[] = [
  {
    id: "notif-lead-001",
    category: "lead",
    title: "New Lead Inquiry Received",
    message: "Swatantra Singh submitted a web development project inquiry via /contact.",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
    isRead: false,
    targetTab: "leads",
  },
  {
    id: "notif-review-002",
    category: "review",
    title: "New Customer Review Submitted",
    message: "5-Star rating received for Enterprise Cloud Architecture services.",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    isRead: false,
    targetTab: "reviews",
  },
  {
    id: "notif-report-003",
    category: "report",
    title: "Review Flagged in Moderation",
    message: "A visitor flagged a testimonial as potentially misleading. Action required.",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    isRead: false,
    targetTab: "reports",
  },
  {
    id: "notif-event-004",
    category: "event",
    title: "Events & Gallery Update",
    message: "New attendee registration confirmed for DIMISI Annual Tech Summit 2026.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    isRead: true,
    targetTab: "events",
  },
  {
    id: "notif-log-005",
    category: "log",
    title: "Critical Admin Audit Log",
    message: "Security role permissions were updated for Panel User account.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), // 14 hours ago
    isRead: true,
    targetTab: "logs",
  },
  {
    id: "notif-campaign-006",
    category: "campaign",
    title: "Weekly Campaign Digest",
    message: "38 total QR scans and 24 unique page visitors recorded this week.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: true,
    targetTab: "campaigns",
  },
];

function notifySubscribers() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_EVENT));
  }
}

/**
 * Retrieve current notification settings from local cache or defaults.
 */
export function getNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.warn("[NotificationService] Error reading notification settings:", err);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

/**
 * Save updated notification settings.
 */
export async function saveNotificationSettings(
  data: Partial<NotificationSettings>,
): Promise<{ success: boolean; settings: NotificationSettings }> {
  const current = getNotificationSettings();
  const merged: NotificationSettings = {
    ...current,
    ...data,
    updated_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
      notifySubscribers();
    } catch (err) {
      console.error("[NotificationService] Error saving settings:", err);
    }
  }

  return { success: true, settings: merged };
}

/**
 * Retrieve all in-app notifications.
 */
export function getAdminNotifications(): AdminNotificationItem[] {
  if (typeof window === "undefined") return SEED_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) {
      // Seed default initial notifications if none exist
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(SEED_NOTIFICATIONS));
      return SEED_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn("[NotificationService] Error reading notifications:", err);
    return SEED_NOTIFICATIONS;
  }
}

/**
 * Mark a single notification as read by ID.
 */
export function markNotificationAsRead(id: string): void {
  if (typeof window === "undefined") return;
  const list = getAdminNotifications();
  const updated = list.map((item) =>
    item.id === id ? { ...item, isRead: true } : item,
  );
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    notifySubscribers();
  } catch (err) {
    console.error("[NotificationService] Error marking as read:", err);
  }
}

/**
 * Mark all notifications as read.
 */
export function markAllNotificationsAsRead(): void {
  if (typeof window === "undefined") return;
  const list = getAdminNotifications();
  const updated = list.map((item) => ({ ...item, isRead: true }));
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    notifySubscribers();
  } catch (err) {
    console.error("[NotificationService] Error marking all as read:", err);
  }
}

/**
 * Clear all notifications.
 */
export function clearAllNotifications(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
    notifySubscribers();
  } catch (err) {
    console.error("[NotificationService] Error clearing notifications:", err);
  }
}

/**
 * Delete a single notification by ID.
 */
export function deleteNotification(id: string): void {
  if (typeof window === "undefined") return;
  const list = getAdminNotifications();
  const updated = list.filter((item) => item.id !== id);
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    notifySubscribers();
  } catch (err) {
    console.error("[NotificationService] Error deleting notification:", err);
  }
}

/**
 * Dispatch / add a new in-app notification to the tray.
 */
export function addAdminNotification(
  item: Omit<AdminNotificationItem, "id" | "timestamp" | "isRead"> & {
    id?: string;
    timestamp?: string;
  },
): AdminNotificationItem {
  const newItem: AdminNotificationItem = {
    id: item.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    category: item.category,
    title: item.title,
    message: item.message,
    timestamp: item.timestamp || new Date().toISOString(),
    isRead: false,
    targetTab: item.targetTab,
    metadata: item.metadata,
  };

  if (typeof window !== "undefined") {
    const list = getAdminNotifications();
    const updated = [newItem, ...list.filter((n) => n.id !== newItem.id)].slice(0, 50); // Keep max 50
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
      notifySubscribers();
    } catch (err) {
      console.error("[NotificationService] Error adding notification:", err);
    }
  }

  return newItem;
}

/**
 * Synchronize live backend counts (pending reviews, open reports, leads)
 * into active unread notifications if configured triggers are ON.
 */
export function syncLiveCounts({
  pendingReviews = 0,
  openReports = 0,
  leadsToday = 0,
}: {
  pendingReviews?: number;
  openReports?: number;
  leadsToday?: number;
}): void {
  if (typeof window === "undefined") return;
  const settings = getNotificationSettings();

  if (pendingReviews > 0 && settings.notify_on_submit) {
    const list = getAdminNotifications();
    if (!list.some((n) => n.id === "live-pending-reviews" && !n.isRead)) {
      addAdminNotification({
        id: "live-pending-reviews",
        category: "review",
        title: `${pendingReviews} Pending Review${pendingReviews > 1 ? "s" : ""} Awaiting Moderation`,
        message: "Customer reviews have been submitted and require administrator verification.",
        targetTab: "reviews",
      });
    }
  }

  if (openReports > 0 && settings.notify_on_report) {
    const list = getAdminNotifications();
    if (!list.some((n) => n.id === "live-open-reports" && !n.isRead)) {
      addAdminNotification({
        id: "live-open-reports",
        category: "report",
        title: `${openReports} Reported Review${openReports > 1 ? "s" : ""} Flagged`,
        message: "Public reviews have been flagged by visitors. Immediate moderation audit recommended.",
        targetTab: "reports",
      });
    }
  }
}

/**
 * Trigger an interactive test notification and simulate dual email dispatch.
 */
export function triggerTestNotification(category: NotificationCategory): {
  notification: AdminNotificationItem;
  dispatchedEmails: string[];
} {
  const settings = getNotificationSettings();

  const presets: Record<
    NotificationCategory,
    { title: string; message: string; targetTab: AdminNotificationItem["targetTab"] }
  > = {
    lead: {
      title: "Test Alert: New Lead Inquiry",
      message: "Lead test alert from prospective client (Swatantra Singh - Enterprise Systems).",
      targetTab: "leads",
    },
    review: {
      title: "Test Alert: Customer Review",
      message: "Customer submitted a verified 5-star review for Web3 Application Development.",
      targetTab: "reviews",
    },
    report: {
      title: "Test Alert: Reported Review",
      message: "Visitor flagged review #RV-9041 for moderation team audit.",
      targetTab: "reports",
    },
    visitor: {
      title: "Test Alert: Visitor Report",
      message: "Security notification triggered on unusual traffic burst.",
      targetTab: "reports",
    },
    event: {
      title: "Test Alert: Events & Gallery",
      message: "New RSVP registered for upcoming Tech Innovation Summit.",
      targetTab: "events",
    },
    log: {
      title: "Test Alert: Critical Admin Log",
      message: "Audit notice: Administrative roles and permissions verified.",
      targetTab: "logs",
    },
    campaign: {
      title: "Test Alert: Campaign Performance",
      message: "Weekly campaign report: 45 QR scans and 18 conversions logged.",
      targetTab: "campaigns",
    },
  };

  const preset = presets[category] || presets.lead;

  const notif = addAdminNotification({
    category,
    title: preset.title,
    message: preset.message,
    targetTab: preset.targetTab,
  });

  const dispatchedEmails: string[] = [
    settings.company_email || "dimisitechnologiespvtltd@gmail.com",
  ];
  if (settings.admin_email && settings.admin_email.trim()) {
    dispatchedEmails.push(settings.admin_email.trim());
  }

  return {
    notification: notif,
    dispatchedEmails,
  };
}
