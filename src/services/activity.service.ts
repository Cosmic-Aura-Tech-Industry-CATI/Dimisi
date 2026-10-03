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
    empId?: string;
    employeeId?: string;
  } | string;
  action: string;
  entityType?: string;
  entityId?: string;
  status?: "SUCCESS" | "FAILED" | "success" | "failed";
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
  if (norm.includes("SETTING") || norm.includes("CONFIG")) return "Settings";
  if (norm.includes("PROFILE") || norm.includes("PASSWORD")) return "Profile";
  if (norm.includes("TASK") || norm.includes("WORKSPACE")) return "Workspace";
  return "Settings";
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

// Known registry of organization administrators & directors to resolve identities cleanly in Frontend
const KNOWN_ADMIN_DIRECTORY: Record<
  string,
  { empId: string; role: AdminRole; name: string }
> = {
  "swatantrasingh308@gmail.com": {
    empId: "DMSEMP260002",
    role: "super_admin",
    name: "Swatantra Singh",
  },
  "6a943c347bc0f3820907ca8f": {
    empId: "DMSEMP260002",
    role: "super_admin",
    name: "Swatantra Singh",
  },
  "dixitshikhar004@gmail.com": {
    empId: "DMSEMP260001",
    role: "admin",
    name: "Shikhar",
  },
  "6a6de96c647a47da841f6304": {
    empId: "DMSEMP260001",
    role: "admin",
    name: "Shikhar",
  },
  "mridulmishra2117@gmail.com": {
    empId: "DMSEMP260005",
    role: "super_admin",
    name: "Mridul Mishra",
  },
  "2022bds017@axiscolleges.in": {
    empId: "DMSEMP260005",
    role: "super_admin",
    name: "Mridul Mishra",
  },
  "6a76e847be868d2b3387c31b": {
    empId: "DMSEMP260005",
    role: "super_admin",
    name: "Mridul Mishra",
  },
  "h2307190100015@gmail.com": {
    empId: "DMSEMP260010",
    role: "editor",
    name: "Amit Kumar",
  },
  "6a8efd99dd739a9233d866bc": {
    empId: "DMSEMP260010",
    role: "editor",
    name: "Amit Kumar",
  },
  "prashantumrao4242@gmail.com": {
    empId: "DMSEMP260012",
    role: "editor",
    name: "Prashant Umrao",
  },
  "6a9a5e976076e98d1416a7c9": {
    empId: "DMSEMP260012",
    role: "editor",
    name: "Prashant Umrao",
  },
  "mnishkarsh71@gmail.com": {
    empId: "DMSEMP260003",
    role: "admin",
    name: "Nishkarsh Mishra",
  },
  "6a9a8f0bf707cf8b7d7d3464": {
    empId: "DMSEMP260003",
    role: "admin",
    name: "Nishkarsh Mishra",
  },
  "harshmishra200529@gmail.com": {
    empId: "DMSEMP260013",
    role: "editor",
    name: "Harsh Mishra",
  },
  "6abc8fd68cf85e7358bc8d12": {
    empId: "DMSEMP260013",
    role: "editor",
    name: "Harsh Mishra",
  },
};

