import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { logoutAdmin } from "@/services/adminAuth.service";
import { AdminBackdrop } from "../AdminBackdrop/AdminBackdrop";
import { AdminLogin } from "../AdminLogin/AdminLogin";
import { AdminShell, type AdminTab } from "../AdminShell/AdminShell";
import { AdminProfile } from "../AdminProfile/AdminProfile";
import { AdminTabSkeleton } from "../AdminTabSkeleton/AdminTabSkeleton";
import { AdminErrorBoundary } from "../AdminErrorBoundary/AdminErrorBoundary";

const AdminOverviewView = lazy(() =>
  import("../AdminOverview/AdminOverview").then((m) => ({ default: m.AdminOverview }))
);
const AdminAdmins = lazy(() =>
  import("../AdminAdmins/AdminAdmins").then((m) => ({ default: m.AdminAdmins }))
);
const AdminReviews = lazy(() =>
  import("../AdminReviews/AdminReviews").then((m) => ({ default: m.AdminReviews }))
);
const AdminServices = lazy(() =>
  import("../AdminServices/AdminServices").then((m) => ({ default: m.AdminServices }))
);
const AdminWork = lazy(() =>
  import("../AdminWork/AdminWork").then((m) => ({ default: m.AdminWork }))
);
const AdminCareers = lazy(() =>
  import("../AdminCareers/AdminCareers").then((m) => ({ default: m.AdminCareers }))
);
const AdminBlog = lazy(() =>
  import("../AdminBlog/AdminBlog").then((m) => ({ default: m.AdminBlog }))
);
const AdminEvents = lazy(() =>
  import("../AdminEvents/AdminEvents").then((m) => ({ default: m.AdminEvents }))
);
const AdminCampaigns = lazy(() =>
  import("../AdminCampaigns/AdminCampaigns").then((m) => ({ default: m.AdminCampaigns }))
);
const AdminReports = lazy(() =>
  import("../AdminReports/AdminReports").then((m) => ({ default: m.AdminReports }))
);
const AdminAnalytics = lazy(() =>
  import("../AdminAnalytics/AdminAnalytics").then((m) => ({ default: m.AdminAnalytics }))
);
const AdminLogs = lazy(() =>
  import("../AdminLogs/AdminLogs").then((m) => ({ default: m.AdminLogs }))
);
const AdminSettings = lazy(() =>
  import("../AdminSettings/AdminSettings").then((m) => ({ default: m.AdminSettings }))
);
const AdminLeads = lazy(() =>
  import("../AdminLeads/AdminLeads").then((m) => ({ default: m.AdminLeads }))
);
import { canAccessTab, getRoleMeta, type AdminRole } from "../../lib/rbac.shared";
import {
  getAdminOverview,
  type AdminOverview,
} from "../../server/admin.functions";
import {
  getAdminReviewsData,
  type AdminDashboardData,
} from "@/lib/reviews.functions";
import {
  getAdminEventsData,
} from "@/lib/events.functions";
import {
  getAdminServicesData,
} from "@/lib/services.functions";
import {
  getAdminWorkData,
} from "@/lib/work.functions";
import {
  getAdminCareersData,
} from "@/lib/careers.functions";
import {
  getAdminBlogData,
} from "@/lib/blog.functions";
import type { CompanyEvent, EventGalleryItem, EventCategoryItem } from "@/lib/events.shared";
import type { CompanyService, IndustrySector, ServiceCategoryItem } from "@/lib/services.shared";
import type { ProjectItem, WorkCategoryItem } from "@/lib/work.shared";
import type {
  JobOpening,
  JobApplicationItem,
  HiringProcessStep,
  CultureBenefit,
  CareersHeroConfig,
  CareersClosingCtaConfig,
} from "@/lib/careers.shared";
import type { BlogPostItem, BlogConfig, BlogCategoryItem } from "@/lib/blog.shared";
import type { ReviewSettings, ReviewStats } from "@/lib/reviews.shared";
import styles from "../styles/admin.module.css";

type Tab = AdminTab;

const DEFAULT_SETTINGS: ReviewSettings = {
  id: true,
  notify_on_submit: true,
  notify_on_approve: true,
  notify_on_reject: false,
  notify_on_report: true,
  notify_campaign_summary: true,
  notify_email: null,
};

