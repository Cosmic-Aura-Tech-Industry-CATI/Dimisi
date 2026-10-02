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
  | "logs"
  | "settings"
  | "leads"
  | "admins";

/**
 * Category of admin notifications.
 */
export type NotificationCategory =
  | "lead"
  | "review"
  | "report"
  | "visitor"
  | "event"
  | "log"
  | "campaign";

/**
 * Single in-app notification item displayed in the Topbar bell dropdown tray.
 */
export interface AdminNotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string; // ISO string
  isRead: boolean;
  targetTab: AdminTab;
  metadata?: Record<string, any>;
}

/**
 * System notification configuration preferences.
 * Governs the 7 core administrative triggers, delivery channels, and recipient emails.
 */
export interface NotificationSettings {
  // 7 Core Administrative Triggers
  notify_new_lead: boolean; // 1. New Lead Submission (/contact)
  notify_on_submit: boolean; // 2. New Review Submission
  notify_on_report: boolean; // 3. Reported Reviews / Moderation
  notify_visitor_report: boolean; // 4. Visitor Security / Report
  notify_events_gallery: boolean; // 5. Events & Gallery Updates
  notify_admin_logs: boolean; // 6. Critical Admin Audit Log
  notify_campaign_summary: boolean; // 7. Weekly Campaign Performance Summary

  // Customer Notification Options (legacy reviews compatibility)
  notify_on_approve: boolean;
  notify_on_reject: boolean;

  // Delivery Channels
  channel_in_app: boolean;
  channel_email: boolean;

  // Email Recipient Inboxes
  company_email: string; // Permanent company inbox: dimisitechnologiespvtltd@gmail.com
  admin_email: string; // Configured Administrator inbox

  updated_at?: string;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  notify_new_lead: true,
  notify_on_submit: true,
  notify_on_report: true,
  notify_visitor_report: true,
  notify_events_gallery: true,
  notify_admin_logs: true,
  notify_campaign_summary: true,
  notify_on_approve: true,
  notify_on_reject: false,
  channel_in_app: true,
  channel_email: true,
  company_email: "dimisitechnologiespvtltd@gmail.com",
  admin_email: "",
};
