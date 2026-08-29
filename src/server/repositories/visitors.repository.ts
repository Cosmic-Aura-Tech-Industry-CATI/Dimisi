/**
 * Visitors Repository — First-Party Visitor Intelligence Data Layer
 */
import {
  getCollection,
  COLLECTIONS,
  type MongoVisitorSession,
  type MongoPageView,
} from "../db/collections";

export interface SessionUpsertInput {
  visitor_id: string;
  session_id: string;
  user_id?: string | null;
  auth_state?: "anonymous" | "registered" | "authenticated";
  initial_page: string;
  last_page?: string;
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
}

export interface PageViewInput {
  page_view_id?: string;
  session_id: string;
  visitor_id: string;
  user_id?: string | null;
  path: string;
  title?: string | null;
  referrer?: string | null;
  entered_at?: string;
}

export interface PageViewFinalizeInput {
  page_view_id: string;
  session_id: string;
  visitor_id: string;
  exited_at?: string;
  duration_seconds: number;
  max_scroll_percent: number;
}

export interface VisitorFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "live" | "recent" | "offline";
  device?: string;
  authState?: string;
  sortBy?: "last_seen_at" | "started_at" | "page_count" | "total_duration_seconds" | "visit_count";
  sortOrder?: "asc" | "desc";
}

export class VisitorsRepository {
  /**
   * Create or update a visitor session.
   * Calculates visit count (new vs returning) idempotently based on previous sessions for this visitor_id.
   */
  async upsertSession(input: SessionUpsertInput): Promise<MongoVisitorSession> {
    const col = await getCollection<MongoVisitorSession>(COLLECTIONS.VISITOR_SESSIONS);
    const now = new Date().toISOString();

    if (!col) {
      return {
        id: input.session_id,
        session_id: input.session_id,
        visitor_id: input.visitor_id,
        user_id: input.user_id || null,
        auth_state: input.auth_state || "anonymous",
        first_seen_at: now,
        last_seen_at: now,
        started_at: now,
        ended_at: null,
        page_count: 1,
        total_duration_seconds: 0,
        initial_page: input.initial_page || "/",
        last_page: input.last_page || input.initial_page || "/",
        referrer: input.referrer || null,
        utm_source: input.utm_source || null,
        utm_medium: input.utm_medium || null,
        utm_campaign: input.utm_campaign || null,
        utm_term: input.utm_term || null,
        utm_content: input.utm_content || null,
        device_category: input.device_category || "desktop",
        browser: input.browser || null,
        os: input.os || null,
        screen_resolution: input.screen_resolution || null,
        visit_count: 1,
        is_active: true,
        created_at: now,
        updated_at: now,
      };
    }

    const existing = await col.findOne({ session_id: input.session_id });

    if (existing) {
      const updateDoc: Partial<MongoVisitorSession> = {
        last_seen_at: now,
        is_active: true,
        updated_at: now,
      };
      if (input.last_page) updateDoc.last_page = input.last_page;
      if (input.user_id) {
        updateDoc.user_id = input.user_id;
        updateDoc.auth_state = "authenticated";
      }

      await col.updateOne({ session_id: input.session_id }, { $set: updateDoc });
      const updated = await col.findOne({ session_id: input.session_id });
      return (updated ? { ...updated, _id: undefined } : existing) as MongoVisitorSession;
    }

    // Determine visit count for returning visitor
    const previousSessionsCount = await col.countDocuments({ visitor_id: input.visitor_id });
    const visitCount = previousSessionsCount + 1;

    // Find first_seen_at from earliest session if returning
    let firstSeenAt = now;
    if (previousSessionsCount > 0) {
      const earliest = await col.findOne({ visitor_id: input.visitor_id }, { sort: { first_seen_at: 1 } });
      if (earliest?.first_seen_at) firstSeenAt = earliest.first_seen_at;
    }

    const newDoc: MongoVisitorSession = {
      id: input.session_id,
      session_id: input.session_id,
      visitor_id: input.visitor_id,
      user_id: input.user_id || null,
      auth_state: input.user_id ? "authenticated" : (input.auth_state || "anonymous"),
      first_seen_at: firstSeenAt,
      last_seen_at: now,
      started_at: now,
      ended_at: null,
      page_count: 1,
      total_duration_seconds: 0,
      initial_page: input.initial_page || "/",
      last_page: input.last_page || input.initial_page || "/",
      referrer: input.referrer || null,
      utm_source: input.utm_source || null,
      utm_medium: input.utm_medium || null,
      utm_campaign: input.utm_campaign || null,
      utm_term: input.utm_term || null,
      utm_content: input.utm_content || null,
      device_category: input.device_category || "desktop",
      browser: input.browser || null,
      os: input.os || null,
      screen_resolution: input.screen_resolution || null,
      visit_count: visitCount,
      is_active: true,
      created_at: now,
      updated_at: now,
    };

    await col.updateOne({ session_id: input.session_id }, { $set: newDoc }, { upsert: true });
    return newDoc;
  }

