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
  Terminal,
  Server,
  FileCode,
} from "lucide-react";
import { type AdminRole, ADMIN_ROLES, getRoleMeta } from "../../lib/rbac.shared";
import type {
  AdminLog,
  ActivityModule,
  LogStatus,
  SortField,
  SortOrder,
} from "../../lib/adminLogs.types";
import { getPanelActivityLogsApi } from "@/services/activity.service";
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
  "Settings",
  "Profile",
  "Workspace",
];

function initials(name?: string, email?: string) {
  const src = (name || email || "A").trim();
  const parts = src.split(/[\s.@_-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "A") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
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
    case "Settings":
      return Settings;
    case "Profile":
      return User;
    case "Workspace":
      return Terminal;
    default:
      return ScrollText;
  }
}

function formatActionName(action?: string): string {
  if (!action) return "Administrative Action";
  if (action.includes(" ") && /[A-Z]/.test(action)) return action;
  return action
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getActionBadgeStyle(action?: string, status?: LogStatus) {
  if (status === "FAILED") {
    return {
      color: "#f87171",
      bg: "rgba(239, 68, 68, 0.12)",
      border: "rgba(239, 68, 68, 0.35)",
    };
  }
  const act = (action || "").toLowerCase();
  if (
    act.includes("create") ||
    act.includes("add") ||
    act.includes("activate") ||
    act.includes("login") ||
    act.includes("publish")
  ) {
    return {
      color: "#34d399",
      bg: "rgba(16, 185, 129, 0.12)",
      border: "rgba(16, 185, 129, 0.35)",
    };
  }
  if (
    act.includes("delete") ||
    act.includes("remove") ||
    act.includes("drop") ||
    act.includes("suspend") ||
    act.includes("revoke")
  ) {
    return {
      color: "#f87171",
      bg: "rgba(239, 68, 68, 0.12)",
      border: "rgba(239, 68, 68, 0.35)",
    };
  }
  if (
    act.includes("status") ||
    act.includes("toggle") ||
    act.includes("switch") ||
    act.includes("role")
  ) {
    return {
      color: "#fbbf24",
      bg: "rgba(245, 158, 11, 0.12)",
      border: "rgba(245, 158, 11, 0.35)",
    };
  }
  return {
    color: "#38bdf8",
    bg: "rgba(56, 189, 248, 0.12)",
    border: "rgba(56, 189, 248, 0.35)",
  };
}

function getDateRangeBounds(range: "all" | "today" | "yesterday" | "7days" | "30days"): {
  startDate?: string;
  endDate?: string;
} {
  if (range === "all") return {};
  const now = new Date();
  if (range === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    return { startDate: start.toISOString() };
  }
  if (range === "yesterday") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }
  if (range === "7days") {
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { startDate: start.toISOString() };
  }
  if (range === "30days") {
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { startDate: start.toISOString() };
  }
  return {};
}

function getBackendEntityType(mod: "all" | ActivityModule): string | undefined {
  switch (mod) {
    case "Authentication":
      return "authentication";
    case "Administrators":
      return "administrator";
    case "Services":
      return "service";
    case "Our Work":
      return "casestudy";
    case "Careers":
      return "career";
    case "Blogs":
      return "blog";
    case "Events":
      return "event";
    case "Reviews":
      return "review";
    case "Campaigns":
      return "campaign";
    case "Settings":
      return "settings";
    case "Profile":
      return "administrator";
    case "Workspace":
      return "workspace";
    default:
      return undefined;
  }
}

interface AdminLogsProps {
  currentUserRole?: AdminRole | string;
  currentAdmins?: any[];
}

