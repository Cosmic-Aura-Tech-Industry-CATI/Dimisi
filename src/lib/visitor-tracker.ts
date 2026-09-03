import {
  recordVisitorSessionFn,
  recordPageViewFn,
  finalizePageViewFn,
  heartbeatVisitorFn,
} from "@/lib/visitors.functions";

export interface VisitorContext {
  visitorId: string;
  sessionId: string;
  deviceCategory: "desktop" | "mobile" | "tablet" | "unknown";
  browser: string;
  os: string;
  screenResolution: string;
  referrer: string | null;
  utm: {
    source?: string | null;
    medium?: string | null;
    campaign?: string | null;
    term?: string | null;
    content?: string | null;
  };
}

const VISITOR_ID_KEY = "dimisi_visitor_id";
const SESSION_ID_KEY = "dimisi_session_id";
const SESSION_TIME_KEY = "dimisi_session_last_active";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity timeout

/**
 * Generate a cryptographically random, non-sensitive identifier.
 */
function generateRandomId(prefix: string): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  }
  return `${prefix}_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
}

/**
 * Get or create the anonymous persistent visitor ID.
 */
export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "vid_server";
  try {
    let vid = localStorage.getItem(VISITOR_ID_KEY);
    if (!vid || !vid.startsWith("vid_")) {
      vid = generateRandomId("vid");
      localStorage.setItem(VISITOR_ID_KEY, vid);
    }
    return vid;
  } catch {
    return generateRandomId("vid");
  }
}

/**
 * Get or create the visitor session ID (expires after 30 mins of inactivity).
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "sid_server";
  try {
    const now = Date.now();
    const lastActive = parseInt(sessionStorage.getItem(SESSION_TIME_KEY) || "0", 10);
    let sid = sessionStorage.getItem(SESSION_ID_KEY);

    if (!sid || !sid.startsWith("sid_") || now - lastActive > SESSION_TIMEOUT_MS) {
      sid = generateRandomId("sid");
      sessionStorage.setItem(SESSION_ID_KEY, sid);
    }
    sessionStorage.setItem(SESSION_TIME_KEY, now.toString());
    return sid;
  } catch {
    return generateRandomId("sid");
  }
}

/**
 * Detect client device category without fingerprinting.
 */
export function detectDeviceCategory(): "desktop" | "mobile" | "tablet" | "unknown" {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  const width = window.innerWidth || 1024;

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua) || (width >= 768 && width <= 1024)) {
    return "tablet";
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer/i.test(ua) || width < 768) {
    return "mobile";
  }
  return "desktop";
}

/**
 * Detect browser category.
 */
export function detectBrowser(): string {
  if (typeof window === "undefined") return "Unknown";
  const ua = navigator.userAgent || "";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/") && !ua.includes("Edg/")) return "Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
  if (ua.includes("OPR/") || ua.includes("Opera/")) return "Opera";
  return "Browser";
}

/**
 * Detect operating system.
 */
export function detectOS(): string {
  if (typeof window === "undefined") return "Unknown";
  const ua = navigator.userAgent || "";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac OS X/i.test(ua)) return "macOS";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "OS";
}

/**
 * Parse UTM query parameters safely.
 */
export function parseUtmParams(): VisitorContext["utm"] {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      source: params.get("utm_source"),
      medium: params.get("utm_medium"),
      campaign: params.get("utm_campaign"),
      term: params.get("utm_term"),
      content: params.get("utm_content"),
    };
  } catch {
    return {};
  }
}

/**
 * Get comprehensive visitor context.
 */
export function getVisitorContext(): VisitorContext {
  return {
    visitorId: getOrCreateVisitorId(),
    sessionId: getOrCreateSessionId(),
    deviceCategory: detectDeviceCategory(),
    browser: detectBrowser(),
    os: detectOS(),
    screenResolution: typeof window !== "undefined" ? `${window.screen?.width || 0}x${window.screen?.height || 0}` : "1920x1080",
    referrer: typeof document !== "undefined" && document.referrer ? document.referrer : null,
    utm: parseUtmParams(),
  };
}

/**
 * Client-Side Page View Lifecycle Manager
 */
class VisitorLifecycleManager {
  private currentPageViewId: string | null = null;
  private currentPath: string | null = null;
  private pageEnteredAt: number = 0;
  private maxScrollPercent: number = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private scrollListenerAttached: boolean = false;
  private sessionInitialized: boolean = false;

  public init() {
    if (typeof window === "undefined") return;

    // Initialize visitor session once per browser session
    this.ensureSessionInitialized();

    // Attach scroll tracking
    this.attachScrollTracking();

    // Attach visibility change and page exit handlers
    this.attachExitHandlers();

    // Start heartbeat
    this.startHeartbeat();
  }

  private async ensureSessionInitialized() {
    if (this.sessionInitialized || typeof window === "undefined") return;
    this.sessionInitialized = true;

    try {
      const ctx = getVisitorContext();
      await recordVisitorSessionFn({
        data: {
          visitor_id: ctx.visitorId,
          session_id: ctx.sessionId,
          initial_page: window.location.pathname || "/",
          last_page: window.location.pathname || "/",
          referrer: ctx.referrer,
          utm_source: ctx.utm.source,
          utm_medium: ctx.utm.medium,
          utm_campaign: ctx.utm.campaign,
          utm_term: ctx.utm.term,
          utm_content: ctx.utm.content,
          device_category: ctx.deviceCategory,
          browser: ctx.browser,
          os: ctx.os,
          screen_resolution: ctx.screenResolution,
        },
      });
    } catch (err) {
      console.debug("[tracker] session init note:", err);
    }
  }

  public async onNavigate(newPath: string) {
    if (typeof window === "undefined") return;

    // Finalize previous page view if active
    if (this.currentPageViewId && this.currentPath) {
      await this.finalizeCurrentPage();
    }

    // Start new page view
    this.currentPath = newPath;
    this.currentPageViewId = generateRandomId("pv");
    this.pageEnteredAt = Date.now();
    this.maxScrollPercent = 0;

    // Refresh session activity timestamp
    getOrCreateSessionId();

    try {
      const ctx = getVisitorContext();
      await recordPageViewFn({
        data: {
          page_view_id: this.currentPageViewId,
          session_id: ctx.sessionId,
          visitor_id: ctx.visitorId,
          path: newPath,
          title: typeof document !== "undefined" ? document.title : newPath,
          referrer: ctx.referrer,
          entered_at: new Date(this.pageEnteredAt).toISOString(),
        },
      });
    } catch (err) {
      console.debug("[tracker] page enter note:", err);
    }
  }

  private async finalizeCurrentPage() {
    if (!this.currentPageViewId || !this.pageEnteredAt) return;

    const durationSeconds = Math.max(1, Math.round((Date.now() - this.pageEnteredAt) / 1000));
    const pageViewId = this.currentPageViewId;
    const ctx = getVisitorContext();
    const maxScroll = this.maxScrollPercent;

    this.currentPageViewId = null;
    this.pageEnteredAt = 0;

    try {
      await finalizePageViewFn({
        data: {
          page_view_id: pageViewId,
          session_id: ctx.sessionId,
          visitor_id: ctx.visitorId,
          duration_seconds: durationSeconds,
          max_scroll_percent: maxScroll,
          exited_at: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.debug("[tracker] page exit note:", err);
    }
  }

  private attachScrollTracking() {
    if (this.scrollListenerAttached || typeof window === "undefined") return;
    this.scrollListenerAttached = true;

    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0) {
              const scrolled = window.scrollY;
              const percent = Math.min(100, Math.round((scrolled / docHeight) * 100));

              // Quantize into milestones: 0%, 25%, 50%, 75%, 90%, 100%
              let milestone = 0;
              if (percent >= 98) milestone = 100;
              else if (percent >= 85) milestone = 90;
              else if (percent >= 70) milestone = 75;
              else if (percent >= 45) milestone = 50;
              else if (percent >= 20) milestone = 25;

              if (milestone > this.maxScrollPercent) {
                this.maxScrollPercent = milestone;
              }
            }
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true },
    );
  }

  private attachExitHandlers() {
    if (typeof window === "undefined") return;

    // Visibility change / Pagehide
    const handleExit = () => {
      if (document.visibilityState === "hidden") {
        void this.finalizeCurrentPage();
      }
    };

    document.addEventListener("visibilitychange", handleExit);
    window.addEventListener("pagehide", handleExit);
  }

  private startHeartbeat() {
    if (this.heartbeatTimer || typeof window === "undefined") return;

    this.heartbeatTimer = setInterval(async () => {
      if (document.visibilityState === "visible" && this.currentPath) {
        try {
          const ctx = getVisitorContext();
          await heartbeatVisitorFn({
            data: {
              visitor_id: ctx.visitorId,
              session_id: ctx.sessionId,
              path: this.currentPath || "/",
              scroll_percent: this.maxScrollPercent,
            },
          });
        } catch {
          // Silent fallback
        }
      }
    }, 45000); // 45 seconds interval
  }

  public destroy() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

export const visitorTracker = new VisitorLifecycleManager();
