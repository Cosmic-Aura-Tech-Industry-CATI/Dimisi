import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AdminBackdrop } from "../AdminBackdrop/AdminBackdrop";
import { AdminLogin } from "../AdminLogin/AdminLogin";
import { AdminShell, type AdminTab } from "../AdminShell/AdminShell";
import { AdminProfile } from "../AdminProfile/AdminProfile";
import { AdminOverview as AdminOverviewView } from "../AdminOverview/AdminOverview";
import { AdminAdmins } from "../AdminAdmins/AdminAdmins";
import { AdminReviews } from "../AdminReviews/AdminReviews";
import { AdminServices } from "../AdminServices/AdminServices";
import { AdminWork } from "../AdminWork/AdminWork";
import { AdminCareers } from "../AdminCareers/AdminCareers";
import { AdminBlog } from "../AdminBlog/AdminBlog";
import { AdminEvents } from "../AdminEvents/AdminEvents";
import { AdminCampaigns } from "../AdminCampaigns/AdminCampaigns";
import { AdminReports } from "../AdminReports/AdminReports";
import { AdminAnalytics } from "../AdminAnalytics/AdminAnalytics";
import { AdminSettings } from "../AdminSettings/AdminSettings";
import { canAccessTab, getRoleMeta, type AdminRole } from "../../lib/rbac.shared";
import {
  getAdminOverview,
  updateAdminProfile,
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
import type { CompanyEvent, EventGalleryItem } from "@/lib/events.shared";
import type { CompanyService, IndustrySector } from "@/lib/services.shared";
import type { ProjectItem } from "@/lib/work.shared";
import type {
  JobOpening,
  HiringProcessStep,
  CultureBenefit,
  CareersHeroConfig,
  CareersClosingCtaConfig,
} from "@/lib/careers.shared";
import type { BlogPostItem, BlogConfig } from "@/lib/blog.shared";
import styles from "../styles/admin.module.css";

type Tab = AdminTab;

/** DIMISI admin panel — reviews, campaigns, moderation, analytics, leads, admins with RBAC enforcement. */
export function AdminPanel() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const load = useServerFn(getAdminOverview);
  const loadReviewsData = useServerFn(getAdminReviewsData);
  const loadEventsData = useServerFn(getAdminEventsData);
  const loadServicesData = useServerFn(getAdminServicesData);
  const loadWorkData = useServerFn(getAdminWorkData);
  const loadCareersData = useServerFn(getAdminCareersData);
  const loadBlogData = useServerFn(getAdminBlogData);
  const saveProfile = useServerFn(updateAdminProfile);

  const [data, setData] = useState<AdminOverview | null>(null);
  const [reviewsData, setReviewsData] = useState<AdminDashboardData | null>(null);
  const [eventsData, setEventsData] = useState<{ events: CompanyEvent[]; gallery: EventGalleryItem[] }>({
    events: [],
    gallery: [],
  });
  const [servicesData, setServicesData] = useState<{ services: CompanyService[]; industries: IndustrySector[] }>({
    services: [],
    industries: [],
  });
  const [workData, setWorkData] = useState<{ projects: ProjectItem[] }>({
    projects: [],
  });
  const [careersData, setCareersData] = useState<{
    jobs: JobOpening[];
    hiring_steps: HiringProcessStep[];
    benefits: CultureBenefit[];
    hero: CareersHeroConfig;
    closing_cta: CareersClosingCtaConfig;
  }>({
    jobs: [],
    hiring_steps: [],
    benefits: [],
    hero: {
      eyebrow: "Careers",
      heading: "Build the Future With Us",
      subline: "Join a curious, innovation-focused team where your work ships and your ideas matter.",
      cta_text: "Apply Now",
      cta_link: "https://www.thekalesh.com/careers",
      illustration_caption: "Bhootdev Careers",
    },
    closing_cta: {
      heading: "Ready to Join Us?",
      subline: "Send us your details and tell us what you'd love to work on.",
      cta_text: "Apply Now",
      cta_link: "https://www.thekalesh.com/careers",
    },
  });
  const [blogData, setBlogData] = useState<{
    posts: BlogPostItem[];
    config: BlogConfig;
    categories: string[];
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
    categories: ["All Posts", "Web", "Mobile", "AI", "Cloud", "Startups", "Technology Trends"],
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  const refreshReviews = useCallback(() => {
    loadReviewsData()
      .then((res) => setReviewsData(res))
      .catch((err) => console.warn("Failed to refresh reviews data", err));
  }, [loadReviewsData]);

  const refreshEvents = useCallback(() => {
    loadEventsData()
      .then((res) => setEventsData(res))
      .catch((err) => console.warn("Failed to refresh events data", err));
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

  useEffect(() => {
    if (!user) {
      setData(null);
      setReviewsData(null);
      return;
    }
    let active = true;
    setBusy(true);
    setError(null);

    Promise.all([
      load(),
      loadReviewsData(),
      loadEventsData(),
      loadServicesData(),
      loadWorkData(),
      loadCareersData(),
      loadBlogData(),
    ])
      .then(([resOverview, resReviews, resEvents, resServices, resWork, resCareers, resBlog]) => {
        if (active) {
          setData(resOverview);
          setReviewsData(resReviews);
          setEventsData(resEvents);
          setServicesData(resServices);
          setWorkData(resWork);
          setCareersData(resCareers);
          setBlogData(resBlog);
        }
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load admin data.");
      })
      .finally(() => {
        if (active) setBusy(false);
      });

    return () => {
      active = false;
    };
  }, [
    user,
    load,
    loadReviewsData,
    loadEventsData,
    loadServicesData,
    loadWorkData,
    loadCareersData,
    loadBlogData,
  ]);

  async function signOut() {
    try {
      localStorage.removeItem("dimisi_admin_session");
      window.dispatchEvent(new Event("dimisi-auth-change"));
    } catch {}
    try {
      await supabase.auth.signOut();
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

  if (busy && (!data || !reviewsData)) {
    return (
      <>
        <AdminBackdrop />
        <section className={styles.center}>
          <p className={styles.sub}>Loading admin control room…</p>
        </section>
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

  if (!data || !reviewsData) {
    return (
      <>
        <AdminBackdrop />
        <section className={styles.center}>
          <p className={styles.sub}>Loading admin control room…</p>
        </section>
      </>
    );
  }

  const userRole = data.role ?? "admin";
  const roleMeta = getRoleMeta(userRole);
  const self = data.admins.find((a) => a.user_id === data.selfId);

  // Check if current tab is permitted for user's role
  const isTabPermitted = canAccessTab(userRole, tab);

  return (
    <>
      <AdminBackdrop />
      <AdminShell
        tab={tab}
        onTab={setTab}
        onSignOut={signOut}
        userRole={userRole}
        pendingReviewsCount={reviewsData.stats.pendingCount}
        openReportsCount={reviewsData.stats.openReportsCount}
        profile={
          <AdminProfile
            userId={data.selfId}
            email={user.email}
            fullName={self?.full_name ?? null}
            designation={self?.designation ?? null}
            role={userRole}
            memberSince={self?.created_at}
            onSave={async ({ fullName, designation }) => {
              const res = await saveProfile({
                data: { userId: data.selfId, fullName, designation },
              });
              setData((prev) => (prev ? { ...prev, admins: res.admins } : prev));
              return res.message;
            }}
          />
        }
      >
        {/* ACCESS DENIED PAGE-LEVEL GUARD */}
        {!isTabPermitted ? (
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
              onClick={() => setTab("overview")}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", margin: "0 auto" }}
            >
              <ArrowLeft size={16} />
              <span>Return to Overview</span>
            </button>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {tab === "overview" && (
              <AdminOverviewView
                overviewData={data}
                reviewsData={reviewsData}
                servicesData={servicesData}
                workData={workData}
                careersData={careersData}
                blogData={blogData}
                eventsData={eventsData}
                currentUser={{
                  id: data.selfId,
                  email: user.email,
                  fullName: self?.full_name ?? null,
                  designation: self?.designation ?? null,
                  role: userRole,
                }}
                onTab={setTab}
                onRefreshReviews={refreshReviews}
              />
            )}

            {/* SERVICES & SECTORS MANAGEMENT TAB */}
            {tab === "services" && (
              <AdminServices
                services={servicesData.services}
                industries={servicesData.industries}
                onRefresh={refreshServices}
              />
            )}

            {/* OUR WORK & PRODUCTS CASE STUDIES TAB */}
            {tab === "work" && (
              <AdminWork
                projects={workData.projects}
                onRefresh={refreshWork}
              />
            )}

            {/* CAREERS & RECRUITMENT MANAGEMENT TAB */}
            {tab === "careers" && (
              <AdminCareers
                jobs={careersData.jobs}
                hiringSteps={careersData.hiring_steps}
                benefits={careersData.benefits}
                hero={careersData.hero}
                closingCta={careersData.closing_cta}
                onRefresh={refreshCareers}
              />
            )}

            {/* BLOG & JOURNAL EDITORIAL TAB */}
            {tab === "blog" && (
              <AdminBlog
                posts={blogData.posts}
                config={blogData.config}
                categories={blogData.categories}
                onRefresh={refreshBlog}
              />
            )}

            {/* EVENTS & GALLERY MANAGEMENT TAB */}
            {tab === "events" && (
              <AdminEvents
                events={eventsData.events}
                gallery={eventsData.gallery}
                onRefresh={refreshEvents}
              />
            )}

            {/* REVIEWS MANAGEMENT TAB */}
            {tab === "reviews" && (
              <AdminReviews reviews={reviewsData.reviews} onRefresh={refreshReviews} />
            )}

            {/* CAMPAIGNS & QR CODE TAB */}
            {tab === "campaigns" && (
              <AdminCampaigns campaigns={reviewsData.campaigns} onRefresh={refreshReviews} />
            )}

            {/* MODERATION QUEUE / REPORTS TAB */}
            {tab === "reports" && (
              <AdminReports reports={reviewsData.reports} onRefresh={refreshReviews} />
            )}

            {/* ANALYTICS TAB */}
            {tab === "analytics" && (
              <AdminAnalytics data={reviewsData} />
            )}

            {/* SETTINGS TAB */}
            {tab === "settings" && (
              <AdminSettings settings={reviewsData.settings} onRefresh={refreshReviews} />
            )}

            {/* LEADS TAB */}
            {tab === "leads" && (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Name</th>
                      <th>Source</th>
                      <th>Page</th>
                      <th>Message</th>
                      <th>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.leads.length === 0 ? (
                      <tr>
                        <td colSpan={6}>No leads yet.</td>
                      </tr>
                    ) : (
                      data.leads.map((lead) => (
                        <tr key={lead.id}>
                          <td>{lead.email}</td>
                          <td>{lead.full_name ?? "—"}</td>
                          <td>{lead.source}</td>
                          <td>{lead.page ?? "—"}</td>
                          <td>{lead.message ?? "—"}</td>
                          <td>{new Date(lead.created_at).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ADMINS TAB */}
            {tab === "admins" && (
              <AdminAdmins
                admins={data.admins}
                selfId={data.selfId}
                currentUserRole={userRole}
                onAdmins={(next) => setData((prev) => (prev ? { ...prev, admins: next } : prev))}
              />
            )}
          </>
        )}
      </AdminShell>
    </>
  );
}