const DEFAULT_STATS: ReviewStats = {
  total: 0,
  totalReviews: 0,
  average: 5,
  averageRating: 5,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  clientTotal: 0,
  clientAverage: 5,
  employeeTotal: 0,
  employeeAverage: 5,
  pendingCount: 0,
  approvedCount: 0,
  rejectedCount: 0,
  archivedCount: 0,
  reviewsThisMonth: 0,
  overallConversionRate: 0,
  openReportsCount: 0,
};

/** DIMISI admin panel — reviews, campaigns, moderation, analytics, leads, admins with RBAC enforcement. */
const DEFAULT_OVERVIEW: AdminOverview = {
  isAdmin: true,
  role: "super_admin",
  stats: { users: 1, leads: 0, leadsToday: 0, notifyOptIn: 0 },
  leads: [],
  admins: [],
  selfId: "",
};

const DEFAULT_REVIEWS: AdminDashboardData = {
  reviews: [],
  campaigns: [],
  reports: [],
  settings: DEFAULT_SETTINGS,
  stats: DEFAULT_STATS,
};

const VALID_ADMIN_TABS: AdminTab[] = [
  "overview",
  "services",
  "work",
  "careers",
  "blog",
  "events",
  "reviews",
  "campaigns",
  "reports",
  "analytics",
  "logs",
  "settings",
  "leads",
  "admins",
];

function resolveActiveTab(pathname: string, search?: unknown): { tab: AdminTab; isInvalid: boolean; invalidSlug?: string } {
  if (typeof pathname !== "string") return { tab: "overview", isInvalid: false };

  // 1. Check path segment: /dimisi-admin/services -> 'services'
  const pathParts = pathname.split("/").filter(Boolean);
  const adminIdx = pathParts.indexOf("dimisi-admin");
  if (adminIdx !== -1 && pathParts[adminIdx + 1]) {
    const candidate = pathParts[adminIdx + 1].toLowerCase();
    if (VALID_ADMIN_TABS.includes(candidate as AdminTab)) {
      return { tab: candidate as AdminTab, isInvalid: false };
    }
    return { tab: "overview", isInvalid: true, invalidSlug: pathParts[adminIdx + 1] };
  }

  // 2. Check query search param for backward compatibility: /dimisi-admin?tab=services
  if (search) {
    if (typeof search === "object" && search !== null && "tab" in search) {
      const urlTab = String((search as Record<string, unknown>).tab).toLowerCase() as AdminTab;
      if (VALID_ADMIN_TABS.includes(urlTab)) {
        return { tab: urlTab, isInvalid: false };
      }
    } else if (typeof search === "string") {
      try {
        const searchParams = new URLSearchParams(search);
        const urlTab = searchParams.get("tab")?.toLowerCase() as AdminTab;
        if (urlTab && VALID_ADMIN_TABS.includes(urlTab)) {
          return { tab: urlTab, isInvalid: false };
        }
      } catch {}
    }
  }

  return { tab: "overview", isInvalid: false };
}