  /**
   * Record entry of a page view.
   */
  async recordPageView(input: PageViewInput): Promise<MongoPageView> {
    const col = await getCollection<MongoPageView>(COLLECTIONS.PAGE_VIEWS);
    const sessionsCol = await getCollection<MongoVisitorSession>(COLLECTIONS.VISITOR_SESSIONS);
    const now = new Date().toISOString();
    const pageViewId = input.page_view_id || crypto.randomUUID();

    const doc: MongoPageView = {
      id: pageViewId,
      page_view_id: pageViewId,
      session_id: input.session_id,
      visitor_id: input.visitor_id,
      user_id: input.user_id || null,
      path: input.path || "/",
      title: input.title || null,
      referrer: input.referrer || null,
      entered_at: input.entered_at || now,
      exited_at: null,
      duration_seconds: 0,
      max_scroll_percent: 0,
      created_at: now,
      updated_at: now,
    };

    if (col) {
      await col.updateOne({ page_view_id: pageViewId }, { $set: doc }, { upsert: true });
    }

    if (sessionsCol) {
      await sessionsCol.updateOne(
        { session_id: input.session_id },
        {
          $set: { last_page: input.path, last_seen_at: now, is_active: true, updated_at: now },
          $inc: { page_count: 1 },
        },
      );
    }

    return doc;
  }

  /**
   * Finalize a page view upon exit / navigation.
   */
  async finalizePageView(input: PageViewFinalizeInput): Promise<void> {
    const col = await getCollection<MongoPageView>(COLLECTIONS.PAGE_VIEWS);
    const sessionsCol = await getCollection<MongoVisitorSession>(COLLECTIONS.VISITOR_SESSIONS);
    const now = new Date().toISOString();

    if (col) {
      await col.updateOne(
        { page_view_id: input.page_view_id },
        {
          $set: {
            exited_at: input.exited_at || now,
            duration_seconds: Math.max(0, Math.round(input.duration_seconds || 0)),
            max_scroll_percent: Math.min(100, Math.max(0, Math.round(input.max_scroll_percent || 0))),
            updated_at: now,
          },
        },
      );
    }

    if (sessionsCol) {
      await sessionsCol.updateOne(
        { session_id: input.session_id },
        {
          $inc: { total_duration_seconds: Math.max(0, Math.round(input.duration_seconds || 0)) },
          $set: { last_seen_at: now, updated_at: now },
        },
      );
    }
  }

  /**
   * Periodic active heartbeat from browser tab.
   */
  async heartbeat(visitorId: string, sessionId: string, lastPath?: string, scrollPercent?: number): Promise<void> {
    const sessionsCol = await getCollection<MongoVisitorSession>(COLLECTIONS.VISITOR_SESSIONS);
    const now = new Date().toISOString();

    if (sessionsCol) {
      const updateData: Record<string, any> = {
        last_seen_at: now,
        is_active: true,
        updated_at: now,
      };
      if (lastPath) updateData.last_page = lastPath;

      await sessionsCol.updateOne(
        { session_id: sessionId },
        {
          $set: updateData,
          $inc: { total_duration_seconds: 30 },
        },
      );
    }
  }

