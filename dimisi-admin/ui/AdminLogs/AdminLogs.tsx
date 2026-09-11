import { useState, useMemo, useEffect, useCallback } from "react";
import {
  ScrollText,
  Search,
  X,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Activity,
  ShieldCheck,
  Layers,
  FolderGit2,
  Briefcase,
  BookOpen,
  Calendar,
  Star,
  QrCode,
  TrendingUp,
  Settings,
  User,
  Copy,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Lock,
  Download,
} from "lucide-react";
import { type AdminRole, ADMIN_ROLES, getRoleMeta } from "../../lib/rbac.shared";
import type {
  AdminLog,
  ActivityModule,
  LogStatus,
  SortField,
  SortOrder,
} from "../../lib/adminLogs.types";
import { INITIAL_ADMIN_LOGS } from "../../data/adminLogs.mock";
import styles from "./AdminLogs.module.css";

const MODULE_LIST: ActivityModule[] = [
  "Authentication",
  "Administrators",
  "Services",
  "Our Work",
  "Careers",
  "Blogs",
  "Events",
  "Reviews",
  "Campaigns",
  "Analytics",
  "Settings",
  "Profile",
];

function initials(name?: string, email?: string) {
  const src = (name || email || "A").trim();
  const parts = src.split(/[\s.@_-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "A") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function getModuleIcon(mod: string) {
  switch (mod) {
    case "Authentication":
      return Lock;
    case "Administrators":
      return ShieldCheck;
    case "Services":
      return Layers;
    case "Our Work":
      return FolderGit2;
    case "Careers":
      return Briefcase;
    case "Blogs":
      return BookOpen;
    case "Events":
      return Calendar;
    case "Reviews":
      return Star;
    case "Campaigns":
      return QrCode;
    case "Analytics":
      return TrendingUp;
    case "Settings":
      return Settings;
    case "Profile":
      return User;
    default:
      return ScrollText;
  }
}

interface AdminLogsProps {
  currentUserRole?: AdminRole | string;
}

export function AdminLogs({ currentUserRole = "super_admin" }: AdminLogsProps) {
  const [logs, setLogs] = useState<AdminLog[]>(INITIAL_ADMIN_LOGS);

  // Filters State
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AdminRole>("all");
  const [moduleFilter, setModuleFilter] = useState<"all" | ActivityModule>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | LogStatus>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "yesterday" | "7days" | "30days">("all");

  // Sorting State (Default: newest first)
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Pagination State
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modal & Interactive State
  const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reset pagination on filter change
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, moduleFilter, statusFilter, dateFilter]);

  // Modal Escape key handler
  useEffect(() => {
    if (!selectedLog) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedLog(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedLog]);

  // Top summary metrics calculation
  const stats = useMemo(() => {
    const total = logs?.length ?? 0;
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    let today = 0;
    let success = 0;
    let failed = 0;

    for (const log of logs ?? []) {
      if (log.timestamp >= oneDayAgo) today++;
      if (log.status === "SUCCESS") success++;
      if (log.status === "FAILED") failed++;
    }

    return {
      totalActivities: total,
      todayCount: today,
      successfulCount: success,
      failedCount: failed,
    };
  }, [logs]);

  // Filter and sort logs
  const filteredLogs = useMemo(() => {
    const list = logs ?? [];
    const query = search.trim().toLowerCase();
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    const filtered = list.filter((log) => {
      // Search matching
      if (query) {
        const nameMatch = log.adminName?.toLowerCase().includes(query);
        const emailMatch = log.email?.toLowerCase().includes(query);
        const accountMatch = log.accountId?.toLowerCase().includes(query);
        const activityMatch = log.activity?.toLowerCase().includes(query);
        const moduleMatch = log.module?.toLowerCase().includes(query);
        const detailsMatch = log.details?.toLowerCase().includes(query);

        if (!nameMatch && !emailMatch && !accountMatch && !activityMatch && !moduleMatch && !detailsMatch) {
          return false;
        }
      }

      // Role filter
      if (roleFilter !== "all" && log.role !== roleFilter) {
        return false;
      }

      // Module filter
      if (moduleFilter !== "all" && log.module !== moduleFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && log.status !== statusFilter) {
        return false;
      }

      // Date range filter
      if (dateFilter === "today") {
        if (log.timestamp < now - oneDayMs) return false;
      } else if (dateFilter === "yesterday") {
        if (log.timestamp >= now - oneDayMs || log.timestamp < now - 2 * oneDayMs) return false;
      } else if (dateFilter === "7days") {
        if (log.timestamp < now - 7 * oneDayMs) return false;
      } else if (dateFilter === "30days") {
        if (log.timestamp < now - 30 * oneDayMs) return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === "timestamp") {
        comparison = a.timestamp - b.timestamp;
      } else if (sortField === "adminName") {
        comparison = (a.adminName ?? "").localeCompare(b.adminName ?? "");
      } else if (sortField === "module") {
        comparison = (a.module ?? "").localeCompare(b.module ?? "");
      } else if (sortField === "status") {
        comparison = (a.status ?? "").localeCompare(b.status ?? "");
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [logs, search, roleFilter, moduleFilter, statusFilter, dateFilter, sortField, sortOrder]);

  // Pagination slicing
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, page, pageSize]);

  // Has active filters
  const hasActiveFilters = Boolean(
    search || roleFilter !== "all" || moduleFilter !== "all" || statusFilter !== "all" || dateFilter !== "all"
  );

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setModuleFilter("all");
    setStatusFilter("all");
    setDateFilter("all");
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLogs(INITIAL_ADMIN_LOGS);
      setIsRefreshing(false);
    }, 450);
  }, []);

  const handleCopyAccountId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleExportCsv = () => {
    const headers = ["ID", "Date", "Time", "Admin", "Email", "Account ID", "Role", "Activity", "Module", "Status", "Details"];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.date,
      l.time,
      `"${(l.adminName || "").replace(/"/g, '""')}"`,
      l.email,
      l.accountId,
      l.role,
      `"${(l.activity || "").replace(/"/g, '""')}"`,
      l.module,
      l.status,
      `"${(l.details || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `dimisi-admin-logs-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} style={{ opacity: 0.4 }} />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp size={12} color="var(--dm-amber)" />
    ) : (
      <ArrowDown size={12} color="var(--dm-amber)" />
    );
  };

  return (
    <div className={styles.wrap}>
      {/* HEADER ROW */}
      <div className={styles.headerRow}>
        <div className={styles.titleBox}>
          <div className={styles.kicker}>
            <ScrollText size={14} />
            <span>Audit & Compliance Trail</span>
          </div>
          <h1 className={styles.title}>Admin Logs</h1>
          <p className={styles.subtitle}>
            Track and review administrative activity across the DIMISI Control Room.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={handleExportCsv}
            title="Export filtered log records as CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh administrative activity log"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            <span>{isRefreshing ? "Syncing…" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* TOP SCORECARDS */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Activities</span>
            <div className={styles.statIcon}>
              <Activity size={16} />
            </div>
          </div>
          <div className={styles.statValue}>{stats.totalActivities}</div>
          <span className={styles.statSubtext}>Recorded across all modules</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Today's Activity</span>
            <div className={styles.statIcon}>
              <Clock size={16} />
            </div>
          </div>
          <div className={styles.statValue}>{stats.todayCount}</div>
          <span className={styles.statSubtext}>Actions logged in last 24h</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Successful Actions</span>
            <div className={styles.statIcon} style={{ color: "#4ade80", background: "rgba(34, 197, 94, 0.1)" }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className={styles.statValue} style={{ color: "#4ade80" }}>
            {stats.successfulCount}
          </div>
          <span className={styles.statSubtext}>Completed without errors</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Failed Actions</span>
            <div className={styles.statIcon} style={{ color: "#f87171", background: "rgba(239, 68, 68, 0.1)" }}>
              <AlertCircle size={16} />
            </div>
          </div>
          <div className={styles.statValue} style={{ color: stats.failedCount > 0 ? "#f87171" : "inherit" }}>
            {stats.failedCount}
          </div>
          <span className={styles.statSubtext}>Blocked or failed attempts</span>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR (OUTSIDE SCROLL CONTAINER) */}
      <div className={styles.toolbarCard}>
        <div className={styles.searchRow}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by admin, email, account ID, activity, or module…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className={styles.resetBtn}
              onClick={handleResetFilters}
            >
              <RotateCcw size={12} />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        <div className={styles.filtersRow}>
          {/* Role Filter */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Role:</span>
            <select
              className={styles.selectInput}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
            >
              <option value="all">All Roles</option>
              {ADMIN_ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Module Filter */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Module:</span>
            <select
              className={styles.selectInput}
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value as any)}
            >
              <option value="all">All Modules</option>
              {MODULE_LIST.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Status:</span>
            <select
              className={styles.selectInput}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="WARNING">Warning</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Date:</span>
            <select
              className={styles.selectInput}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
            >
              <option value="all">All Time</option>
              <option value="today">Today (Last 24h)</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className={styles.tableCard}>
        {/* CARD HEADER (OUTSIDE SCROLL AREA) */}
        <div className={styles.tableCardHeader}>
          <h3 className={styles.tableTitle}>
            <ScrollText size={16} />
            <span>Administrative Audit Log</span>
          </h3>
          <span className={styles.resultCount}>
            Showing {filteredLogs.length === 0 ? 0 : (page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, filteredLogs.length)} of {filteredLogs.length} entries
          </span>
        </div>

        {/* DEDICATED DUAL-AXIS SCROLL CONTAINER */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {/* 1. DATE */}
                <th className={[styles.thSortable, styles.colDate].join(" ")} onClick={() => handleSort("timestamp")}>
                  <div className={styles.thContent}>
                    <span>Date</span>
                    {renderSortIndicator("timestamp")}
                  </div>
                </th>

                {/* 2. TIME */}
                <th className={[styles.thSortable, styles.colTime].join(" ")} onClick={() => handleSort("timestamp")}>
                  <div className={styles.thContent}>
                    <span>Time</span>
                    {renderSortIndicator("timestamp")}
                  </div>
                </th>

                {/* 3. ADMIN */}
                <th className={[styles.thSortable, styles.colAdmin].join(" ")} onClick={() => handleSort("adminName")}>
                  <div className={styles.thContent}>
                    <span>Admin</span>
                    {renderSortIndicator("adminName")}
                  </div>
                </th>

                {/* 4. EMAIL */}
                <th className={styles.colEmail}>
                  <span>Email</span>
                </th>

                {/* 5. ACCOUNT ID */}
                <th className={styles.colAccountId}>
                  <span>Account ID</span>
                </th>

                {/* 6. ROLE */}
                <th className={styles.colRole}>
                  <span>Role</span>
                </th>

                {/* 7. ACTIVITY */}
                <th className={styles.colActivity}>
                  <span>Activity</span>
                </th>

                {/* 8. MODULE */}
                <th className={[styles.thSortable, styles.colModule].join(" ")} onClick={() => handleSort("module")}>
                  <div className={styles.thContent}>
                    <span>Module</span>
                    {renderSortIndicator("module")}
                  </div>
                </th>

                {/* 9. STATUS */}
                <th className={[styles.thSortable, styles.colStatus].join(" ")} onClick={() => handleSort("status")}>
                  <div className={styles.thContent} style={{ justifyContent: "center" }}>
                    <span>Status</span>
                    {renderSortIndicator("status")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIconBox}>
                        <Search size={28} />
                      </div>
                      <h4 className={styles.emptyTitle}>No activity found</h4>
                      <p className={styles.emptyText}>
                        No administrative activity matches the selected filters or search query.
                      </p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          className={styles.resetBtn}
                          onClick={handleResetFilters}
                          style={{ marginTop: "0.5rem" }}
                        >
                          <RotateCcw size={12} />
                          <span>Clear Filters</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const roleMeta = getRoleMeta(log.role);
                  const ModuleIcon = getModuleIcon(log.module);

                  return (
                    <tr
                      key={log.id}
                      className={styles.tableRow}
                      onClick={() => setSelectedLog(log)}
                      title="Click to view detailed activity telemetry"
                    >
                      {/* 1. DATE */}
                      <td className={styles.colDate}>
                        <span className={styles.dateMain}>{log.date}</span>
                      </td>

                      {/* 2. TIME */}
                      <td className={styles.colTime}>
                        <span className={styles.timeSub}>{log.time}</span>
                      </td>

                      {/* 3. ADMIN */}
                      <td className={styles.colAdmin}>
                        <div className={styles.adminCell}>
                          <span className={styles.avatar}>
                            {initials(log.adminName, log.email)}
                          </span>
                          <span className={styles.adminName}>{log.adminName || "DIMISI Admin"}</span>
                        </div>
                      </td>

                      {/* 4. EMAIL */}
                      <td className={styles.colEmail}>
                        <span className={styles.emailText} title={log.email || ""}>
                          {log.email || "—"}
                        </span>
                      </td>

                      {/* 5. ACCOUNT ID */}
                      <td className={styles.colAccountId}>
                        <span
                          className={styles.accountBadge}
                          title={`Full Account ID: ${log.accountId}\n(Click row to view full details)`}
                        >
                          {log.accountId ? `${log.accountId.slice(0, 10)}…` : "—"}
                        </span>
                      </td>

                      {/* 6. ROLE */}
                      <td className={styles.colRole}>
                        <span
                          className={styles.roleBadge}
                          style={{
                            color: roleMeta.color,
                            background: roleMeta.bg,
                            borderColor: roleMeta.border,
                          }}
                        >
                          {roleMeta.shortLabel}
                        </span>
                      </td>

                      {/* 7. ACTIVITY */}
                      <td className={styles.colActivity}>
                        <div className={styles.activityCell} title={log.activity}>
                          <div className={styles.activityIconBox}>
                            <ModuleIcon size={13} />
                          </div>
                          <span className={styles.activityText}>{log.activity}</span>
                        </div>
                      </td>

                      {/* 8. MODULE */}
                      <td className={styles.colModule}>
                        <span className={styles.moduleBadge}>{log.module}</span>
                      </td>

                      {/* 9. STATUS */}
                      <td className={styles.colStatus}>
                        {log.status === "SUCCESS" && (
                          <span className={[styles.statusPill, styles.statusSuccess].join(" ")}>
                            <CheckCircle2 size={11} />
                            <span>SUCCESS</span>
                          </span>
                        )}
                        {log.status === "WARNING" && (
                          <span className={[styles.statusPill, styles.statusWarning].join(" ")}>
                            <AlertTriangle size={11} />
                            <span>WARNING</span>
                          </span>
                        )}
                        {log.status === "FAILED" && (
                          <span className={[styles.statusPill, styles.statusFailed].join(" ")}>
                            <AlertCircle size={11} />
                            <span>FAILED</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS (OUTSIDE SCROLL AREA) */}
        {filteredLogs.length > 0 && (
          <div className={styles.paginationRow}>
            <span className={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>

            <div className={styles.pageControls}>
              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                // Show first, last, current, and adjacent pages
                if (totalPages > 7) {
                  if (p !== 1 && p !== totalPages && Math.abs(p - page) > 1) {
                    if (p === 2 || p === totalPages - 1) {
                      return (
                        <span key={p} style={{ padding: "0 0.2rem", color: "var(--dm-dim)" }}>
                          …
                        </span>
                      );
                    }
                    return null;
                  }
                }

                return (
                  <button
                    key={p}
                    type="button"
                    className={[styles.pageBtn, page === p ? styles.pageBtnActive : ""].join(" ")}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedLog && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setSelectedLog(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Activity details"
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleBox}>
                <span className={styles.modalKicker}>Activity Audit Record</span>
                <h3 className={styles.modalTitle}>{selectedLog.activity}</h3>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setSelectedLog(null)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalGrid}>
                {/* Admin */}
                <div className={styles.modalField}>
                  <span className={styles.modalFieldLabel}>Performed By</span>
                  <div className={styles.modalFieldValue}>
                    <span className={styles.avatar} style={{ width: "1.7rem", height: "1.7rem", fontSize: "0.66rem" }}>
                      {initials(selectedLog.adminName, selectedLog.email)}
                    </span>
                    <strong>{selectedLog.adminName || "DIMISI Admin"}</strong>
                  </div>
                </div>

                {/* Email */}
                <div className={styles.modalField}>
                  <span className={styles.modalFieldLabel}>Account Email</span>
                  <div className={styles.modalFieldValue}>{selectedLog.email}</div>
                </div>

                {/* Account ID */}
                <div className={styles.modalField}>
                  <span className={styles.modalFieldLabel}>Account ID</span>
                  <div className={styles.modalFieldValue}>
                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.8rem" }}>
                      {selectedLog.accountId}
                    </span>
                    <button
                      type="button"
                      className={styles.copyIdBtn}
                      onClick={(e) => handleCopyAccountId(selectedLog.accountId, e)}
                      title="Copy Account ID"
                    >
                      {copiedId ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* System Role */}
                <div className={styles.modalField}>
                  <span className={styles.modalFieldLabel}>Assigned Role</span>
                  <div className={styles.modalFieldValue}>
                    {(() => {
                      const meta = getRoleMeta(selectedLog.role);
                      return (
                        <span
                          className={styles.roleBadge}
                          style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
                        >
                          {meta.label} ({meta.shortLabel})
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Module */}
                <div className={styles.modalField}>
                  <span className={styles.modalFieldLabel}>Affected Module</span>
                  <div className={styles.modalFieldValue}>
                    <span className={styles.moduleBadge}>{selectedLog.module}</span>
                  </div>
                </div>

                {/* Status */}
                <div className={styles.modalField}>
                  <span className={styles.modalFieldLabel}>Action Status</span>
                  <div className={styles.modalFieldValue}>
                    {selectedLog.status === "SUCCESS" && (
                      <span className={[styles.statusPill, styles.statusSuccess].join(" ")}>
                        <CheckCircle2 size={12} />
                        <span>SUCCESS</span>
                      </span>
                    )}
                    {selectedLog.status === "WARNING" && (
                      <span className={[styles.statusPill, styles.statusWarning].join(" ")}>
                        <AlertTriangle size={12} />
                        <span>WARNING</span>
                      </span>
                    )}
                    {selectedLog.status === "FAILED" && (
                      <span className={[styles.statusPill, styles.statusFailed].join(" ")}>
                        <AlertCircle size={12} />
                        <span>FAILED</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Date & Time */}
                <div className={styles.modalField}>
                  <span className={styles.modalFieldLabel}>Timestamp</span>
                  <div className={styles.modalFieldValue}>
                    <span style={{ fontFamily: "var(--font-mono, monospace)" }}>
                      {selectedLog.date} at {selectedLog.time}
                    </span>
                  </div>
                </div>

                {/* Target Resource */}
                {selectedLog.targetResource && (
                  <div className={styles.modalField}>
                    <span className={styles.modalFieldLabel}>Target Resource</span>
                    <div className={styles.modalFieldValue}>
                      <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.8rem", color: "var(--dm-gold)" }}>
                        {selectedLog.targetResource}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description / Details */}
              {selectedLog.details && (
                <div className={styles.modalDescBox}>
                  <span className={styles.modalFieldLabel}>Action Details & Telemetry</span>
                  <p className={styles.modalDescText}>{selectedLog.details}</p>
                </div>
              )}

              {/* IP / User Agent */}
              {(selectedLog.ipAddress || selectedLog.userAgent) && (
                <div className={styles.modalGrid}>
                  {selectedLog.ipAddress && (
                    <div className={styles.modalField}>
                      <span className={styles.modalFieldLabel}>Origin IP Address</span>
                      <div className={styles.modalFieldValue}>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.8rem" }}>
                          {selectedLog.ipAddress}
                        </span>
                      </div>
                    </div>
                  )}
                  {selectedLog.userAgent && (
                    <div className={styles.modalField} style={{ gridColumn: "span 2" }}>
                      <span className={styles.modalFieldLabel}>Client User Agent</span>
                      <div className={styles.modalFieldValue} style={{ fontSize: "0.76rem", color: "var(--dm-dim)" }}>
                        {selectedLog.userAgent}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => setSelectedLog(null)}
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