export function AdminLogs({ currentUserRole, currentAdmins }: AdminLogsProps) {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [totalServerRecords, setTotalServerRecords] = useState<number>(0);
  const [serverTotalPages, setServerTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AdminRole>("all");
  const [moduleFilter, setModuleFilter] = useState<"all" | ActivityModule>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | LogStatus>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "yesterday" | "7days" | "30days">("all");

  // Sorting State (Default: newest first)
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Server Pagination State
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Auto-Refresh (Off = 0, 30s, 60s)
  const [autoRefreshRate, setAutoRefreshRate] = useState<0 | 30 | 60>(0);

  // Modal / Drawer & Interactive State
  const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedTargetId, setCopiedTargetId] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load logs directly from the backend activity service with dynamic admin lookups
  const loadLiveLogs = useCallback(
    async (isBackground = false) => {
      if (!isBackground) {
        setIsLoading(true);
      }
      setErrorMessage(null);
      try {
        const bounds = getDateRangeBounds(dateFilter);
        const entityType = getBackendEntityType(moduleFilter);

        const res = await getPanelActivityLogsApi({
          page,
          limit: pageSize,
          ...(bounds.startDate ? { startDate: bounds.startDate } : {}),
          ...(bounds.endDate ? { endDate: bounds.endDate } : {}),
          ...(entityType ? { entityType } : {}),
          admins: currentAdmins,
        });

        if (Array.isArray(res.adminLogs)) {
          setLogs(res.adminLogs);
          setTotalServerRecords(res.total);
          setServerTotalPages(res.totalPages);
        }
      } catch (err: any) {
        console.warn("Failed to load activity logs:", err);
        if (
          err?.status === 401 ||
          err?.message?.includes("token") ||
          err?.message?.includes("valid for this panel")
        ) {
          setErrorMessage(
            "Authentication mismatch: Panel authentication token required. (Backend activity route requires protectPanel)"
          );
        } else {
          setErrorMessage(
            err instanceof Error ? err.message : "Failed to fetch activity logs from server."
          );
        }
      } finally {
        if (!isBackground) {
          setIsLoading(false);
        }
      }
    },
    [page, pageSize, dateFilter, moduleFilter, currentAdmins]
  );

  // Initial and reactive load on page, pageSize, dateFilter, or moduleFilter change
  useEffect(() => {
    void loadLiveLogs();
  }, [loadLiveLogs]);

  // Reset page to 1 when filters or page size change
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, moduleFilter, statusFilter, dateFilter, pageSize]);

  // Auto-Refresh interval handler
  useEffect(() => {
    if (autoRefreshRate <= 0) return;
    const interval = setInterval(() => {
      void loadLiveLogs(true);
    }, autoRefreshRate * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshRate, loadLiveLogs]);

  // Drawer Escape key handler
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
    const total = totalServerRecords;
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
  }, [totalServerRecords, logs]);

  // In-memory filter and sort for current batch
  const filteredLogs = useMemo(() => {
    const list = logs ?? [];
    const query = search.trim().toLowerCase();

    const filtered = list.filter((log) => {
      // Search matching
      if (query) {
        const nameMatch = log.adminName?.toLowerCase().includes(query);
        const emailMatch = log.email?.toLowerCase().includes(query);
        const empMatch = (log.employeeId || log.accountId)?.toLowerCase().includes(query);
        const activityMatch = log.activity?.toLowerCase().includes(query);
        const moduleMatch = log.module?.toLowerCase().includes(query);
        const detailsMatch = log.details?.toLowerCase().includes(query);
        const targetMatch = log.targetResource?.toLowerCase().includes(query);
        const ipMatch = log.ipAddress?.toLowerCase().includes(query);

        if (
          !nameMatch &&
          !emailMatch &&
          !empMatch &&
          !activityMatch &&
          !moduleMatch &&
          !detailsMatch &&
          !targetMatch &&
          !ipMatch
        ) {
          return false;
        }
      }

      // Role filter
      if (roleFilter !== "all" && log.role !== roleFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && log.status !== statusFilter) {
        return false;
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
  }, [logs, search, roleFilter, statusFilter, sortField, sortOrder]);

  const hasActiveFilters = Boolean(
    search ||
      roleFilter !== "all" ||
      moduleFilter !== "all" ||
      statusFilter !== "all" ||
      dateFilter !== "all"
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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadLiveLogs();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadLiveLogs]);

  const handleCopyEmployeeId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleCopyTargetId = (targetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(targetId);
      setCopiedTargetId(true);
      setTimeout(() => setCopiedTargetId(false), 2000);
    }
  };

  const handleCopyIp = (ip: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(ip);
      setCopiedIp(true);
      setTimeout(() => setCopiedIp(false), 2000);
    }
  };

  const handleCopyRecordJson = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedLog) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      const dump = JSON.stringify(
        {
          id: selectedLog.id,
          action: selectedLog.activity,
          actionRaw: selectedLog.actionRaw,
          module: selectedLog.module,
          entityTypeRaw: selectedLog.entityTypeRaw,
          status: selectedLog.status,
          scope: selectedLog.scope,
          admin: {
            name: selectedLog.adminName,
            email: selectedLog.email,
            employeeId: selectedLog.employeeId,
            accountId: selectedLog.accountId,
            role: selectedLog.role,
          },
          targetResource: selectedLog.targetResource,
          details: selectedLog.details,
          telemetry: {
            ipAddress: selectedLog.ipAddress,
            userAgent: selectedLog.userAgent,
            timestamp: selectedLog.timestamp,
            date: selectedLog.date,
            time: selectedLog.time,
          },
          metadata: selectedLog.metadata,
        },
        null,
        2
      );
      void navigator.clipboard.writeText(dump);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "ID",
      "Date",
      "Time",
      "Admin",
      "Email",
      "Employee ID",
      "Role",
      "Scope",
      "Activity",
      "Module",
      "Status",
      "Target Resource",
      "Details",
      "IP Address",
    ];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.date,
      l.time,
      `"${(l.adminName || "").replace(/"/g, '""')}"`,
      l.email,
      l.employeeId || l.accountId || "—",
      l.role,
      l.scope || "PANEL",
      `"${(l.activity || "").replace(/"/g, '""')}"`,
      l.module,
      l.status,
      l.targetResource || "—",
      `"${(l.details || "").replace(/"/g, '""')}"`,
      l.ipAddress || "—",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `dimisi-admin-logs-${new Date().toISOString().split("T")[0]}.csv`
    );
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
            Track and inspect enterprise administrative audit telemetry across the DIMISI Control
            Room.
          </p>
          <div className={styles.scopeIndicator} title="Backend scope isolation: Dedicated Panel Operations">
            <Server size={11} />
            <span>Dedicated Panel Operations Scope ({totalServerRecords.toLocaleString()} live events recorded)</span>
          </div>
        </div>

        <div className={styles.headerActions}>
          {/* AUTO REFRESH TOGGLE */}
          <div className={styles.autoRefreshGroup} title="Automatic periodic data refresh">
            <RefreshCw size={13} className={autoRefreshRate > 0 ? "animate-spin" : ""} />
            <span>Auto-Refresh:</span>
            <select
              className={styles.autoRefreshSelect}
              value={autoRefreshRate}
              onChange={(e) => setAutoRefreshRate(Number(e.target.value) as 0 | 30 | 60)}
            >
              <option value={0}>Off</option>
              <option value={30}>Every 30s</option>
              <option value={60}>Every 60s</option>
            </select>
          </div>

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
            <span className={styles.statLabel}>Panel Activities</span>
            <div className={styles.statIcon}>
              <Activity size={16} />
            </div>
          </div>
          <div className={styles.statValue}>{stats.totalActivities.toLocaleString()}</div>
          <span className={styles.statSubtext}>Total records stored in database</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Today's Activity</span>
            <div className={styles.statIcon}>
              <Clock size={16} />
            </div>
          </div>
          <div className={styles.statValue}>{stats.todayCount}</div>
          <span className={styles.statSubtext}>Actions logged in recent batch</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Successful Actions</span>
            <div
              className={styles.statIcon}
              style={{ color: "#4ade80", background: "rgba(34, 197, 94, 0.1)" }}
            >
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className={styles.statValue} style={{ color: "#4ade80" }}>
            {stats.successfulCount}
          </div>
          <span className={styles.statSubtext}>Verified completed actions</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Failed Actions</span>
            <div
              className={styles.statIcon}
              style={{ color: "#f87171", background: "rgba(239, 68, 68, 0.1)" }}
            >
              <AlertCircle size={16} />
            </div>
          </div>
          <div
            className={styles.statValue}
            style={{ color: stats.failedCount > 0 ? "#f87171" : "inherit" }}
          >
            {stats.failedCount}
          </div>
          <span className={styles.statSubtext}>Blocked or rejected operations</span>
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
              placeholder="Search by admin, email, employee ID (e.g. DMSEMP260002), action, or target ID…"
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

          {/* Module Filter (Database Query Pushdown) */}
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
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Date Filter (Database Query Pushdown) */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Date:</span>
            <select
              className={styles.selectInput}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
            >
              <option value="all">All Time</option>
              <option value="today">Today (Since Midnight)</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE CARD - CONSOLIDATED 6-COLUMN MASTER LAYOUT */}
      <div className={styles.tableCard}>
        {/* CARD HEADER (OUTSIDE SCROLL AREA) */}
        <div className={styles.tableCardHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <h3 className={styles.tableTitle}>
              <ScrollText size={16} />
              <span>Administrative Audit Log</span>
            </h3>
            {isLoading && (
              <RefreshCw
                size={13}
                className="animate-spin"
                style={{ color: "var(--dm-amber)" }}
              />
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Page Size Selector */}
            <div className={styles.pageSizeWrap}>
              <span>Show:</span>
              <select
                className={styles.pageSizeSelect}
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={10}>10 rows</option>
                <option value={20}>20 rows</option>
                <option value={50}>50 rows</option>
                <option value={100}>100 rows</option>
              </select>
            </div>

            <span className={styles.resultCount}>
              Page {page} of {Math.max(1, serverTotalPages)} ({totalServerRecords.toLocaleString()}{" "}
              total logs)
            </span>
          </div>
        </div>

        {/* DEDICATED DUAL-AXIS SCROLL CONTAINER */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {/* 1. TIMESTAMP (Date + Time + Relative Ago) */}
                <th
                  className={[styles.thSortable, styles.colTimestamp].join(" ")}
                  onClick={() => handleSort("timestamp")}
                >
                  <div className={styles.thContent}>
                    <span>Timestamp</span>
                    {renderSortIndicator("timestamp")}
                  </div>
                </th>

                {/* 2. ACTOR (Avatar + Name + Email + Real Employee ID) */}
                <th
                  className={[styles.thSortable, styles.colActor].join(" ")}
                  onClick={() => handleSort("adminName")}
                >
                  <div className={styles.thContent}>
                    <span>Actor / Performed By</span>
                    {renderSortIndicator("adminName")}
                  </div>
                </th>

                {/* 3. ROLE & SCOPE */}
                <th className={styles.colRoleScope}>
                  <span>Role & Scope</span>
                </th>

                {/* 4. ACTIVITY & TARGET */}
                <th className={styles.colActivity}>
                  <span>Activity & Target</span>
                </th>

                {/* 5. MODULE */}
                <th
                  className={[styles.thSortable, styles.colModule].join(" ")}
                  onClick={() => handleSort("module")}
                >
                  <div className={styles.thContent}>
                    <span>Module</span>
                    {renderSortIndicator("module")}
                  </div>
                </th>

                {/* 6. STATUS & DOSSIER */}
                <th
                  className={[styles.thSortable, styles.colStatus].join(" ")}
                  onClick={() => handleSort("status")}
                >
                  <div className={styles.thContent} style={{ justifyContent: "flex-end" }}>
                    <span>Status & Record</span>
                    {renderSortIndicator("status")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className={styles.emptyState}>
                      <div
                        className={styles.emptyIconBox}
                        style={{ animation: "spin 1s linear infinite" }}
                      >
                        <RefreshCw size={28} />
                      </div>
                      <h4 className={styles.emptyTitle}>Loading Activity Logs...</h4>
                      <p className={styles.emptyText}>
                        Fetching real-time administrative telemetry from database.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : errorMessage && filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className={styles.emptyState}>
                      <div
                        className={styles.emptyIconBox}
                        style={{ borderColor: "#ef4444", color: "#ef4444" }}
                      >
                        <AlertTriangle size={28} />
                      </div>
                      <h4 className={styles.emptyTitle}>Unable to Load Activity Logs</h4>
                      <p className={styles.emptyText}>{errorMessage}</p>
                      <button
                        type="button"
                        className={styles.resetBtn}
                        onClick={() => void loadLiveLogs()}
                        style={{ marginTop: "0.5rem" }}
                      >
                        <RefreshCw size={12} />
                        <span>Retry</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6}>
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
                filteredLogs.map((log) => {
                  const roleMeta = getRoleMeta(log.role);
                  const ModuleIcon = getModuleIcon(log.module);
                  const badgeStyle = getActionBadgeStyle(log.actionRaw || log.activity, log.status);

                  return (
                    <tr
                      key={log.id}
                      className={styles.tableRow}
                      onClick={() => setSelectedLog(log)}
                      title="Click to inspect security audit dossier"
                    >
                      {/* 1. TIMESTAMP (Date, Time, Relative) */}
                      <td className={styles.colTimestamp}>
                        <div className={styles.timestampGroup}>
                          <span className={styles.timestampDate}>{log.date}</span>
                          <div className={styles.timestampMeta}>
                            <span>{log.time}</span>
                            <span>•</span>
                            <span className={styles.relativeTime}>
                              {formatRelativeTime(log.timestamp)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. ACTOR (Avatar + Full Name + Email + Real Employee ID) */}
                      <td className={styles.colActor}>
                        <div className={styles.actorGroup}>
                          {log.avatar ? (
                            <img
                              src={log.avatar}
                              alt={log.adminName}
                              className={styles.avatarImg}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <span className={styles.avatar}>
                              {initials(log.adminName, log.email)}
                            </span>
                          )}
                          <div className={styles.actorInfo}>
                            <span className={styles.actorName}>
                              {log.adminName || "DIMISI Admin"}
                            </span>
                            <div className={styles.actorMetaRow}>
                              <span className={styles.actorEmail} title={log.email || ""}>
                                {log.email || "—"}
                              </span>
                              <span
                                className={styles.actorEmpBadge}
                                title={`Employee ID: ${log.employeeId || "—"}`}
                              >
                                {log.employeeId || "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 3. ROLE & SCOPE */}
                      <td className={styles.colRoleScope}>
                        <div className={styles.roleScopeGroup}>
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
                          <span className={styles.scopeTag}>
                            <Server size={10} />
                            <span>{log.scope || "PANEL"}</span>
                          </span>
                        </div>
                      </td>

                      {/* 4. ACTIVITY & TARGET */}
                      <td className={styles.colActivity}>
                        <div className={styles.activityGroup} title={log.activity}>
                          <span
                            className={styles.actionBadge}
                            style={{
                              color: badgeStyle.color,
                              background: badgeStyle.bg,
                              borderColor: badgeStyle.border,
                            }}
                          >
                            <ModuleIcon size={12} />
                            <span>{formatActionName(log.activity)}</span>
                          </span>
                          <span
                            className={styles.activitySubtext}
                            title={log.details || log.targetResource || ""}
                          >
                            {log.details ||
                              (log.targetResource ? `Target: ${log.targetResource}` : "—")}
                          </span>
                        </div>
                      </td>

                      {/* 5. MODULE */}
                      <td className={styles.colModule}>
                        <span className={styles.moduleBadge}>{log.module}</span>
                      </td>

                      {/* 6. STATUS & DOSSIER ACTION */}
                      <td className={styles.colStatus}>
                        <div className={styles.statusActionGroup}>
                          {log.status === "SUCCESS" && (
                            <span className={[styles.statusPill, styles.statusSuccess].join(" ")}>
                              <CheckCircle2 size={11} />
                              <span>SUCCESS</span>
                            </span>
                          )}
                          {log.status === "FAILED" && (
                            <span className={[styles.statusPill, styles.statusFailed].join(" ")}>
                              <AlertCircle size={11} />
                              <span>FAILED</span>
                            </span>
                          )}
                          <button
                            type="button"
                            className={styles.inspectBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(log);
                            }}
                            title="Inspect complete audit dossier"
                          >
                            <ChevronRight size={14} />
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

        {/* SERVER-SIDE PAGINATION CONTROLS */}
        {totalServerRecords > 0 && (
          <div className={styles.paginationRow}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span className={styles.pageInfo}>
                Showing Page {page} of {Math.max(1, serverTotalPages)} (
                {totalServerRecords.toLocaleString()} entries)
              </span>
            </div>

            <div className={styles.pageControls}>
              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: Math.min(serverTotalPages, 7) }, (_, idx) => {
                let p = idx + 1;
                if (serverTotalPages > 7) {
                  if (page <= 4) {
                    p = idx + 1;
                  } else if (page >= serverTotalPages - 3) {
                    p = serverTotalPages - 6 + idx;
                  } else {
                    p = page - 3 + idx;
                  }
                }

                return (
                  <button
                    key={p}
                    type="button"
                    className={[styles.pageBtn, page === p ? styles.pageBtnActive : ""].join(
                      " "
                    )}
                    onClick={() => setPage(p)}
                    disabled={isLoading}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.min(serverTotalPages, p + 1))}
                disabled={page >= serverTotalPages || isLoading}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SLIDE-OVER SECURITY AUDIT DOSSIER */}
      {selectedLog && (
        <div
          className={styles.drawerBackdrop}
          onClick={() => setSelectedLog(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Activity Audit Dossier"
        >
          <div className={styles.drawerPane} onClick={(e) => e.stopPropagation()}>
            {/* DRAWER HEADER */}
            <div className={styles.drawerHeader}>
              <div className={styles.drawerHeaderInfo}>
                <span className={styles.modalKicker}>Enterprise Security Audit Dossier</span>
                <h3 className={styles.modalTitle}>{formatActionName(selectedLog.activity)}</h3>
                <div className={styles.drawerBadges}>
                  {selectedLog.scope && (
                    <span className={styles.scopeBadge}>
                      <Server size={11} />
                      <span>{selectedLog.scope}</span>
                    </span>
                  )}
                  {selectedLog.status === "SUCCESS" && (
                    <span className={[styles.statusPill, styles.statusSuccess].join(" ")}>
                      <CheckCircle2 size={11} />
                      <span>SUCCESS</span>
                    </span>
                  )}
                  {selectedLog.status === "FAILED" && (
                    <span className={[styles.statusPill, styles.statusFailed].join(" ")}>
                      <AlertCircle size={11} />
                      <span>FAILED</span>
                    </span>
                  )}
                  <span className={styles.moduleBadge}>{selectedLog.module}</span>
                </div>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setSelectedLog(null)}
                aria-label="Close dossier"
              >
                <X size={16} />
              </button>
            </div>

            {/* DRAWER BODY */}
            <div className={styles.drawerBody}>
              {/* SECTION 1: PERFORMED BY */}
              <div className={styles.drawerSection}>
                <span className={styles.drawerSectionTitle}>
                  <User size={13} />
                  <span>Administrative Actor</span>
                </span>
                <div className={styles.drawerCard}>
                  <div className={styles.drawerUserRow}>
                    {selectedLog.avatar ? (
                      <img
                        src={selectedLog.avatar}
                        alt={selectedLog.adminName}
                        className={styles.avatarImgLarge}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span
                        className={styles.avatar}
                        style={{ width: "2.75rem", height: "2.75rem", fontSize: "1rem" }}
                      >
                        {initials(selectedLog.adminName, selectedLog.email)}
                      </span>
                    )}
                    <div className={styles.drawerUserInfo}>
                      <span className={styles.drawerUserName}>
                        {selectedLog.adminName || "DIMISI Administrator"}
                      </span>
                      <span className={styles.drawerUserEmail}>{selectedLog.email}</span>
                    </div>
                  </div>

                  <div className={styles.modalGrid}>
                    <div className={styles.modalField}>
                      <span className={styles.modalFieldLabel}>Employee ID</span>
                      <div className={styles.modalFieldValue}>
                        <span
                          style={{
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.82rem",
                            color: "var(--dm-amber, #ff9f1c)",
                            fontWeight: 600,
                          }}
                        >
                          {selectedLog.employeeId || selectedLog.accountId}
                        </span>
                        <button
                          type="button"
                          className={styles.copyIdBtn}
                          onClick={(e) =>
                            handleCopyEmployeeId(
                              selectedLog.employeeId || selectedLog.accountId || "",
                              e
                            )
                          }
                          title="Copy Employee ID"
                        >
                          {copiedId ? (
                            <Check size={14} color="#4ade80" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className={styles.modalField}>
                      <span className={styles.modalFieldLabel}>Assigned Role</span>
                      <div className={styles.modalFieldValue}>
                        {(() => {
                          const meta = getRoleMeta(selectedLog.role);
                          return (
                            <span
                              className={styles.roleBadge}
                              style={{
                                color: meta.color,
                                background: meta.bg,
                                borderColor: meta.border,
                              }}
                            >
                              {meta.label} ({meta.shortLabel})
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: OPERATION & TARGET */}
              <div className={styles.drawerSection}>
                <span className={styles.drawerSectionTitle}>
                  <Layers size={13} />
                  <span>Operation & Target</span>
                </span>
                <div className={styles.modalGrid}>
                  <div className={styles.modalField}>
                    <span className={styles.modalFieldLabel}>Action Identifier</span>
                    <div className={styles.modalFieldValue}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono, monospace)",
                          fontSize: "0.8rem",
                          color: "var(--dm-amber)",
                        }}
                      >
                        {selectedLog.actionRaw || selectedLog.activity}
                      </span>
                    </div>
                  </div>

                  <div className={styles.modalField}>
                    <span className={styles.modalFieldLabel}>Entity Type</span>
                    <div className={styles.modalFieldValue}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono, monospace)",
                          fontSize: "0.8rem",
                          color: "#38bdf8",
                        }}
                      >
                        {selectedLog.entityTypeRaw || selectedLog.module}
                      </span>
                    </div>
                  </div>

                  {selectedLog.targetResource && (
                    <div className={styles.modalField} style={{ gridColumn: "span 2" }}>
                      <span className={styles.modalFieldLabel}>Target Resource ID</span>
                      <div className={styles.modalFieldValue}>
                        <span
                          style={{
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.82rem",
                            color: "var(--dm-gold)",
                          }}
                        >
                          {selectedLog.targetResource}
                        </span>
                        <button
                          type="button"
                          className={styles.copyIdBtn}
                          onClick={(e) =>
                            handleCopyTargetId(selectedLog.targetResource || "", e)
                          }
                          title="Copy Resource ID"
                        >
                          {copiedTargetId ? (
                            <Check size={14} color="#4ade80" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subtext Description */}
                {selectedLog.details && (
                  <div className={styles.modalDescBox}>
                    <span className={styles.modalFieldLabel}>Audit Details & Subtext</span>
                    <p className={styles.modalDescText}>{selectedLog.details}</p>
                  </div>
                )}
              </div>

              {/* SECTION 3: ORIGIN & TELEMETRY */}
              <div className={styles.drawerSection}>
                <span className={styles.drawerSectionTitle}>
                  <Clock size={13} />
                  <span>Origin & Network Telemetry</span>
                </span>
                <div className={styles.modalGrid}>
                  <div className={styles.modalField}>
                    <span className={styles.modalFieldLabel}>Timestamp</span>
                    <div className={styles.modalFieldValue}>
                      <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.8rem" }}>
                        {selectedLog.date} at {selectedLog.time}
                      </span>
                    </div>
                  </div>

                  <div className={styles.modalField}>
                    <span className={styles.modalFieldLabel}>Origin IP Address</span>
                    <div className={styles.modalFieldValue}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono, monospace)",
                          fontSize: "0.8rem",
                        }}
                      >
                        {selectedLog.ipAddress || "127.0.0.1"}
                      </span>
                      {selectedLog.ipAddress && (
                        <button
                          type="button"
                          className={styles.copyIdBtn}
                          onClick={(e) => handleCopyIp(selectedLog.ipAddress || "", e)}
                          title="Copy IP Address"
                        >
                          {copiedIp ? (
                            <Check size={14} color="#4ade80" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedLog.userAgent && (
                    <div className={styles.modalField} style={{ gridColumn: "span 2" }}>
                      <span className={styles.modalFieldLabel}>Client User Agent</span>
                      <div
                        className={styles.modalFieldValue}
                        style={{ fontSize: "0.76rem", color: "var(--dm-dim)", lineHeight: 1.4 }}
                      >
                        {selectedLog.userAgent}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 4: METADATA EXPLORER */}
              <div className={styles.drawerSection}>
                <span className={styles.drawerSectionTitle}>
                  <FileCode size={13} />
                  <span>Metadata & Payload Explorer</span>
                </span>
                <div className={styles.jsonViewerBox}>
                  <button
                    type="button"
                    className={styles.copyCodeBtn}
                    onClick={handleCopyRecordJson}
                    title="Copy Raw Metadata JSON"
                  >
                    {copiedJson ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                    <span>{copiedJson ? "Copied" : "Copy JSON"}</span>
                  </button>
                  <pre className={styles.jsonPre}>
                    {JSON.stringify(
                      selectedLog.metadata || {
                        action: selectedLog.actionRaw || selectedLog.activity,
                        scope: selectedLog.scope || "PANEL",
                        ip: selectedLog.ipAddress,
                        userAgent: selectedLog.userAgent,
                        targetResource: selectedLog.targetResource,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </div>

            {/* DRAWER FOOTER */}
            <div className={styles.drawerFooter}>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={handleCopyRecordJson}
              >
                {copiedJson ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                <span>{copiedJson ? "Copied Audit Record!" : "Copy Record JSON"}</span>
              </button>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => setSelectedLog(null)}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
