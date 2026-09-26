/**
 * DIMISI Admin — Activity & Audit Logs Express API Service
 * Handles fetching live administrative and panel activity logs
 * against the Express backend API (/api/v1/activity/*).
 */
import { apiRequest } from "./apiClient";
import type { AdminLog, ActivityModule, LogStatus } from "../../dimisi-admin/lib/adminLogs.types";
import type { AdminRole } from "../../dimisi-admin/lib/rbac.shared";

export interface BackendActivityLogDoc {
  _id: string;
  actorId?: {
    _id: string;
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
  } | string;
  action: string;
  entityType?: string;
  entityId?: string;
  status?: "SUCCESS" | "FAILED";
  scope: "PANEL" | "ADMIN" | "PERSONAL" | "ORG";
  metadata?: Record<string, any>;
  createdAt?: string;
}

export interface BackendActivityLogsResponse {
  data: BackendActivityLogDoc[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminActivityLogItem {
  id: string;
  actor_name: string;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  status: "success" | "failed";
  subtext: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

function mapEntityTypeToModule(entityType?: string, action?: string): ActivityModule {
  const norm = (entityType || action || "").toUpperCase();
  if (norm.includes("AUTH") || norm.includes("LOGIN") || norm.includes("LOGOUT")) return "Authentication";
  if (norm.includes("USER") || norm.includes("ADMIN")) return "Administrators";
  if (norm.includes("SERVICE")) return "Services";
  if (norm.includes("CASESTUDY") || norm.includes("WORK") || norm.includes("PROJECT")) return "Our Work";
  if (norm.includes("JOB") || norm.includes("APPLICATION") || norm.includes("CAREER")) return "Careers";
  if (norm.includes("BLOG")) return "Blogs";
  if (norm.includes("EVENT") || norm.includes("GALLERY")) return "Events";
  if (norm.includes("REVIEW")) return "Reviews";
  if (norm.includes("CAMPAIGN") || norm.includes("QR")) return "Campaigns";
  if (norm.includes("LEAD") || norm.includes("ANALYTICS")) return "Analytics";
  if (norm.includes("SETTING") || norm.includes("CONFIG")) return "Settings";
  if (norm.includes("PROFILE") || norm.includes("PASSWORD")) return "Profile";
  return "Authentication";
}

export function normalizeBackendActivityLog(doc: BackendActivityLogDoc): AdminActivityLogItem {
  let actorName = "Admin User";
  let actorEmail: string | null = null;

  if (doc.actorId && typeof doc.actorId === "object") {
    actorName = doc.actorId.name || doc.actorId.email || "Admin User";
    actorEmail = doc.actorId.email || null;
  }

  const subtext = doc.metadata?.subtext || `${doc.action} on ${doc.entityType || "resource"}`;
  const ip = doc.metadata?.ip || null;
  const ua = doc.metadata?.useragent || null;

  return {
    id: String(doc._id),
    actor_name: actorName,
    actor_email: actorEmail,
    action: doc.action,
    entity_type: doc.entityType || "GENERAL",
    entity_id: doc.entityId ? String(doc.entityId) : null,
    status: doc.status === "FAILED" ? "failed" : "success",
    subtext,
    ip_address: ip,
    user_agent: ua,
    created_at: doc.createdAt || new Date().toISOString(),
  };
}

export function toAdminLogModel(doc: BackendActivityLogDoc): AdminLog {
  const d = doc.createdAt ? new Date(doc.createdAt) : new Date();
  let actorName = "Admin User";
  let actorEmail = "admin@dimisi.tech";
  let employeeId = "EMP-001";
  let accountId = "usr-admin";
  let role: AdminRole = "admin";

  if (doc.actorId && typeof doc.actorId === "object") {
    actorName = doc.actorId.name || doc.actorId.email || "Admin User";
    actorEmail = doc.actorId.email || "admin@dimisi.tech";
    accountId = String(doc.actorId._id || "usr-admin");

    const emp =
      doc.actorId.empId ||
      doc.actorId.employeeId ||
      (doc.metadata?.employeeId) ||
      (doc.metadata?.empId) ||
      null;

    if (emp) {
      employeeId = String(emp);
    } else if (doc.actorId._id && !/^[0-9a-fA-F]{24}$/.test(doc.actorId._id)) {
      employeeId = String(doc.actorId._id);
    } else {
      employeeId = "EMP-001";
    }

    if (doc.actorId.role && ["super_admin", "admin", "editor", "analyst", "viewer"].includes(doc.actorId.role)) {
      role = doc.actorId.role as AdminRole;
    }
  } else if (doc.actorId) {
    accountId = String(doc.actorId);
    const emp = (doc.metadata?.employeeId) || (doc.metadata?.empId);
    if (emp) {
      employeeId = String(emp);
    } else if (!/^[0-9a-fA-F]{24}$/.test(String(doc.actorId))) {
      employeeId = String(doc.actorId);
    } else {
      employeeId = "EMP-001";
    }
  }

  const status: LogStatus = doc.status === "FAILED" ? "FAILED" : "SUCCESS";
  const mod = mapEntityTypeToModule(doc.entityType, doc.action);

  const formattedDate = d.toISOString().split("T")[0];
  const formattedTime = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const log: AdminLog = {
    id: String(doc._id),
    date: formattedDate,
    time: formattedTime,
    timestamp: d.getTime(),
    adminName: actorName,
    email: actorEmail,
    employeeId,
    accountId,
    role,
    activity: doc.action,
    module: mod,
    status,
    details: doc.metadata?.subtext || `${doc.action} performed on ${doc.entityType || "resource"}`,
    ipAddress: doc.metadata?.ip || "127.0.0.1",
    userAgent: doc.metadata?.useragent || "Web Client",
  };

  if (doc.entityId) {
    log.targetResource = String(doc.entityId);
  }

  return log;
}

/**
 * 1. GET PANEL ACTIVITY AUDIT LOGS
 * Endpoint: GET /api/v1/activity/panel
 */
export async function getPanelActivityLogsApi(filters: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  entityType?: string;
  actorId?: string;
} = {}): Promise<{
  logs: AdminActivityLogItem[];
  adminLogs: AdminLog[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (filters.entityType && filters.entityType !== "all") params.set("entityType", filters.entityType);
  if (filters.actorId) params.set("actorId", filters.actorId);

  const query = params.toString() ? `?${params.toString()}` : "";

  try {
    const res = await apiRequest<any>(
      `/api/v1/activity/panel${query}`,
      { method: "GET", cacheTtlMs: 5000 },
    );

    let rawLogs: BackendActivityLogDoc[] = [];
    let total = 0;
    let page = filters.page || 1;
    let totalPages = 1;

    if (res?.data && typeof res.data === "object") {
      if (Array.isArray(res.data)) {
        rawLogs = res.data;
        total = res.total || rawLogs.length;
      } else if (Array.isArray(res.data.data)) {
        rawLogs = res.data.data;
        total = res.data.total ?? rawLogs.length;
        page = res.data.page ?? page;
        totalPages = res.data.totalPages ?? 1;
      } else if (Array.isArray((res.data as any).logs)) {
        rawLogs = (res.data as any).logs;
        total = (res.data as any).total ?? rawLogs.length;
      }
    } else if (Array.isArray((res as any)?.logs)) {
      rawLogs = (res as any).logs;
      total = (res as any).total ?? rawLogs.length;
    }

    return {
      logs: rawLogs.map(normalizeBackendActivityLog),
      adminLogs: rawLogs.map(toAdminLogModel),
      total,
      page,
      totalPages,
    };
  } catch (err) {
    console.warn("Failed to fetch panel activity logs from backend:", err);
    return {
      logs: [],
      adminLogs: [],
      total: 0,
      page: 1,
      totalPages: 1,
    };
  }
}
