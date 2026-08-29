/**
 * Website Visitor Intelligence — Server Functions
 */
import { createServerFn } from "@tanstack/react-start";
import { visitorsRepository } from "@/server/repositories/visitors.repository";
import { requireAdminAuth } from "@/server/auth/auth-middleware";
import { assertPermission } from "@/../dimisi-admin/server/authorization.server";
import { sanitizeText } from "./reviews.shared";
import type {
  VisitorSessionItem,
  PageViewItem,
  VisitorAnalyticsStats,
} from "./leads.shared";

/**
 * Public: Record / Initialize an anonymous or authenticated visitor session.
 */
export const recordVisitorSessionFn = createServerFn({ method: "POST" })
  .validator((input: {
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
  }) => ({
    visitor_id: sanitizeText(input.visitor_id, 64),
    session_id: sanitizeText(input.session_id, 64),
    initial_page: sanitizeText(input.initial_page || "/", 200),
    last_page: sanitizeText(input.last_page || input.initial_page || "/", 200),
    referrer: input.referrer ? sanitizeText(input.referrer, 300) : null,
    utm_source: input.utm_source ? sanitizeText(input.utm_source, 100) : null,
    utm_medium: input.utm_medium ? sanitizeText(input.utm_medium, 100) : null,
    utm_campaign: input.utm_campaign ? sanitizeText(input.utm_campaign, 100) : null,
    utm_term: input.utm_term ? sanitizeText(input.utm_term, 100) : null,
    utm_content: input.utm_content ? sanitizeText(input.utm_content, 100) : null,
    device_category: input.device_category || "desktop",
    browser: input.browser ? sanitizeText(input.browser, 50) : null,
    os: input.os ? sanitizeText(input.os, 50) : null,
    screen_resolution: input.screen_resolution ? sanitizeText(input.screen_resolution, 30) : null,
  }))
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    if (!data.visitor_id || !data.session_id) return { success: false };

    await visitorsRepository.upsertSession({
      visitor_id: data.visitor_id,
      session_id: data.session_id,
      initial_page: data.initial_page,
      last_page: data.last_page,
      referrer: data.referrer,
      utm_source: data.utm_source,
      utm_medium: data.utm_medium,
      utm_campaign: data.utm_campaign,
      utm_term: data.utm_term,
      utm_content: data.utm_content,
      device_category: data.device_category,
      browser: data.browser,
      os: data.os,
      screen_resolution: data.screen_resolution,
    });

    return { success: true };
  });

/**
 * Public: Record entry of a page view.
 */
export const recordPageViewFn = createServerFn({ method: "POST" })
  .validator((input: {
    page_view_id: string;
    session_id: string;
    visitor_id: string;
    path: string;
    title?: string | null;
    referrer?: string | null;
    entered_at?: string;
  }) => ({
    page_view_id: sanitizeText(input.page_view_id, 64),
    session_id: sanitizeText(input.session_id, 64),
    visitor_id: sanitizeText(input.visitor_id, 64),
    path: sanitizeText(input.path, 200),
    title: input.title ? sanitizeText(input.title, 200) : null,
    referrer: input.referrer ? sanitizeText(input.referrer, 300) : null,
    entered_at: input.entered_at || new Date().toISOString(),
  }))
  .handler(async ({ data }): Promise<{ success: boolean; id: string }> => {
    if (!data.visitor_id || !data.session_id) return { success: false, id: "" };

    const pv = await visitorsRepository.recordPageView({
      page_view_id: data.page_view_id,
      session_id: data.session_id,
      visitor_id: data.visitor_id,
      path: data.path,
      title: data.title,
      referrer: data.referrer,
      entered_at: data.entered_at,
    });

    return { success: true, id: pv.page_view_id };
  });

/**
 * Public: Finalize a page view upon exit or navigation.
 */
