/**
 * DIMISI Technologies — Admin Leads & Visitor Intelligence Module
 * Dedicated component for full lead lifecycle management and first-party visitor telemetry.
 */
import { useState, useEffect, useCallback, useTransition } from "react";
import {
  Users,
  Radio,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  Compass,
  ArrowRight,
  TrendingUp,
  X,
  FileText,
  ShieldCheck,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Building,
  Target,
} from "lucide-react";
import {
  getAdminLeadsFn,
  getAdminLeadDetailsFn,
  updateAdminLeadStatusFn,
  deleteAdminLeadFn,
} from "@/lib/leads.functions";
import {
  getAdminVisitorsFn,
  getAdminVisitorJourneyFn,
} from "@/lib/visitors.functions";
import type {
  LeadItem,
  LeadStatus,
  VisitorSessionItem,
  PageViewItem,
  LeadDetailsWithJourney,
  LeadAnalyticsStats,
  VisitorAnalyticsStats,
} from "@/lib/leads.shared";
import { LEAD_STATUS_META } from "@/lib/leads.shared";
import styles from "./AdminLeads.module.css";

interface AdminLeadsProps {
  initialLeads?: LeadItem[];
  currentUserRole?: string;
  onRefreshOverview?: () => void;
}

export function AdminLeads({ initialLeads = [], currentUserRole = "admin", onRefreshOverview }: AdminLeadsProps) {
  const [activeTab, setActiveTab] = useState<"leads" | "visitors">("leads");

  // Leads State
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads);
  const [leadStats, setLeadStats] = useState<LeadAnalyticsStats>({
    totalLeads: initialLeads.length,
    newToday: 0,
    contactedCount: 0,
    convertedCount: 0,
    conversionRate: 0,
  });
  const [leadPage, setLeadPage] = useState(1);
  const [leadTotalPages, setLeadTotalPages] = useState(1);
  const [leadTotal, setLeadTotal] = useState(initialLeads.length);
  const [leadSearch, setLeadSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState<"all" | LeadStatus>("all");
  const [leadSourceFilter, setLeadSourceFilter] = useState<string>("all");
  const [leadSortBy, setLeadSortBy] = useState<"created_at" | "full_name" | "status">("created_at");

  // Visitors State
  const [visitors, setVisitors] = useState<VisitorSessionItem[]>([]);
  const [visitorStats, setVisitorStats] = useState<VisitorAnalyticsStats>({
    totalVisitorsToday: 0,
    activeLiveVisitors: 0,
    totalSessions: 0,
    returningVisitorsCount: 0,
    returningRatioPercent: 0,
    avgDurationSeconds: 0,
    totalPageViewsToday: 0,
  });
  const [visitorPage, setVisitorPage] = useState(1);
  const [visitorTotalPages, setVisitorTotalPages] = useState(1);
  const [visitorTotal, setVisitorTotal] = useState(0);
  const [visitorSearch, setVisitorSearch] = useState("");
  const [visitorStatusFilter, setVisitorStatusFilter] = useState<"all" | "live" | "recent" | "offline">("all");
  const [visitorDeviceFilter, setVisitorDeviceFilter] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Detail Modal State
  const [selectedLead, setSelectedLead] = useState<LeadDetailsWithJourney | null>(null);
  const [selectedVisitorJourney, setSelectedVisitorJourney] = useState<{
    session: VisitorSessionItem | null;
    journey: PageViewItem[];
  } | null>(null);
  const [leadNotes, setLeadNotes] = useState("");
  const [leadStatusUpdating, setLeadStatusUpdating] = useState(false);

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  /** Load Leads */
  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminLeadsFn({
        data: {
          page: leadPage,
          limit: 15,
          search: leadSearch,
          status: leadStatusFilter,
          source: leadSourceFilter,
          sortBy: leadSortBy,
          sortOrder: "desc",
        },
      });
      startTransition(() => {
        setLeads(res.leads);
        setLeadTotal(res.total);
        setLeadTotalPages(res.totalPages);
        setLeadStats(res.stats);
      });
    } catch (err: any) {
      setError(err?.message || "Could not load leads.");
    } finally {
      setLoading(false);
    }
  }, [leadPage, leadSearch, leadStatusFilter, leadSourceFilter, leadSortBy]);

  /** Load Visitors */
  const loadVisitors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminVisitorsFn({
        data: {
          page: visitorPage,
          limit: 15,
          search: visitorSearch,
          status: visitorStatusFilter,
          device: visitorDeviceFilter,
          sortBy: "last_seen_at",
          sortOrder: "desc",
        },
      });
      startTransition(() => {
        setVisitors(res.sessions);
        setVisitorTotal(res.total);
        setVisitorTotalPages(res.totalPages);
        setVisitorStats(res.stats);
      });
    } catch (err: any) {
      setError(err?.message || "Could not load visitor intelligence.");
    } finally {
      setLoading(false);
    }
  }, [visitorPage, visitorSearch, visitorStatusFilter, visitorDeviceFilter]);

  // Initial and reactive load
  useEffect(() => {
    void loadLeads();
    void loadVisitors();
  }, [loadLeads, loadVisitors]);

  // Live Auto-refresh timer (every 8s) to stream live visits and inquiries in real-time
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      if (activeTab === "leads") {
        void loadLeads();
        // Also fetch live visitor count for tab badge
        void getAdminVisitorsFn({
          data: { page: 1, limit: 1, sortBy: "last_seen_at", sortOrder: "desc" },
        }).then((res) => setVisitorStats(res.stats)).catch(() => {});
      } else {
        void loadVisitors();
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [autoRefresh, activeTab, loadLeads, loadVisitors]);

  /** Open Lead Details Drawer */
  const handleOpenLead = async (leadId: string) => {
    try {
      const details = await getAdminLeadDetailsFn({ data: { leadId } });
      if (details) {
        setSelectedLead(details);
        setLeadNotes(details.lead.notes || "");
      }
    } catch (err: any) {
      alert("Unable to fetch lead details: " + err.message);
    }
  };

  /** Open Visitor Journey Drawer */
  const handleOpenVisitorJourney = async (session: VisitorSessionItem) => {
    try {
      const res = await getAdminVisitorJourneyFn({
        data: { session_id: session.session_id, visitor_id: session.visitor_id },
      });
      setSelectedVisitorJourney({
        session,
        journey: res.journey,
      });
    } catch (err: any) {
      alert("Unable to fetch visitor journey: " + err.message);
    }
  };

  /** Update Lead Status */
  const handleUpdateStatus = async (leadId: string, status: LeadStatus) => {
    setLeadStatusUpdating(true);
    try {
      await updateAdminLeadStatusFn({
        data: { leadId, status, notes: leadNotes },
      });
      if (selectedLead && selectedLead.lead.id === leadId) {
        setSelectedLead((prev) =>
          prev
            ? {
                ...prev,
                lead: { ...prev.lead, status, notes: leadNotes },
              }
            : null,
        );
      }
      void loadLeads();
      if (onRefreshOverview) onRefreshOverview();
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    } finally {
      setLeadStatusUpdating(false);
    }
  };

  /** Delete Lead */
  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await deleteAdminLeadFn({ data: { leadId } });
      if (selectedLead?.lead.id === leadId) setSelectedLead(null);
      void loadLeads();
      if (onRefreshOverview) onRefreshOverview();
    } catch (err: any) {
      alert("Failed to delete lead: " + err.message);
    }
  };

  /** Format Helpers */
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const getRelativeTime = (isoString: string) => {
    if (!isoString) return "—";
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  };

  const isLiveVisitor = (lastSeenAt: string) => {
    if (!lastSeenAt) return false;
    return Date.now() - new Date(lastSeenAt).getTime() < 3 * 60 * 1000;
  };

  return (
    <div className={styles.wrap}>
      {/* Header & Sub-Navigation */}
      <div className={styles.headerRow}>
        <div className={styles.subTabs}>
          <button
            type="button"
            className={`${styles.subTabBtn} ${activeTab === "leads" ? styles.subTabBtnActive : ""}`}
            onClick={() => {
              setActiveTab("leads");
              setLeadPage(1);
            }}
          >
            <Users size={16} />
            <span>Website Leads</span>
            <span className={styles.subTabBadge}>{leadTotal}</span>
          </button>

          <button
            type="button"
            className={`${styles.subTabBtn} ${activeTab === "visitors" ? styles.subTabBtnActive : ""}`}
            onClick={() => {
              setActiveTab("visitors");
              setVisitorPage(1);
            }}
          >
            <Radio size={16} color="#4ade80" />
            <span>Visitor Intelligence</span>
            {visitorStats.activeLiveVisitors > 0 && (
              <span className={`${styles.subTabBadge} ${styles.subTabBadgeLive}`}>
                {visitorStats.activeLiveVisitors} LIVE
              </span>
            )}
          </button>
        </div>

        <div className={styles.headerActions}>
          <label className={styles.autoRefreshBadge}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Live Auto-Sync (8s)</span>
          </label>

          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => (activeTab === "leads" ? void loadLeads() : void loadVisitors())}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SUBTAB 1: LEADS MANAGEMENT
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "leads" && (
        <>
          {/* Leads Scorecards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Total Inquiries</span>
                <Users size={18} color="var(--dm-amber, #ffab2e)" />
              </div>
              <div className={styles.statValue}>{leadStats.totalLeads}</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>New Today</span>
                <Clock size={18} color="var(--dm-gold, #ffd79a)" />
              </div>
              <div className={styles.statValue} style={{ color: "var(--dm-gold, #ffd79a)" }}>
                {leadStats.newToday}
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Contacted</span>
                <CheckCircle2 size={18} color="var(--dm-orange, #ff7a18)" />
              </div>
              <div className={styles.statValue} style={{ color: "var(--dm-orange, #ff7a18)" }}>
                {leadStats.contactedCount}
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Converted Clients</span>
                <Target size={18} color="#34d399" />
              </div>
              <div className={styles.statValue} style={{ color: "#34d399" }}>
                {leadStats.convertedCount}
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Conversion Rate</span>
                <TrendingUp size={18} color="var(--dm-amber, #ffab2e)" />
              </div>
              <div className={styles.statValue} style={{ color: "var(--dm-amber, #ffab2e)" }}>
                {leadStats.conversionRate}%
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className={styles.filterBar}>
            <div className={styles.searchInputWrap}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search leads by name, email, phone, company, message…"
                value={leadSearch}
                onChange={(e) => {
                  setLeadSearch(e.target.value);
                  setLeadPage(1);
                }}
                className={styles.searchInput}
              />
            </div>

            <select
              className={styles.selectInput}
              value={leadStatusFilter}
              onChange={(e) => {
                setLeadStatusFilter(e.target.value as any);
                setLeadPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="in_progress">In Progress</option>
              <option value="converted">Converted</option>
              <option value="archived">Archived</option>
            </select>

            <select
              className={styles.selectInput}
              value={leadSourceFilter}
              onChange={(e) => {
                setLeadSourceFilter(e.target.value);
                setLeadPage(1);
              }}
            >
              <option value="all">All Sources</option>
              <option value="contact_page">Contact Page</option>
              <option value="website">Website</option>
              <option value="campaign">Campaign / QR</option>
            </select>

            <select
              className={styles.selectInput}
              value={leadSortBy}
              onChange={(e) => setLeadSortBy(e.target.value as any)}
            >
              <option value="created_at">Newest First</option>
              <option value="full_name">Name (A-Z)</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* Leads Table Container with 2D Scroll */}
          <div className={styles.tableContainer}>
            <div className={styles.tableScrollArea}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Lead Name & Email</th>
                    <th>Phone / Company</th>
                    <th>Source & Page</th>
                    <th>Visitor Context</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className={styles.stateBox}>
                          <Users size={32} color="#64748b" />
                          <div className={styles.stateTitle}>No leads found</div>
                          <p>Inquiries submitted via the Contact Form will appear here automatically.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => {
                      const statusMeta = LEAD_STATUS_META[lead.status || "new"] || LEAD_STATUS_META.new;
                      return (
                        <tr
                          key={lead.id}
                          className={styles.tableRow}
                          onClick={() => handleOpenLead(lead.id)}
                        >
                          <td>
                            <div style={{ fontWeight: 600, color: "#f8fafc" }}>
                              {lead.full_name || "Anonymous Lead"}
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{lead.email}</div>
                          </td>

                          <td>
                            <div>{lead.phone || "—"}</div>
                            {lead.company && (
                              <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                                {lead.company}
                              </div>
                            )}
                          </td>

                          <td>
                            <span className={styles.tagPill}>{lead.source || "contact_page"}</span>
                            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>
                              {lead.page || "/contact"}
                            </div>
                          </td>

                          <td>
                            {lead.visitor_id ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                <span className={styles.badgeReturning}>
                                  Linked Session
                                </span>
                                <span style={{ fontSize: "0.72rem", color: "#64748b", fontFamily: "monospace" }}>
                                  {lead.visitor_id.slice(0, 10)}…
                                </span>
                              </div>
                            ) : (
                              <span style={{ color: "#64748b", fontSize: "0.8rem" }}>Direct / Unlinked</span>
                            )}
                          </td>

                          <td style={{ whiteSpace: "nowrap", fontSize: "0.8rem", color: "#94a3b8" }}>
                            {new Date(lead.created_at).toLocaleString([], {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </td>

                          <td>
                            <span
                              className={styles.statusBadge}
                              style={{
                                color: statusMeta.color,
                                backgroundColor: statusMeta.bg,
                                border: `1px solid ${statusMeta.border}`,
                              }}
                            >
                              {statusMeta.label}
                            </span>
                          </td>

                          <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.4rem" }}>
                              <button
                                type="button"
                                className={styles.actionBtn}
                                onClick={() => handleOpenLead(lead.id)}
                                title="View Lead Details & Journey"
                              >
                                <Eye size={13} />
                                <span>Details</span>
                              </button>
                              <button
                                type="button"
                                className={styles.actionBtn}
                                style={{ color: "#f87171" }}
                                onClick={() => handleDeleteLead(lead.id)}
                                title="Delete Lead"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {leadTotalPages > 1 && (
              <div className={styles.paginationBar}>
                <span>
                  Showing Page {leadPage} of {leadTotalPages} ({leadTotal} total leads)
                </span>
                <div className={styles.pageControls}>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    disabled={leadPage <= 1}
                    onClick={() => setLeadPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    disabled={leadPage >= leadTotalPages}
                    onClick={() => setLeadPage((p) => Math.min(leadTotalPages, p + 1))}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUBTAB 2: VISITOR INTELLIGENCE (LIVE TELEMETRY)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "visitors" && (
        <>
          {/* Visitor Intelligence Scorecards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Active Live</span>
                <div className={styles.pulseDot} />
              </div>
              <div className={styles.statValue} style={{ color: "#4ade80" }}>
                {visitorStats.activeLiveVisitors}
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Visitors Today</span>
                <Globe size={18} color="var(--dm-amber, #ffab2e)" />
              </div>
              <div className={styles.statValue}>{visitorStats.totalVisitorsToday}</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Page Views Today</span>
                <FileText size={18} color="var(--dm-gold, #ffd79a)" />
              </div>
              <div className={styles.statValue} style={{ color: "var(--dm-gold, #ffd79a)" }}>
                {visitorStats.totalPageViewsToday}
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Avg Duration</span>
                <Clock size={18} color="var(--dm-orange, #ff7a18)" />
              </div>
              <div className={styles.statValue} style={{ color: "var(--dm-orange, #ff7a18)" }}>
                {formatDuration(visitorStats.avgDurationSeconds)}
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Returning Visitors</span>
                <UserCheck size={18} color="var(--dm-amber, #ffab2e)" />
              </div>
              <div className={styles.statValue} style={{ color: "var(--dm-amber, #ffab2e)" }}>
                {visitorStats.returningRatioPercent}%
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className={styles.filterBar}>
            <div className={styles.searchInputWrap}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search visitors by ID, page, referrer, campaign, browser…"
                value={visitorSearch}
                onChange={(e) => {
                  setVisitorSearch(e.target.value);
                  setVisitorPage(1);
                }}
                className={styles.searchInput}
              />
            </div>

            <select
              className={styles.selectInput}
              value={visitorStatusFilter}
              onChange={(e) => {
                setVisitorStatusFilter(e.target.value as any);
                setVisitorPage(1);
              }}
            >
              <option value="all">All Visitors</option>
              <option value="live">Live Active (Last 3m)</option>
              <option value="recent">Recent (Last 24h)</option>
              <option value="offline">Historical / Offline</option>
            </select>

            <select
              className={styles.selectInput}
              value={visitorDeviceFilter}
              onChange={(e) => {
                setVisitorDeviceFilter(e.target.value);
                setVisitorPage(1);
              }}
            >
              <option value="all">All Devices</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
            </select>
          </div>

          {/* Visitors Table Container with 2D Scroll */}
          <div className={styles.tableContainer}>
            <div className={styles.tableScrollArea}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Visitor ID / Visits</th>
                    <th>Current / Last Page</th>
                    <th>Pages Viewed</th>
                    <th>Duration</th>
                    <th>Device / Browser / OS</th>
                    <th>Source / UTM</th>
                    <th>Auth State</th>
                    <th>Last Active</th>
                    <th style={{ textAlign: "right" }}>Journey</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.length === 0 ? (
                    <tr>
                      <td colSpan={10}>
                        <div className={styles.stateBox}>
                          <Radio size={32} color="#64748b" />
                          <div className={styles.stateTitle}>No visitor activity recorded yet</div>
                          <p>Live visitors browsing the website will appear here in real-time.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    visitors.map((v) => {
                      const live = isLiveVisitor(v.last_seen_at);
                      return (
                        <tr
                          key={v.session_id}
                          className={styles.tableRow}
                          onClick={() => handleOpenVisitorJourney(v)}
                        >
                          <td>
                            {live ? (
                              <span className={styles.visitorPulseLive}>
                                <span className={styles.pulseDot} />
                                LIVE
                              </span>
                            ) : Date.now() - new Date(v.last_seen_at).getTime() < 24 * 60 * 60 * 1000 ? (
                              <span className={styles.visitorPulseRecent}>RECENT</span>
                            ) : (
                              <span className={styles.visitorPulseOffline}>OFFLINE</span>
                            )}
                          </td>

                          <td>
                            <div style={{ fontFamily: "monospace", color: "#f8fafc", fontSize: "0.82rem" }}>
                              {v.visitor_id.slice(0, 12)}…
                            </div>
                            <div style={{ marginTop: "0.2rem" }}>
                              {v.visit_count > 1 ? (
                                <span className={styles.badgeReturning}>
                                  Returning ({v.visit_count}x)
                                </span>
                              ) : (
                                <span className={styles.badgeNew}>First Visit</span>
                              )}
                            </div>
                          </td>

                          <td>
                            <div style={{ color: "#f1f5f9", fontWeight: 500, fontFamily: "monospace" }}>
                              {v.last_page}
                            </div>
                            {v.initial_page && v.initial_page !== v.last_page && (
                              <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                                Landed: {v.initial_page}
                              </div>
                            )}
                          </td>

                          <td>
                            <span style={{ fontWeight: 600, color: "#e2e8f0" }}>{v.page_count}</span>{" "}
                            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>views</span>
                          </td>

                          <td style={{ color: "#38bdf8", fontWeight: 500 }}>
                            {formatDuration(v.total_duration_seconds)}
                          </td>

                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#cbd5e1" }}>
                              {v.device_category === "mobile" ? (
                                <Smartphone size={13} color="#38bdf8" />
                              ) : v.device_category === "tablet" ? (
                                <Tablet size={13} color="#a855f7" />
                              ) : (
                                <Laptop size={13} color="#60a5fa" />
                              )}
                              <span style={{ textTransform: "capitalize" }}>{v.device_category}</span>
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                              {v.browser || "Unknown"} • {v.os || "OS"}
                            </div>
                          </td>

                          <td>
                            <span className={styles.tagPill}>
                              {v.utm_source ? `utm: ${v.utm_source}` : v.referrer ? new URL(v.referrer, "https://dimisi.in").hostname : "Direct"}
                            </span>
                          </td>

                          <td>
                            {v.auth_state === "authenticated" ? (
                              <span style={{ color: "#34d399", fontSize: "0.75rem", fontWeight: 600 }}>
                                <ShieldCheck size={12} style={{ display: "inline", marginRight: "2px" }} />
                                Authenticated
                              </span>
                            ) : (
                              <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Anonymous</span>
                            )}
                          </td>

                          <td style={{ color: "#94a3b8", fontSize: "0.78rem" }}>
                            {getRelativeTime(v.last_seen_at)}
                          </td>

                          <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className={styles.actionBtn}
                              onClick={() => handleOpenVisitorJourney(v)}
                            >
                              <Compass size={13} />
                              <span>Journey</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {visitorTotalPages > 1 && (
              <div className={styles.paginationBar}>
                <span>
                  Showing Page {visitorPage} of {visitorTotalPages} ({visitorTotal} total sessions)
                </span>
                <div className={styles.pageControls}>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    disabled={visitorPage <= 1}
                    onClick={() => setVisitorPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    disabled={visitorPage >= visitorTotalPages}
                    onClick={() => setVisitorPage((p) => Math.min(visitorTotalPages, p + 1))}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL / DRAWER: LEAD DETAILS & VISITOR JOURNEY
      ───────────────────────────────────────────────────────────── */}
      {selectedLead && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedLead(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleWrap}>
                <Users size={20} color="#60a5fa" />
                <h3 className={styles.modalTitle}>Lead Details & Visitor Intelligence</h3>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setSelectedLead(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Lead Profile */}
              <div className={styles.detailSection}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionHeading}>
                    <UserCheck size={16} /> Contact Identity
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Status:</span>
                    <select
                      className={styles.selectInput}
                      value={selectedLead.lead.status}
                      disabled={leadStatusUpdating}
                      onChange={(e) =>
                        handleUpdateStatus(selectedLead.lead.id, e.target.value as LeadStatus)
                      }
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="in_progress">In Progress</option>
                      <option value="converted">Converted</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className={styles.grid2Col}>
                  <div className={styles.infoField}>
                    <span className={styles.fieldLabel}>Full Name</span>
                    <span className={styles.fieldValue}>{selectedLead.lead.full_name || "—"}</span>
                  </div>

                  <div className={styles.infoField}>
                    <span className={styles.fieldLabel}>Email Address</span>
                    <span className={styles.fieldValue}>
                      <a
                        href={`mailto:${selectedLead.lead.email}`}
                        style={{ color: "#60a5fa", textDecoration: "underline" }}
                      >
                        {selectedLead.lead.email}
                      </a>
                    </span>
                  </div>

                  <div className={styles.infoField}>
                    <span className={styles.fieldLabel}>Phone / WhatsApp</span>
                    <span className={styles.fieldValue}>{selectedLead.lead.phone || "—"}</span>
                  </div>

                  <div className={styles.infoField}>
                    <span className={styles.fieldLabel}>Company / Org</span>
                    <span className={styles.fieldValue}>{selectedLead.lead.company || "—"}</span>
                  </div>

                  <div className={styles.infoField}>
                    <span className={styles.fieldLabel}>Inquiry Type</span>
                    <span className={styles.fieldValue}>{selectedLead.lead.inquiry_type || "General Inquiry"}</span>
                  </div>

                  <div className={styles.infoField}>
                    <span className={styles.fieldLabel}>Submitted When</span>
                    <span className={styles.fieldValue}>
                      {new Date(selectedLead.lead.created_at).toLocaleString([], {
                        dateStyle: "full",
                        timeStyle: "medium",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inquiry Message */}
              {selectedLead.lead.message && (
                <div className={styles.detailSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionHeading}>
                      <FileText size={16} /> Inquiry Message
                    </span>
                  </div>
                  <div className={styles.messageBox}>{selectedLead.lead.message}</div>
                </div>
              )}

              {/* Associated Visitor Context */}
              {selectedLead.visitorSession && (
                <div className={styles.detailSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionHeading}>
                      <Radio size={16} color="#4ade80" /> Associated Visitor Intelligence
                    </span>
                    <span className={styles.tagPill}>
                      {selectedLead.visitorSession.visit_count > 1
                        ? `Returning Visitor (${selectedLead.visitorSession.visit_count}x)`
                        : "First-Time Visitor"}
                    </span>
                  </div>

                  <div className={styles.grid2Col}>
                    <div className={styles.infoField}>
                      <span className={styles.fieldLabel}>Device & Browser</span>
                      <span className={styles.fieldValue}>
                        {selectedLead.visitorSession.device_category} • {selectedLead.visitorSession.browser} (
                        {selectedLead.visitorSession.os})
                      </span>
                    </div>

                    <div className={styles.infoField}>
                      <span className={styles.fieldLabel}>Total Session Duration</span>
                      <span className={styles.fieldValue} style={{ color: "#38bdf8" }}>
                        {formatDuration(selectedLead.visitorSession.total_duration_seconds)} (
                        {selectedLead.visitorSession.page_count} pages viewed)
                      </span>
                    </div>

                    <div className={styles.infoField}>
                      <span className={styles.fieldLabel}>Initial Landing Page</span>
                      <span className={styles.fieldValue} style={{ fontFamily: "monospace" }}>
                        {selectedLead.visitorSession.initial_page}
                      </span>
                    </div>

                    <div className={styles.infoField}>
                      <span className={styles.fieldLabel}>Traffic Source / Referrer</span>
                      <span className={styles.fieldValue}>
                        {selectedLead.visitorSession.referrer || "Direct Traffic"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Chronological Page Journey Timeline */}
              {selectedLead.pageJourney && selectedLead.pageJourney.length > 0 && (
                <div className={styles.detailSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionHeading}>
                      <Compass size={16} color="#38bdf8" /> Visitor Journey Before Submission
                    </span>
                  </div>

                  <div className={styles.timeline}>
                    {selectedLead.pageJourney.map((step, idx) => (
                      <div key={step.page_view_id || idx} className={styles.timelineItem}>
                        <div className={styles.timelineNode} />
                        <div className={styles.timelinePathRow}>
                          <span className={styles.timelinePath}>{step.path}</span>
                          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                            {new Date(step.entered_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className={styles.timelineMeta}>
                          <span className={styles.timelinePill}>
                            <Clock size={11} /> {formatDuration(step.duration_seconds)}
                          </span>
                          {step.max_scroll_percent > 0 && (
                            <span className={`${styles.timelinePill} ${styles.timelinePillScroll}`}>
                              Scrolled {step.max_scroll_percent}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Final Conversion Node */}
                    <div className={styles.timelineItem}>
                      <div className={`${styles.timelineNode} ${styles.timelineNodeTarget}`} />
                      <div className={styles.timelinePathRow}>
                        <span className={styles.timelinePath} style={{ color: "#4ade80" }}>
                          🎯 Form Submitted ➔ Lead Created
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "#4ade80", fontWeight: 600 }}>
                          Conversion
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL / DRAWER: STANDALONE VISITOR JOURNEY
      ───────────────────────────────────────────────────────────── */}
      {selectedVisitorJourney && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedVisitorJourney(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleWrap}>
                <Compass size={20} color="#38bdf8" />
                <h3 className={styles.modalTitle}>Visitor Session Journey</h3>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setSelectedVisitorJourney(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {selectedVisitorJourney.session && (
                <div className={styles.detailSection}>
                  <div className={styles.grid2Col}>
                    <div className={styles.infoField}>
                      <span className={styles.fieldLabel}>Visitor ID</span>
                      <span className={styles.fieldValue} style={{ fontFamily: "monospace" }}>
                        {selectedVisitorJourney.session.visitor_id}
                      </span>
                    </div>

                    <div className={styles.infoField}>
                      <span className={styles.fieldLabel}>Session Duration</span>
                      <span className={styles.fieldValue} style={{ color: "#38bdf8" }}>
                        {formatDuration(selectedVisitorJourney.session.total_duration_seconds)} (
                        {selectedVisitorJourney.session.page_count} pages)
                      </span>
                    </div>

                    <div className={styles.infoField}>
                      <span className={styles.fieldLabel}>Device & Browser</span>
                      <span className={styles.fieldValue}>
                        {selectedVisitorJourney.session.device_category} •{" "}
                        {selectedVisitorJourney.session.browser} ({selectedVisitorJourney.session.os})
                      </span>
                    </div>

                    <div className={styles.infoField}>
                      <span className={styles.fieldLabel}>Source / Campaign</span>
                      <span className={styles.fieldValue}>
                        {selectedVisitorJourney.session.utm_campaign
                          ? `Campaign: ${selectedVisitorJourney.session.utm_campaign}`
                          : selectedVisitorJourney.session.referrer || "Direct"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.detailSection}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionHeading}>
                    <Clock size={16} /> Page-by-Page Chronological Journey
                  </span>
                </div>

                {selectedVisitorJourney.journey.length === 0 ? (
                  <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                    No granular page views recorded for this session.
                  </p>
                ) : (
                  <div className={styles.timeline}>
                    {selectedVisitorJourney.journey.map((step, idx) => (
                      <div key={step.page_view_id || idx} className={styles.timelineItem}>
                        <div className={styles.timelineNode} />
                        <div className={styles.timelinePathRow}>
                          <span className={styles.timelinePath}>{step.path}</span>
                          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                            {new Date(step.entered_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className={styles.timelineMeta}>
                          <span className={styles.timelinePill}>
                            <Clock size={11} /> {formatDuration(step.duration_seconds)}
                          </span>
                          {step.max_scroll_percent > 0 && (
                            <span className={`${styles.timelinePill} ${styles.timelinePillScroll}`}>
                              Scrolled {step.max_scroll_percent}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