export function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const load = getAdminOverview;
  const loadReviewsData = getAdminReviewsData;
  const loadEventsData = getAdminEventsData;
  const loadServicesData = getAdminServicesData;
  const loadWorkData = getAdminWorkData;
  const loadCareersData = getAdminCareersData;
  const loadBlogData = getAdminBlogData;

  // Single Source of Truth: Active tab derived directly from current URL route
  const { tab, isInvalid: isInvalidTab, invalidSlug } = resolveActiveTab(location.pathname, location.search);

  // Migrate legacy ?tab=query URLs to clean canonical URLs with history replacement
  useEffect(() => {
    if (location.search && typeof location.search === "object" && "tab" in location.search) {
      const queryTab = String((location.search as any).tab).toLowerCase();
      if (VALID_ADMIN_TABS.includes(queryTab as AdminTab)) {
        void navigate({ to: `/dimisi-admin/${queryTab}`, replace: true, search: {} });
      }
    }
  }, [location.search, navigate]);

  const [data, setData] = useState<AdminOverview | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("dimisi_admin_session");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.user) {
            const u = parsed.user;
            return {
              isAdmin: true,
              role: (u.role as AdminRole) || "admin",
              stats: { users: 1, leads: 0, leadsToday: 0, notifyOptIn: 0 },
              leads: [],
              admins: [
                {
                  user_id: u.id,
                  email: u.email || null,
                  full_name: u.name || u.user_metadata?.full_name || "Administrator",
                  designation: u.designation || u.user_metadata?.designation || "Administrator",
                  role: (u.role as AdminRole) || "admin",
                  is_active: u.isActive !== false,
                  created_at: new Date().toISOString(),
                },
              ],
              selfId: u.id,
            };
          }
        }
      } catch {}
    }
    return null;
  });

  const [reviewsData, setReviewsData] = useState<AdminDashboardData>(() => DEFAULT_REVIEWS);
  const [eventsData, setEventsData] = useState<{
    events: CompanyEvent[];
    gallery: EventGalleryItem[];
    categoryItems?: EventCategoryItem[];
    categoryCounts?: Record<string, number>;
  }>({
    events: [],
    gallery: [],
    categoryItems: [],
    categoryCounts: {},
  });
  const [servicesData, setServicesData] = useState<{
    services: CompanyService[];
    industries: IndustrySector[];
    categoryItems?: ServiceCategoryItem[];
    categoryCounts?: Record<string, number>;
  }>({
    services: [],
    industries: [],
    categoryItems: [],
    categoryCounts: {},
  });
  const [workData, setWorkData] = useState<{
    projects: ProjectItem[];
    categoryItems?: WorkCategoryItem[];
    categoryCounts?: Record<string, number>;
  }>({
    projects: [],
    categoryItems: [],
    categoryCounts: {},
  });
  const [careersData, setCareersData] = useState<{
    jobs: JobOpening[];
    applications?: JobApplicationItem[];
    hiring_steps: HiringProcessStep[];
    benefits: CultureBenefit[];
    hero: CareersHeroConfig;
    closing_cta: CareersClosingCtaConfig;
  }>({
    jobs: [],
    applications: [],
    hiring_steps: [],
    benefits: [],
    hero: {
      eyebrow: "Careers",
      heading: "Build the Future With Us",
      subline: "Join a curious, innovation-focused team where your work ships and your ideas matter.",
      cta_text: "Apply Now",
      cta_link: "#open-positions",
      illustration_caption: "Bhootdev Careers",
    },
    closing_cta: {
      heading: "Ready to Join Us?",
      subline: "Send us your details and tell us what you'd love to work on.",
      cta_text: "Apply Now",
      cta_link: "#open-positions",
    },
  });
  const [blogData, setBlogData] = useState<{
    posts: BlogPostItem[];
    config: BlogConfig;
    categories: string[];
    categoryItems?: BlogCategoryItem[];
  }>({
    posts: [],
    config: {
      hero_eyebrow: "Blog",
      hero_heading: "Ideas, Insights & Updates",
      hero_subline: "Thoughts on building software, shipping products, and the technology shaping tomorrow.",
      under_development_notice_active: true,
      under_development_notice_heading: "Publication Lab Under Active Development",
      under_development_notice_text: "Blog section under development. Please visit again after some time.",
    },
    categories: ["All Posts"],
    categoryItems: [],
  });
  const [error, setError] = useState<string | null>(null);

  const refreshReviews = useCallback(() => {
    loadReviewsData()
      .then((res) => setReviewsData(res))
      .catch((err) => console.warn("Failed to refresh reviews data", err));
  }, [loadReviewsData]);

  const refreshEvents = useCallback(async () => {
    try {
      if (import.meta.env?.DEV) {
        console.debug("[EVENTS DEBUG] REFRESH START (AdminPanel)");
      }
      const res = await loadEventsData();
      if (res) {
        if (import.meta.env?.DEV) {
          console.debug("[EVENTS DEBUG] PARENT STATE updated with:", {
            eventsCount: res.events?.length ?? 0,
            galleryCount: res.gallery?.length ?? 0,
          });
        }
        setEventsData(res);
      }
      return res;
    } catch (err) {
      console.warn("Failed to refresh events data", err);
      return null;
    }
  }, [loadEventsData]);

  const refreshServices = useCallback(() => {
    loadServicesData()
      .then((res) => setServicesData(res))
      .catch((err) => console.warn("Failed to refresh services data", err));
  }, [loadServicesData]);

  const refreshWork = useCallback(() => {
    loadWorkData()
      .then((res) => setWorkData(res))
      .catch((err) => console.warn("Failed to refresh work data", err));
  }, [loadWorkData]);

  const refreshCareers = useCallback(() => {
    loadCareersData()
      .then((res) => setCareersData(res))
      .catch((err) => console.warn("Failed to refresh careers data", err));
  }, [loadCareersData]);

  const refreshBlog = useCallback(() => {
    loadBlogData()
      .then((res) => setBlogData(res))
      .catch((err) => console.warn("Failed to refresh blog data", err));
  }, [loadBlogData]);

  const refreshOverview = useCallback(() => {
    load()
      .then((res) => setData(res))
      .catch((err) => console.warn("Failed to refresh overview data", err));
  }, [load]);

  const handleTabChange = useCallback(
    (newTab: Tab) => {
      const targetPath = `/dimisi-admin/${newTab}`;
      if (location.pathname !== targetPath) {
        void navigate({ to: targetPath });
      }

      // Fetch fresh data immediately for the selected tab
      if (newTab === "services") {
        refreshServices();
      } else if (newTab === "work") {
        refreshWork();
      } else if (newTab === "careers") {
        refreshCareers();
      } else if (newTab === "blog") {
        refreshBlog();
      } else if (newTab === "events") {
        refreshEvents();
      } else if (
        newTab === "reviews" ||
        newTab === "campaigns" ||
        newTab === "reports" ||
        newTab === "analytics"
      ) {
        refreshReviews();
      } else if (newTab === "overview" || newTab === "admins" || newTab === "leads") {
        refreshOverview();
      }
    },
    [navigate, location.pathname, refreshServices, refreshWork, refreshCareers, refreshBlog, refreshEvents, refreshReviews, refreshOverview],
  );

  useEffect(() => {
    if (!user) {
      setData(null);
      return;
    }
    let active = true;

    // 1. High priority: Fetch active tab first for instant interactive responsiveness
    const loadActiveTab = async () => {
      try {
        if (tab === "services") {
          const res = await loadServicesData();
          if (active) setServicesData(res);
        } else if (tab === "work") {
          const res = await loadWorkData();
          if (active) setWorkData(res);
        } else if (tab === "careers") {
          const res = await loadCareersData();
          if (active) setCareersData(res);
        } else if (tab === "blog") {
          const res = await loadBlogData();
          if (active) setBlogData(res);
        } else if (tab === "events") {
          const res = await loadEventsData();
          if (active) setEventsData(res);
        } else if (tab === "reviews" || tab === "campaigns" || tab === "reports" || tab === "analytics") {
          const res = await loadReviewsData();
          if (active) setReviewsData(res);
        } else {
          const [resOverview, resReviews] = await Promise.allSettled([load(), loadReviewsData()]);
          if (active) {
            if (resOverview.status === "fulfilled") setData(resOverview.value);
            if (resReviews.status === "fulfilled") setReviewsData(resReviews.value);
          }
        }
      } catch (err) {
        console.warn("Active tab data fetch warning:", err);
      }
    };

    // 2. Progressive background hydration for secondary modules
    const hydrateBackground = async () => {
      await loadActiveTab();
      if (!active) return;

      // Ensure overview core is loaded
      if (tab !== "overview") {
        Promise.allSettled([load(), loadReviewsData()]).then(([resOverview, resReviews]) => {
          if (active) {
            if (resOverview.status === "fulfilled") setData(resOverview.value);
            if (resReviews.status === "fulfilled") setReviewsData(resReviews.value);
          }
        });
      }

      // Background fetch remaining tabs (skip the currently active tab to avoid race conditions)
      Promise.allSettled([
        tab !== "events" ? loadEventsData() : Promise.resolve(null),
        tab !== "services" ? loadServicesData() : Promise.resolve(null),
        tab !== "work" ? loadWorkData() : Promise.resolve(null),
        tab !== "careers" ? loadCareersData() : Promise.resolve(null),
        tab !== "blog" ? loadBlogData() : Promise.resolve(null),
      ])
        .then(([resEvents, resServices, resWork, resCareers, resBlog]) => {
          if (active) {
            if (resEvents.status === "fulfilled" && resEvents.value) setEventsData(resEvents.value);
            if (resServices.status === "fulfilled" && resServices.value) setServicesData(resServices.value);
            if (resWork.status === "fulfilled" && resWork.value) setWorkData(resWork.value);
            if (resCareers.status === "fulfilled" && resCareers.value) setCareersData(resCareers.value);
            if (resBlog.status === "fulfilled" && resBlog.value) setBlogData(resBlog.value);
          }
        })
        .catch((err) => {
          console.warn("Admin panel background hydration warning:", err);
        });
    };

    hydrateBackground();

    return () => {
      active = false;
    };
  }, [user, tab]);

  async function signOut() {
    try {
      await logoutAdmin();
    } catch {}
    void navigate({ to: "/", replace: true });
  }

  if (loading) {
    return (
      <>
        <AdminBackdrop />
        <section className={styles.center}>
          <p className={styles.sub}>Checking your session…</p>
        </section>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <AdminBackdrop />
        <AdminLogin />
      </>
    );
  }

  if (error) {
    return (
      <>
        <AdminBackdrop />
        <section className={styles.center}>
          <div className={styles.card}>
            <p className={styles.error}>{error}</p>
            <div className={styles.row}>
              <button type="button" className={[styles.btn, styles.ghost].join(" ")} onClick={signOut}>
                Sign out
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (data && !data.isAdmin) {
    return (
      <>
        <AdminBackdrop />
        <section className={styles.center}>
          <div className={styles.card}>
            <p className={styles.kicker}>Access denied</p>
            <h1 className={styles.title}>Not an admin account</h1>
            <p className={styles.sub} style={{ marginBottom: "1.4rem" }}>
              Ask a DIMISI administrator to grant you admin access, or sign in with an admin account.
            </p>
            <button type="button" className={styles.btn} onClick={signOut}>
              Sign in as someone else
            </button>
          </div>
        </section>
      </>
    );
  }

  const currentData: AdminOverview = data ?? {
    isAdmin: true,
    role: user?.role || "super_admin",
    stats: { users: 1, leads: 0, leadsToday: 0, notifyOptIn: 0 },
    leads: [],
    admins: user
      ? [
          {
            user_id: user.id,
            email: user.email || null,
            full_name: user.name || user.user_metadata?.full_name || "Administrator",
            designation: user.designation || user.user_metadata?.designation || "Administrator",
            role: user.role || "super_admin",
            is_active: user.isActive !== false,
            created_at: new Date().toISOString(),
          },
        ]
      : [],
    selfId: user?.id || "",
  };

  const userRole = currentData.role ?? "admin";
  const roleMeta = getRoleMeta(userRole);
  const self = (currentData.admins || []).find((a) => a.user_id === currentData.selfId);

  // Check if current tab is permitted for user's role
  const isTabPermitted = canAccessTab(userRole, tab);

  return (
    <>
      <AdminBackdrop />
      <AdminShell
        tab={tab}
        onTab={handleTabChange}
        onSignOut={signOut}
        userRole={userRole}
        pendingReviewsCount={reviewsData.stats.pendingCount}
        openReportsCount={reviewsData.stats.openReportsCount}
        profile={
          <AdminProfile
            userId={currentData.selfId}
            employeeId={
              self?.employee_id ||
              self?.emp_id ||
              (self as any)?.empId ||
              (user as any)?.user_metadata?.employee_id ||
              (user as any)?.user_metadata?.emp_id ||
              (user as any)?.empId
            }
            email={user.email}
            fullName={self?.full_name ?? null}
            designation={self?.designation ?? null}
            role={userRole}
            memberSince={self?.created_at}
          />
        }
      >
        {/* 404 / SECTION NOT FOUND GUARD */}
        {isInvalidTab ? (
          <div className={styles.card} style={{ margin: "2rem auto", maxWidth: "560px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", padding: "12px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.14)", color: "#ef4444", marginBottom: "1rem" }}>
              <ShieldAlert size={36} />
            </div>
            <p className={styles.kicker}>Section Not Found</p>
            <h2 className={styles.title}>404 — Section Not Found</h2>
            <p className={styles.sub} style={{ marginBottom: "1.25rem", lineHeight: "1.5" }}>
              The admin section <code>"{invalidSlug}"</code> does not exist or has been moved.
            </p>
            <button
              type="button"
              className={styles.btn}
              onClick={() => handleTabChange("overview")}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", margin: "0 auto" }}
            >
              <ArrowLeft size={16} />
              <span>Return to Overview</span>
            </button>
          </div>
        ) : !isTabPermitted ? (
          <div className={styles.card} style={{ margin: "2rem auto", maxWidth: "560px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", padding: "12px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.14)", color: "#ef4444", marginBottom: "1rem" }}>
              <ShieldAlert size={36} />
            </div>
            <p className={styles.kicker}>Access Restricted</p>
            <h2 className={styles.title}>Permission Required</h2>
            <p className={styles.sub} style={{ marginBottom: "1.25rem", lineHeight: "1.5" }}>
              Your current assigned role (<strong style={{ color: roleMeta.color }}>{roleMeta.label}</strong>) does not have access permissions for the <strong>{tab}</strong> section.
            </p>
            <button
              type="button"
              className={styles.btn}
              onClick={() => handleTabChange("overview")}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", margin: "0 auto" }}
            >
              <ArrowLeft size={16} />
              <span>Return to Overview</span>
            </button>
          </div>
        ) : (
          <AdminErrorBoundary tab={tab} onResetTab={() => handleTabChange("overview")}>
            <Suspense fallback={<AdminTabSkeleton tab={tab} />}>
              {/* OVERVIEW TAB */}
              {tab === "overview" && (
                <AdminOverviewView
                  overviewData={currentData}
                  reviewsData={reviewsData}
                  servicesData={servicesData}
                  workData={workData}
                  careersData={careersData}
                  blogData={blogData}
                  eventsData={eventsData}
                  currentUser={{
                    id: currentData.selfId,
                    email: user.email,
                    fullName: self?.full_name ?? null,
                    designation: self?.designation ?? null,
                    role: userRole,
                  }}
                  onTab={handleTabChange}
                  onRefreshReviews={refreshReviews}
                />
              )}

              {/* SERVICES & SECTORS MANAGEMENT TAB */}
              {tab === "services" && (
                <AdminServices
                  services={servicesData.services || []}
                  industries={servicesData.industries || []}
                  categoryItems={servicesData.categoryItems || []}
                  categoryCounts={servicesData.categoryCounts || {}}
                  onRefresh={refreshServices}
                />
              )}

              {/* OUR WORK & PRODUCTS CASE STUDIES TAB */}
              {tab === "work" && (
                <AdminWork
                  projects={workData.projects || []}
                  categoryItems={workData.categoryItems || []}
                  categoryCounts={workData.categoryCounts || {}}
                  onRefresh={refreshWork}
                />
              )}

              {/* CAREERS & RECRUITMENT MANAGEMENT TAB */}
              {tab === "careers" && (
                <AdminCareers
                  jobs={careersData.jobs || []}
                  applications={careersData.applications || []}
                  hiringSteps={careersData.hiring_steps || []}
                  benefits={careersData.benefits || []}
                  hero={careersData.hero}
                  closingCta={careersData.closing_cta}
                  onRefresh={refreshCareers}
                />
              )}

              {/* BLOG & JOURNAL EDITORIAL TAB */}
              {tab === "blog" && (
                <AdminBlog
                  posts={blogData.posts || []}
                  config={blogData.config}
                  categories={blogData.categories || []}
                  categoryItems={blogData.categoryItems || []}
                  onRefresh={refreshBlog}
                />
              )}

              {/* EVENTS & GALLERY MANAGEMENT TAB */}
              {tab === "events" && (
                <AdminEvents
                  events={eventsData.events || []}
                  gallery={eventsData.gallery || []}
                  categoryItems={eventsData.categoryItems || []}
                  categoryCounts={eventsData.categoryCounts || {}}
                  onRefresh={refreshEvents}
                />
              )}

              {/* REVIEWS MANAGEMENT TAB */}
              {tab === "reviews" && (
                <AdminReviews reviews={reviewsData.reviews || []} onRefresh={refreshReviews} />
              )}

              {/* CAMPAIGNS & QR CODE TAB */}
              {tab === "campaigns" && (
                <AdminCampaigns campaigns={reviewsData.campaigns || []} onRefresh={refreshReviews} />
              )}

              {/* MODERATION QUEUE / REPORTS TAB */}
              {tab === "reports" && (
                <AdminReports reports={reviewsData.reports || []} onRefresh={refreshReviews} />
              )}

              {/* ANALYTICS TAB */}
              {tab === "analytics" && (
                <AdminAnalytics data={reviewsData} />
              )}

              {/* ADMIN LOGS TAB */}
              {tab === "logs" && (
                <AdminLogs currentUserRole={userRole} />
              )}

              {/* SETTINGS TAB */}
              {tab === "settings" && (
                <AdminSettings settings={reviewsData.settings || DEFAULT_SETTINGS} onRefresh={refreshReviews} />
              )}

              {/* LEADS & VISITOR INTELLIGENCE TAB */}
              {tab === "leads" && (
                <AdminLeads
                  initialLeads={(currentData.leads || []) as any}
                  currentUserRole={userRole}
                  onRefreshOverview={refreshOverview}
                />
              )}

              {/* ADMINS TAB */}
              {tab === "admins" && (
                <AdminAdmins
                  admins={currentData.admins || []}
                  selfId={currentData.selfId || ""}
                  currentUserRole={userRole}
                  onAdmins={(next) =>
                    setData((prev) => (prev ? { ...prev, admins: next } : { ...currentData, admins: next }))
                  }
                />
              )}
            </Suspense>
          </AdminErrorBoundary>
        )}
      </AdminShell>
    </>
  );
}
