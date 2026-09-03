import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Layers,
  FolderGit2,
  Briefcase,
  BookOpen,
  Calendar,
  Star,
  QrCode,
  Flag,
  TrendingUp,
  Users,
  ShieldCheck,
  ExternalLink,
  Plus,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  FileText,
  Clock,
  Eye,
} from "lucide-react";
import { type AdminTab } from "../AdminSidebar/AdminSidebar";
import { type AdminRole, getRoleMeta } from "../../lib/rbac.shared";
import { AdminReviews } from "../AdminReviews/AdminReviews";
import type { AdminOverview as AdminOverviewType } from "../../server/admin.functions";
import type { AdminDashboardData } from "@/lib/reviews.functions";
import type { CompanyService, IndustrySector } from "@/lib/services.shared";
import type { ProjectItem } from "@/lib/work.shared";
import type { JobOpening, HiringProcessStep, CultureBenefit } from "@/lib/careers.shared";
import type { BlogPostItem, BlogConfig } from "@/lib/blog.shared";
import type { CompanyEvent, EventGalleryItem } from "@/lib/events.shared";
import styles from "./AdminOverview.module.css";

interface AdminOverviewProps {
  overviewData: AdminOverviewType;
  reviewsData: AdminDashboardData;
  servicesData: { services: CompanyService[]; industries: IndustrySector[] };
  workData: { projects: ProjectItem[] };
  careersData: { jobs: JobOpening[]; hiring_steps: HiringProcessStep[]; benefits: CultureBenefit[] };
  blogData: { posts: BlogPostItem[]; config: BlogConfig; categories: string[] };
  eventsData: { events: CompanyEvent[]; gallery: EventGalleryItem[] };
  currentUser: {
    id: string;
    email: string | null | undefined;
    fullName: string | null | undefined;
    designation: string | null | undefined;
    role: AdminRole;
  };
  onTab: (tab: AdminTab) => void;
  onRefreshReviews: () => void;
}