export const finalizePageViewFn = createServerFn({ method: "POST" })
  .validator((input: {
    page_view_id: string;
    session_id: string;
    visitor_id: string;
    duration_seconds: number;
    max_scroll_percent: number;
    exited_at?: string;
  }) => ({
    page_view_id: sanitizeText(input.page_view_id, 64),
    session_id: sanitizeText(input.session_id, 64),
    visitor_id: sanitizeText(input.visitor_id, 64),
    duration_seconds: Math.max(0, Math.min(86400, Number(input.duration_seconds) || 0)),
    max_scroll_percent: Math.max(0, Math.min(100, Number(input.max_scroll_percent) || 0)),
    exited_at: input.exited_at || new Date().toISOString(),
  }))
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    if (!data.page_view_id || !data.session_id) return { success: false };

    await visitorsRepository.finalizePageView({
      page_view_id: data.page_view_id,
      session_id: data.session_id,
      visitor_id: data.visitor_id,
      duration_seconds: data.duration_seconds,
      max_scroll_percent: data.max_scroll_percent,
      exited_at: data.exited_at,
    });

    return { success: true };
  });

/**
 * Public: Periodic lightweight active heartbeat from browser tab.
 */
export const heartbeatVisitorFn = createServerFn({ method: "POST" })
  .validator((input: {
    visitor_id: string;
    session_id: string;
    path?: string;
    scroll_percent?: number;
  }) => ({
    visitor_id: sanitizeText(input.visitor_id, 64),
    session_id: sanitizeText(input.session_id, 64),
    path: input.path ? sanitizeText(input.path, 200) : undefined,
    scroll_percent: input.scroll_percent ? Number(input.scroll_percent) : undefined,
  }))
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    if (!data.visitor_id || !data.session_id) return { ok: false };
    await visitorsRepository.heartbeat(data.visitor_id, data.session_id, data.path, data.scroll_percent);
    return { ok: true };
  });

/**
 * Admin: Get paginated visitor sessions for Live Intelligence view.
 */
export const getAdminVisitorsFn = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .validator((input: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "all" | "live" | "recent" | "offline";
    device?: string;
    authState?: string;
    sortBy?: "last_seen_at" | "started_at" | "page_count" | "total_duration_seconds" | "visit_count";
    sortOrder?: "asc" | "desc";
  }) => input)
  .handler(async ({ data, context }): Promise<{
    sessions: VisitorSessionItem[];
    total: number;
    page: number;
    totalPages: number;
    activeCount: number;
    stats: VisitorAnalyticsStats;
  }> => {
    await assertPermission(context, "analytics.view");

    const [visitorSessionsRes, stats] = await Promise.all([
      visitorsRepository.getVisitorSessions({
        page: Number(data?.page) || 1,
        limit: Number(data?.limit) || 20,
        search: data?.search || "",
        status: data?.status || "all",
        device: data?.device || "all",
        authState: data?.authState || "all",
        sortBy: data?.sortBy || "last_seen_at",
        sortOrder: data?.sortOrder || "desc",
      }),
      visitorsRepository.getVisitorStats(),
    ]);

    return {
      sessions: visitorSessionsRes.sessions as VisitorSessionItem[],
      total: visitorSessionsRes.total,
      page: visitorSessionsRes.page,
      totalPages: visitorSessionsRes.totalPages,
      activeCount: visitorSessionsRes.activeCount,
      stats,
    };
  });

/**
 * Admin: Get full chronological page journey for a specific visitor or session.
 */
export const getAdminVisitorJourneyFn = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .validator((input: { visitor_id?: string; session_id?: string }) => ({
    visitor_id: input.visitor_id ? String(input.visitor_id) : undefined,
    session_id: input.session_id ? String(input.session_id) : undefined,
  }))
  .handler(async ({ data, context }): Promise<{ journey: PageViewItem[] }> => {
    await assertPermission(context, "analytics.view");
    const journey = await visitorsRepository.getVisitorJourney(data.visitor_id, data.session_id);
    return { journey: journey as PageViewItem[] };
  });

/**
 * Admin: Quick stats for Overview metrics.
 */
export const getVisitorAnalyticsStatsFn = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }): Promise<VisitorAnalyticsStats> => {
    await assertPermission(context, "analytics.view");
    return visitorsRepository.getVisitorStats();
  });
