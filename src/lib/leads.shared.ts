/**
 * Leads & Website Visitor Intelligence — Shared Data Types & Contracts
 */

export type LeadStatus = "new" | "contacted" | "in_progress" | "converted" | "archived";

export interface LeadItem {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  company?: string | null;
  inquiry_type?: string | null;
  source?: string | null;
  page?: string | null;
  message?: string | null;
  status: LeadStatus;
  visitor_id?: string | null;
  session_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface VisitorSessionItem {
  id: string;
  session_id: string;
  visitor_id: string;
  user_id?: string | null;
  auth_state: "anonymous" | "registered" | "authenticated";
  first_seen_at: string;
  last_seen_at: string;
  started_at: string;
  ended_at?: string | null;
  page_count: number;
  total_duration_seconds: number;
  initial_page: string;
  last_page: string;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  device_category: "desktop" | "mobile" | "tablet" | "unknown";
  browser?: string | null;
  os?: string | null;
  screen_resolution?: string | null;
  visit_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageViewItem {
  id: string;
  page_view_id: string;
  session_id: string;
  visitor_id: string;
  user_id?: string | null;
  path: string;
  title?: string | null;
  referrer?: string | null;
  entered_at: string;
  exited_at?: string | null;
  duration_seconds: number;
  max_scroll_percent: number;
  created_at: string;
  updated_at: string;
}

export interface LeadDetailsWithJourney {
  lead: LeadItem;
  visitorSession: VisitorSessionItem | null;
  pageJourney: PageViewItem[];
}

export interface LeadAnalyticsStats {
  totalLeads: number;
  newToday: number;
  contactedCount: number;
  convertedCount: number;
  conversionRate: number;
}

export interface VisitorAnalyticsStats {
  totalVisitorsToday: number;
  activeLiveVisitors: number;
  totalSessions: number;
  returningVisitorsCount: number;
  returningRatioPercent: number;
  avgDurationSeconds: number;
  totalPageViewsToday: number;
}

export const LEAD_STATUS_META: Record<
  LeadStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  new: {
    label: "New",
    color: "#60a5fa",
    bg: "rgba(96, 165, 250, 0.12)",
    border: "rgba(96, 165, 250, 0.3)",
  },
  contacted: {
    label: "Contacted",
    color: "#fbbf24",
    bg: "rgba(251, 191, 36, 0.12)",
    border: "rgba(251, 191, 36, 0.3)",
  },
  in_progress: {
    label: "In Progress",
    color: "#c084fc",
    bg: "rgba(192, 132, 252, 0.12)",
    border: "rgba(192, 132, 252, 0.3)",
  },
  converted: {
    label: "Converted",
    color: "#34d399",
    bg: "rgba(52, 211, 153, 0.12)",
    border: "rgba(52, 211, 153, 0.3)",
  },
  archived: {
    label: "Archived",
    color: "#94a3b8",
    bg: "rgba(148, 163, 184, 0.12)",
    border: "rgba(148, 163, 184, 0.3)",
  },
};
