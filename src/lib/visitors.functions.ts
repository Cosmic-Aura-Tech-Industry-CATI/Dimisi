/**
 * DIMISI Technologies — Client-Side Visitor Intelligence
 * Pure client-side telemetry state and local session simulation.
 */
import type {
  VisitorSessionItem,
  PageViewItem,
  VisitorAnalyticsStats,
} from "./leads.shared";

const SESSIONS_KEY = "dimisi_visitor_sessions_v1";
const PAGEVIEWS_KEY = "dimisi_page_views_v1";

const DEMO_SESSIONS: VisitorSessionItem[] = [
  {
    id: "ses-demo-101",
    session_id: "ses-demo-101",
    visitor_id: "vis-demo-101",
    user_id: null,
    auth_state: "anonymous",
    first_seen_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    last_seen_at: new Date(Date.now() - 60000 * 2).toISOString(),
    started_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    page_count: 4,
    total_duration_seconds: 320,
    initial_page: "/",
    last_page: "/contact",
    referrer: "https://google.com",
    utm_source: "google",
    utm_medium: "organic",
    device_category: "desktop",
    browser: "Chrome 124",
    os: "macOS",
    screen_resolution: "2560x1440",
    visit_count: 2,
    is_active: true,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "ses-demo-102",
    session_id: "ses-demo-102",
    visitor_id: "vis-demo-102",
    user_id: null,
    auth_state: "anonymous",
    first_seen_at: new Date(Date.now() - 86400000).toISOString(),
    last_seen_at: new Date(Date.now() - 60000 * 15).toISOString(),
    started_at: new Date(Date.now() - 86400000).toISOString(),
    page_count: 2,
    total_duration_seconds: 140,
    initial_page: "/services",
    last_page: "/services/web3-and-blockchain",
    referrer: "https://twitter.com",
    utm_source: "twitter",
    utm_medium: "social",
    device_category: "mobile",
    browser: "Safari 17",
    os: "iOS",
    screen_resolution: "393x852",
    visit_count: 1,
    is_active: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function recordVisitorSessionFn({
  data,
}: {
  data: {
    visitor_id: string;
    session_id: string;
    initial_page?: string;
    last_page?: string;
    referrer?: string | null;
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_term?: string | null;
    utm_content?: string | null;
    device_category?: "desktop" | "mobile" | "tablet" | "unknown";
    browser?: string | null;
    os?: string | null;
    screen_resolution?: string | null;
  };
}): Promise<{ success: boolean }> {
  return { success: true };
}

export async function recordPageViewFn({
  data,
}: {
  data: {
    page_view_id: string;
    session_id: string;
    visitor_id: string;
    path: string;
    title?: string | null;
    referrer?: string | null;
    entered_at?: string;
  };
}): Promise<{ success: boolean; id: string }> {
  return { success: true, id: data.page_view_id };
}

export async function finalizePageViewFn({
  data,
}: {
  data: {
    page_view_id: string;
    session_id: string;
    visitor_id: string;
    duration_seconds: number;
    max_scroll_percent: number;
    exited_at?: string;
  };
}): Promise<{ success: boolean }> {
  return { success: true };
}

export async function heartbeatVisitorFn({
  data,
}: {
  data: {
    visitor_id: string;
    session_id: string;
    path?: string;
    scroll_percent?: number;
  };
}): Promise<{ ok: boolean }> {
  return { ok: true };
}

export async function getAdminVisitorsFn({
  data,
}: {
  data?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "all" | "live" | "recent" | "offline";
    device?: string;
    authState?: string;
    sortBy?: string;
    sortOrder?: string;
  };
} = {}): Promise<{
  sessions: VisitorSessionItem[];
  total: number;
  page: number;
  totalPages: number;
  activeCount: number;
  stats: VisitorAnalyticsStats;
}> {
  let sessions = [...DEMO_SESSIONS];
  const total = sessions.length;
  const page = data?.page || 1;
  const limit = data?.limit || 20;

  return {
    sessions,
    total,
    page,
    totalPages: 1,
    activeCount: 1,
    stats: {
      totalVisitorsToday: 24,
      activeLiveVisitors: 1,
      totalSessions: 38,
      returningVisitorsCount: 9,
      returningRatioPercent: 37.5,
      avgDurationSeconds: 198,
      totalPageViewsToday: 114,
    },
  };
}

export async function getAdminVisitorJourneyFn({
  data,
}: {
  data: { visitor_id?: string; session_id?: string };
}): Promise<{ journey: PageViewItem[] }> {
  return {
    journey: [
      {
        id: "pv-j1",
        page_view_id: "pv-j1",
        session_id: data.session_id || "ses-demo",
        visitor_id: data.visitor_id || "vis-demo",
        path: "/",
        title: "Home — DIMISI Technologies",
        entered_at: new Date(Date.now() - 3600000).toISOString(),
        duration_seconds: 45,
        max_scroll_percent: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "pv-j2",
        page_view_id: "pv-j2",
        session_id: data.session_id || "ses-demo",
        visitor_id: data.visitor_id || "vis-demo",
        path: "/services",
        title: "Services — DIMISI Technologies",
        entered_at: new Date(Date.now() - 3500000).toISOString(),
        duration_seconds: 90,
        max_scroll_percent: 75,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  };
}

export async function getVisitorAnalyticsStatsFn(): Promise<VisitorAnalyticsStats> {
  return {
    totalVisitorsToday: 24,
    activeLiveVisitors: 1,
    totalSessions: 38,
    returningVisitorsCount: 9,
    returningRatioPercent: 37.5,
    avgDurationSeconds: 198,
    totalPageViewsToday: 114,
  };
}