export function AdminOverview({
  overviewData,
  reviewsData,
  servicesData,
  workData,
  careersData,
  blogData,
  eventsData,
  currentUser,
  onTab,
  onRefreshReviews,
}: AdminOverviewProps) {
  const roleMeta = getRoleMeta(currentUser.role);

  // Time of day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const displayName = currentUser.fullName || currentUser.email?.split("@")[0] || "Administrator";

  // Pending moderation checks
  const pendingReviews = reviewsData.reviews.filter((r) => r.status === "pending");
  const openReportsCount = reviewsData.stats.openReportsCount;

  // Active admin roles breakdown
  const superAdminCount = overviewData.admins.filter((a) => a.role === "super_admin").length;
  const adminCount = overviewData.admins.filter((a) => a.role === "admin" || !a.role).length;

  return (
    <div className={styles.wrap}>
      {/* 1. Executive Banner */}
      <section className={styles.banner}>
        <div className={styles.bannerInfo}>
          <div className={styles.bannerKicker}>
            <span className={styles.statusLed} />
            <span>Live Control Center • All Systems Operational</span>
          </div>
          <h1 className={styles.bannerTitle}>
            {greeting}, {displayName}
          </h1>
          <div className={styles.bannerMeta}>
            <span
              className={styles.roleBadge}
              style={{
                color: roleMeta.color,
                background: roleMeta.bg,
                border: `1px solid ${roleMeta.border}`,
              }}
            >
              {roleMeta.label}
            </span>
            <span className={styles.designationText}>{currentUser.designation || "DIMISI Core"}</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>•</span>
            <span className={styles.designationText}>
              {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>

        <div className={styles.quickActions}>
          <button
            type="button"
            className={[styles.actionBtn, styles.actionBtnPrimary].join(" ")}
            onClick={() => onTab("services")}
          >
            <Plus size={15} />
            <span>New Service</span>
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => onTab("work")}
          >
            <Plus size={15} />
            <span>Add Case Study</span>
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => onTab("blog")}
          >
            <Plus size={15} />
            <span>Write Article</span>
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => onTab("careers")}
          >
            <Plus size={15} />
            <span>Post Job</span>
          </button>
          <Link
            to="/"
            target="_blank"
            className={styles.actionBtn}
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <ExternalLink size={14} />
            <span>View Site</span>
          </Link>
        </div>
      </section>

      {/* 2. Urgent Attention Bar (If pending reviews or open reports exist) */}
      {pendingReviews.length > 0 || openReportsCount > 0 ? (
        <section className={styles.alertCard}>
          <div className={styles.alertContent}>
            <div className={styles.alertIcon}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className={styles.alertTitle}>
                Action Required: {pendingReviews.length} Pending Review{pendingReviews.length > 1 ? "s" : ""}{openReportsCount > 0 ? ` & ${openReportsCount} Moderation Flag` : ""}
              </h3>
              <p className={styles.alertText}>
                {pendingReviews[0] ? `Latest submission from ${pendingReviews[0].customer_name} (${pendingReviews[0].rating}★) waiting for publication approval.` : "Moderation queue requires review."}
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.alertBtn}
            onClick={() => onTab("reviews")}
          >
            <span>Open Moderation Queue</span>
            <ArrowRight size={15} />
          </button>
        </section>
      ) : (
        <section
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.85rem 1.4rem",
            borderRadius: "0.85rem",
            background: "rgba(52, 211, 153, 0.08)",
            border: "1px solid rgba(52, 211, 153, 0.22)",
            color: "#34d399",
            fontSize: "0.86rem",
            fontFamily: "var(--dm-font-mono, monospace)",
          }}
        >
          <CheckCircle2 size={18} />
          <span>Feedback Queue Clear — All client reviews and user submissions are moderated.</span>
        </section>
      )}

      {/* 3. Core Platform KPI Cards Grid */}
      <section className={styles.kpiGrid}>
        {/* Client Satisfaction */}
        <div className={styles.kpiCard}>
          <div>
            <div className={styles.kpiTop}>
              <div className={styles.kpiIconBox}>
                <Star size={20} />
              </div>
              <span style={{ fontSize: "0.72rem", color: "#34d399", fontFamily: "var(--dm-font-mono, monospace)", fontWeight: 700 }}>
                {reviewsData.stats.approvedCount} APPROVED
              </span>
            </div>
            <div className={styles.kpiValue}>{reviewsData.stats.averageRating.toFixed(1)} ★</div>
            <div className={styles.kpiLabel}>Client Rating Average</div>
          </div>
          <div className={styles.kpiSub}>
            <span>{reviewsData.reviews.length} total reviews collected</span>
            <button type="button" className={styles.kpiLink} onClick={() => onTab("reviews")}>
              <span>Reviews</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Dynamic Services */}
        <div className={styles.kpiCard}>
          <div>
            <div className={styles.kpiTop}>
              <div className={styles.kpiIconBox}>
                <Layers size={20} />
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--dm-amber, #ffb300)", fontFamily: "var(--dm-font-mono, monospace)", fontWeight: 700 }}>
                {servicesData.industries.length} SECTORS
              </span>
            </div>
            <div className={styles.kpiValue}>{servicesData.services.length}</div>
            <div className={styles.kpiLabel}>Active Core Services</div>
          </div>
          <div className={styles.kpiSub}>
            <span>Interactive detail pages live</span>
            <button type="button" className={styles.kpiLink} onClick={() => onTab("services")}>
              <span>Services</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Our Work & Products */}
        <div className={styles.kpiCard}>
          <div>
            <div className={styles.kpiTop}>
              <div className={styles.kpiIconBox}>
                <FolderGit2 size={20} />
              </div>
              <span style={{ fontSize: "0.72rem", color: "#818cf8", fontFamily: "var(--dm-font-mono, monospace)", fontWeight: 700 }}>
                PORTFOLIO
              </span>
            </div>
            <div className={styles.kpiValue}>{workData.projects.length}</div>
            <div className={styles.kpiLabel}>Featured Case Studies</div>
          </div>
          <div className={styles.kpiSub}>
            <span>
              {workData.projects.filter((p) => p.type === "work").length} Work • {workData.projects.filter((p) => p.type === "product").length} Products
            </span>
            <button type="button" className={styles.kpiLink} onClick={() => onTab("work")}>
              <span>Portfolio</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Editorial Blog */}
        <div className={styles.kpiCard}>
          <div>
            <div className={styles.kpiTop}>
              <div className={styles.kpiIconBox}>
                <BookOpen size={20} />
              </div>
              <span style={{ fontSize: "0.72rem", color: "#f472b6", fontFamily: "var(--dm-font-mono, monospace)", fontWeight: 700 }}>
                {blogData.categories.length} TOPICS
              </span>
            </div>
            <div className={styles.kpiValue}>{blogData.posts.length}</div>
            <div className={styles.kpiLabel}>Published Journal Articles</div>
          </div>
          <div className={styles.kpiSub}>
            <span>{blogData.posts.filter((p) => p.status === "published").length} live publications</span>
            <button type="button" className={styles.kpiLink} onClick={() => onTab("blog")}>
              <span>Journal</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Careers & Jobs */}
        <div className={styles.kpiCard}>
          <div>
            <div className={styles.kpiTop}>
              <div className={styles.kpiIconBox}>
                <Briefcase size={20} />
              </div>
              <span style={{ fontSize: "0.72rem", color: "#38bdf8", fontFamily: "var(--dm-font-mono, monospace)", fontWeight: 700 }}>
                {careersData.hiring_steps.length} STAGES
              </span>
            </div>
            <div className={styles.kpiValue}>{careersData.jobs.length}</div>
            <div className={styles.kpiLabel}>Active Job Openings</div>
          </div>
          <div className={styles.kpiSub}>
            <span>{careersData.benefits.length} Culture benefits</span>
            <button type="button" className={styles.kpiLink} onClick={() => onTab("careers")}>
              <span>Careers</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Events & Photo Media */}
        <div className={styles.kpiCard}>
          <div>
            <div className={styles.kpiTop}>
              <div className={styles.kpiIconBox}>
                <Calendar size={20} />
              </div>
              <span style={{ fontSize: "0.72rem", color: "#fb923c", fontFamily: "var(--dm-font-mono, monospace)", fontWeight: 700 }}>
                {eventsData.gallery.length} MEDIA
              </span>
            </div>
            <div className={styles.kpiValue}>{eventsData.events.length}</div>
            <div className={styles.kpiLabel}>Company Events Hosted</div>
          </div>
          <div className={styles.kpiSub}>
            <span>Gallery album active</span>
            <button type="button" className={styles.kpiLink} onClick={() => onTab("events")}>
              <span>Events</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Two-Column Dashboard Hub */}
      <section className={styles.twoCol}>
        {/* Left Column: Live Content & Activity Stream */}
        <div className={styles.colCard}>
          <div className={styles.colHead}>
            <h2 className={styles.colTitle}>
              <Sparkles size={18} color="var(--dm-amber, #ffb300)" />
              <span>Recent Publishing Activity</span>
            </h2>
            <span style={{ fontSize: "0.75rem", fontFamily: "var(--dm-font-mono, monospace)", color: "rgba(255,255,255,0.4)" }}>
              LIVE FEED
            </span>
          </div>

          <div className={styles.streamList}>
            {/* Recent Case Study */}
            {workData.projects[0] ? (
              <div className={styles.streamItem}>
                <div className={styles.streamLeft}>
                  <div className={styles.streamIcon}>
                    <FolderGit2 size={16} />
                  </div>
                  <div className={styles.streamInfo}>
                    <p className={styles.streamHeading}>{workData.projects[0].title}</p>
                    <p className={styles.streamMeta}>
                      Case Study • {workData.projects[0].type.toUpperCase()} • {workData.projects[0].category}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.colLink}
                  onClick={() => onTab("work")}
                >
                  Edit →
                </button>
              </div>
            ) : null}

            {/* Recent Blog Post */}
            {blogData.posts[0] ? (
              <div className={styles.streamItem}>
                <div className={styles.streamLeft}>
                  <div className={styles.streamIcon}>
                    <BookOpen size={16} />
                  </div>
                  <div className={styles.streamInfo}>
                    <p className={styles.streamHeading}>{blogData.posts[0].title}</p>
                    <p className={styles.streamMeta}>
                      Blog Journal • {blogData.posts[0].category} • {blogData.posts[0].reading_time}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.colLink}
                  onClick={() => onTab("blog")}
                >
                  Edit →
                </button>
              </div>
            ) : null}

            {/* Recent Event */}
            {eventsData.events[0] ? (
              <div className={styles.streamItem}>
                <div className={styles.streamLeft}>
                  <div className={styles.streamIcon}>
                    <Calendar size={16} />
                  </div>
                  <div className={styles.streamInfo}>
                    <p className={styles.streamHeading}>{eventsData.events[0].title}</p>
                    <p className={styles.streamMeta}>
                      Event • {eventsData.events[0].date} • {eventsData.events[0].category}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.colLink}
                  onClick={() => onTab("events")}
                >
                  Edit →
                </button>
              </div>
            ) : null}

            {/* Recent Open Job */}
            {careersData.jobs[0] ? (
              <div className={styles.streamItem}>
                <div className={styles.streamLeft}>
                  <div className={styles.streamIcon}>
                    <Briefcase size={16} />
                  </div>
                  <div className={styles.streamInfo}>
                    <p className={styles.streamHeading}>{careersData.jobs[0].title}</p>
                    <p className={styles.streamMeta}>
                      Career • {careersData.jobs[0].department} • {careersData.jobs[0].type}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.colLink}
                  onClick={() => onTab("careers")}
                >
                  Edit →
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Column: Platform Fast Navigation & Security Snapshot */}
        <div className={styles.colCard}>
          <div className={styles.colHead}>
            <h2 className={styles.colTitle}>
              <Layers size={18} color="var(--dm-amber, #ffb300)" />
              <span>Control Room Modules</span>
            </h2>
            <span style={{ fontSize: "0.75rem", fontFamily: "var(--dm-font-mono, monospace)", color: "rgba(255,255,255,0.4)" }}>
              QUICK LAUNCH
            </span>
          </div>

          <div className={styles.navGrid}>
            <button type="button" className={styles.navTile} onClick={() => onTab("services")}>
              <div className={styles.navTileLeft}>
                <Layers size={16} className={styles.navTileIcon} />
                <span className={styles.navTileTitle}>Services</span>
              </div>
              <span className={styles.navTileCount}>{servicesData.services.length}</span>
            </button>

            <button type="button" className={styles.navTile} onClick={() => onTab("work")}>
              <div className={styles.navTileLeft}>
                <FolderGit2 size={16} className={styles.navTileIcon} />
                <span className={styles.navTileTitle}>Our Work</span>
              </div>
              <span className={styles.navTileCount}>{workData.projects.length}</span>
            </button>

            <button type="button" className={styles.navTile} onClick={() => onTab("careers")}>
              <div className={styles.navTileLeft}>
                <Briefcase size={16} className={styles.navTileIcon} />
                <span className={styles.navTileTitle}>Careers</span>
              </div>
              <span className={styles.navTileCount}>{careersData.jobs.length}</span>
            </button>

            <button type="button" className={styles.navTile} onClick={() => onTab("blog")}>
              <div className={styles.navTileLeft}>
                <BookOpen size={16} className={styles.navTileIcon} />
                <span className={styles.navTileTitle}>Blog</span>
              </div>
              <span className={styles.navTileCount}>{blogData.posts.length}</span>
            </button>

            <button type="button" className={styles.navTile} onClick={() => onTab("events")}>
              <div className={styles.navTileLeft}>
                <Calendar size={16} className={styles.navTileIcon} />
                <span className={styles.navTileTitle}>Events</span>
              </div>
              <span className={styles.navTileCount}>{eventsData.events.length}</span>
            </button>

            <button type="button" className={styles.navTile} onClick={() => onTab("reviews")}>
              <div className={styles.navTileLeft}>
                <Star size={16} className={styles.navTileIcon} />
                <span className={styles.navTileTitle}>Reviews</span>
              </div>
              <span className={styles.navTileCount}>{reviewsData.reviews.length}</span>
            </button>

            <button type="button" className={styles.navTile} onClick={() => onTab("campaigns")}>
              <div className={styles.navTileLeft}>
                <QrCode size={16} className={styles.navTileIcon} />
                <span className={styles.navTileTitle}>Campaigns</span>
              </div>
              <span className={styles.navTileCount}>{reviewsData.campaigns.length}</span>
            </button>

            <button type="button" className={styles.navTile} onClick={() => onTab("leads")}>
              <div className={styles.navTileLeft}>
                <Users size={16} className={styles.navTileIcon} />
                <span className={styles.navTileTitle}>Leads & Visitors</span>
              </div>
              <span className={styles.navTileCount}>{overviewData.leads.length}</span>
            </button>

            <button type="button" className={styles.navTile} onClick={() => onTab("admins")}>
              <div className={styles.navTileLeft}>
                <ShieldCheck size={16} className={styles.navTileIcon} />
                <span className={styles.navTileTitle}>Admins</span>
              </div>
              <span className={styles.navTileCount}>{overviewData.admins.length}</span>
            </button>
          </div>

          {/* Security & Access Box */}
          <div className={styles.securityBox}>
            <div className={styles.securityHead}>
              <div className={styles.securityTitle}>
                <ShieldCheck size={15} />
                <span>RBAC Security Status</span>
              </div>
              <button
                type="button"
                className={styles.colLink}
                onClick={() => onTab("admins")}
              >
                Manage →
              </button>
            </div>
            <div className={styles.securityPills}>
              <span className={styles.secPill} style={{ color: "#ffb300", borderColor: "rgba(255,179,0,0.3)" }}>
                {superAdminCount} Super Admin{superAdminCount > 1 ? "s" : ""}
              </span>
              <span className={styles.secPill}>
                {adminCount} Admin{adminCount > 1 ? "s" : ""}
              </span>
              <span className={styles.secPill} style={{ color: "#34d399", borderColor: "rgba(52,211,153,0.3)" }}>
                5-Role RBAC Active
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Live Reviews Queue Table */}
      <section className={styles.reviewsCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h3 style={{ fontFamily: "var(--dm-font-display, 'Chakra Petch', sans-serif)", fontSize: "1.25rem", color: "#ffffff", margin: 0 }}>
              Recent Client Reviews & Feedback
            </h3>
            <p style={{ margin: "0.25rem 0 0", color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
              Live customer ratings collected from web campaigns and QR entry points.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onTab("reviews")}
            style={{
              background: "rgba(255,179,0,0.1)",
              border: "1px solid rgba(255,179,0,0.3)",
              color: "var(--dm-amber, #ffb300)",
              fontSize: "0.82rem",
              fontWeight: 600,
              padding: "0.45rem 0.85rem",
              borderRadius: "0.5rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <span>View Full Queue ({reviewsData.reviews.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <AdminReviews
          reviews={reviewsData.reviews.slice(0, 5)}
          onRefresh={onRefreshReviews}
        />
      </section>
    </div>
  );
}