  /**
   * Get paginated visitor sessions for Admin Visitors view.
   */
  async getVisitorSessions(options: VisitorFilterOptions = {}): Promise<{
    sessions: MongoVisitorSession[];
    total: number;
    page: number;
    totalPages: number;
    activeCount: number;
  }> {
    const col = await getCollection<MongoVisitorSession>(COLLECTIONS.VISITOR_SESSIONS);
    if (!col) {
      return { sessions: [], total: 0, page: 1, totalPages: 1, activeCount: 0 };
    }

    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 25));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    // Filter by search string
    if (options.search?.trim()) {
      const searchRegex = new RegExp(options.search.trim(), "i");
      query.$or = [
        { visitor_id: searchRegex },
        { session_id: searchRegex },
        { last_page: searchRegex },
        { initial_page: searchRegex },
        { referrer: searchRegex },
        { utm_campaign: searchRegex },
        { browser: searchRegex },
        { os: searchRegex },
      ];
    }

    // Filter by status (Live = seen in last 3 mins, Recent = seen in last 24h)
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    if (options.status === "live") {
      query.last_seen_at = { $gte: threeMinutesAgo };
    } else if (options.status === "recent") {
      query.last_seen_at = { $gte: twentyFourHoursAgo, $lt: threeMinutesAgo };
    } else if (options.status === "offline") {
      query.last_seen_at = { $lt: twentyFourHoursAgo };
    }

    // Filter by device category
    if (options.device && options.device !== "all") {
      query.device_category = options.device;
    }

    // Filter by auth state
    if (options.authState && options.authState !== "all") {
      query.auth_state = options.authState;
    }

    const sortField = options.sortBy || "last_seen_at";
    const sortDir = options.sortOrder === "asc" ? 1 : -1;

    const [docs, total, activeCount] = await Promise.all([
      col.find(query).sort({ [sortField]: sortDir }).skip(skip).limit(limit).toArray(),
      col.countDocuments(query),
      col.countDocuments({ last_seen_at: { $gte: threeMinutesAgo } }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const sessions = docs.map(({ _id, ...rest }) => rest as MongoVisitorSession);

    return { sessions, total, page, totalPages, activeCount };
  }

  /**
   * Retrieve chronological journey of page views for a specific visitor or session.
   */
  async getVisitorJourney(visitorId?: string | null, sessionId?: string | null): Promise<MongoPageView[]> {
    const col = await getCollection<MongoPageView>(COLLECTIONS.PAGE_VIEWS);
    if (!col || (!visitorId && !sessionId)) return [];

    const query: Record<string, any> = {};
    if (sessionId) {
      query.session_id = sessionId;
    } else if (visitorId) {
      query.visitor_id = visitorId;
    }

    const docs = await col.find(query).sort({ entered_at: 1 }).limit(100).toArray();
    return docs.map(({ _id, ...rest }) => rest as MongoPageView);
  }

  /**
   * Aggregate high-level visitor intelligence stats for Overview & Leads dashboards.
   */
  async getVisitorStats(): Promise<{
    totalVisitorsToday: number;
    activeLiveVisitors: number;
    totalSessions: number;
    returningVisitorsCount: number;
    returningRatioPercent: number;
    avgDurationSeconds: number;
    totalPageViewsToday: number;
  }> {
    const sessionsCol = await getCollection<MongoVisitorSession>(COLLECTIONS.VISITOR_SESSIONS);
    const pageViewsCol = await getCollection<MongoPageView>(COLLECTIONS.PAGE_VIEWS);

    if (!sessionsCol) {
      return {
        totalVisitorsToday: 0,
        activeLiveVisitors: 0,
        totalSessions: 0,
        returningVisitorsCount: 0,
        returningRatioPercent: 0,
        avgDurationSeconds: 0,
        totalPageViewsToday: 0,
      };
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfDayIso = startOfDay.toISOString();
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();

    const [
      totalVisitorsToday,
      activeLiveVisitors,
      totalSessions,
      returningVisitorsCount,
      totalPageViewsToday,
      avgResult,
    ] = await Promise.all([
      sessionsCol.countDocuments({ started_at: { $gte: startOfDayIso } }),
      sessionsCol.countDocuments({ last_seen_at: { $gte: threeMinutesAgo } }),
      sessionsCol.countDocuments(),
      sessionsCol.countDocuments({ visit_count: { $gt: 1 } }),
      pageViewsCol ? pageViewsCol.countDocuments({ entered_at: { $gte: startOfDayIso } }) : 0,
      sessionsCol.aggregate([
        { $group: { _id: null, avgDuration: { $avg: "$total_duration_seconds" } } },
      ]).toArray(),
    ]);

    const returningRatioPercent =
      totalSessions > 0 ? Math.round((returningVisitorsCount / totalSessions) * 100) : 0;
    const avgDurationSeconds = Math.round(avgResult[0]?.avgDuration || 0);

    return {
      totalVisitorsToday,
      activeLiveVisitors,
      totalSessions,
      returningVisitorsCount,
      returningRatioPercent,
      avgDurationSeconds,
      totalPageViewsToday,
    };
  }
}

export const visitorsRepository = new VisitorsRepository();