export function toAdminLogModel(doc: BackendActivityLogDoc, adminDirectory?: any[]): AdminLog {
  const d = doc.createdAt ? new Date(doc.createdAt) : new Date();
  let actorName = "Admin User";
  let actorEmail = "admin@dimisi.tech";
  let employeeId = "EMP-001";
  let accountId = "usr-admin";
  let role: AdminRole = "admin";
  let avatar: string | undefined = undefined;

  if (doc.actorId && typeof doc.actorId === "object") {
    actorName = doc.actorId.name || doc.actorId.email || "Admin User";
    actorEmail = doc.actorId.email || "admin@dimisi.tech";
    accountId = String(doc.actorId._id || "usr-admin");
    if (doc.actorId.avatar) {
      avatar = doc.actorId.avatar;
    }

    const emp =
      doc.actorId.empId ||
      doc.actorId.employeeId ||
      (doc.metadata?.employeeId) ||
      (doc.metadata?.empId) ||
      null;

    if (emp) {
      employeeId = String(emp);
    }

    if (doc.actorId.role && ["super_admin", "admin", "editor", "moderator", "analyst"].includes(doc.actorId.role)) {
      role = doc.actorId.role as AdminRole;
    }
  } else if (doc.actorId) {
    accountId = String(doc.actorId);
    const emp = (doc.metadata?.employeeId) || (doc.metadata?.empId);
    if (emp) {
      employeeId = String(emp);
    }
  }

  // 1. Dynamic lookup against passed adminDirectory (from AdminPanel.tsx)
  if (Array.isArray(adminDirectory) && adminDirectory.length > 0) {
    const cleanMail = actorEmail.toLowerCase();
    const match = adminDirectory.find(
      (a: any) =>
        (a?.email && a.email.toLowerCase() === cleanMail) ||
        (a?.user_id && a.user_id === accountId)
    );
    if (match) {
      if (match.emp_id || match.employee_id) {
        employeeId = String(match.emp_id || match.employee_id);
      }
      if (match.role && ["super_admin", "admin", "editor", "moderator", "analyst"].includes(match.role)) {
        role = match.role as AdminRole;
      }
      if (match.full_name && (!actorName || actorName === "Admin User")) {
        actorName = match.full_name;
      }
    }
  }

  // 2. Static directory lookup for known organizational accounts (Swatantra Singh, Shikhar, Mridul, etc.)
  const known =
    KNOWN_ADMIN_DIRECTORY[actorEmail.toLowerCase()] ||
    KNOWN_ADMIN_DIRECTORY[accountId];
  if (known) {
    if (employeeId === "EMP-001") {
      employeeId = known.empId;
    }
    role = known.role;
    if (!actorName || actorName === "Admin User") {
      actorName = known.name;
    }
  }

  // 3. Fallback for unknown users: Avoid dummy "EMP-001", generate clean user ID
  if (employeeId === "EMP-001") {
    if (accountId.startsWith("usr-")) {
      employeeId = accountId;
    } else if (/^[0-9a-fA-F]{24}$/.test(accountId)) {
      employeeId = `DMS-${accountId.slice(-6).toUpperCase()}`;
    }
  }

  const rawStatus = (doc.status || "success").toUpperCase();
  const status: LogStatus = rawStatus === "FAILED" ? "FAILED" : "SUCCESS";
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
    actionRaw: doc.action,
    module: mod,
    entityTypeRaw: doc.entityType,
    status,
    scope: doc.scope,
    details: doc.metadata?.subtext || `${doc.action} performed on ${doc.entityType || "resource"}`,
    ipAddress: doc.metadata?.ip || "127.0.0.1",
    userAgent: doc.metadata?.useragent || "Web Client",
  };

  if (avatar) {
    log.avatar = avatar;
  }

  if (doc.entityId) {
    log.targetResource = String(doc.entityId);
  }

  if (doc.metadata) {
    log.metadata = doc.metadata;
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
  admins?: any[];
  /** AbortSignal: Allows useEffect cleanup/cleaner function to cancel in-flight requests on filter change or unmount */
  signal?: AbortSignal;
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
    // Pass signal conditionally using spread syntax:
    // exactOptionalPropertyTypes: true rule ke mutabik agar signal ho tabhi property add hogi,
    // warna property object me nahi jayegi (TS2379 strict warning fix).
    const res = await apiRequest<any>(
      `/api/v1/activity/panel${query}`,
      {
        method: "GET",
        cacheTtlMs: 0,
        ...(filters.signal ? { signal: filters.signal } : {}),
      },
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
      adminLogs: rawLogs.map((doc) => toAdminLogModel(doc, filters.admins)),
      total,
      page,
      totalPages,
    };
  } catch (err: any) {
    // If request was aborted by cleaner function (user changed filter/tab), do not log warning
    if (err?.name === "AbortError" || filters.signal?.aborted) {
      throw err;
    }
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
