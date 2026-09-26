/**
 * DIMISI Admin — Leads CRM & Contact Inquiries Express API Service
 * Handles Public Lead Submissions, Admin Leads Management, Details, and Notes
 * against the Express backend API (/api/v1/leads/* and /api/v1/admin-panel/leads/*).
 */
import { apiRequest, ApiError, clearApiCache } from "./apiClient";
import type {
  LeadItem,
  LeadStatus,
  LeadAnalyticsStats,
  LeadDetailsWithJourney,
} from "@/lib/leads.shared";

export interface BackendLeadDoc {
  _id: string;
  fullName?: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  inquiryType?: string;
  source?: string;
  page?: string;
  message?: string;
  status: "new" | "contacted" | "in_progress" | "converted" | "archived";
  notes?: string;
  visitorId?: string | null;
  sessionId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendVisitorSessionDoc {
  _id: string;
  sessionId: string;
  visitorId: string;
  deviceCategory?: "desktop" | "mobile" | "tablet" | "unknown";
  browser?: string;
  os?: string;
  screenResolution?: string;
  initialPage?: string;
  lastPage?: string;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  pageCount?: number;
  totalDurationSeconds?: number;
  visitCount?: number;
  isActive?: boolean;
  lastSeenAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendLeadListResponse {
  status?: string;
  results?: number;
  data?: {
    leads?: BackendLeadDoc[];
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
    stats?: {
      totalLeads?: number;
      newToday?: number;
      contactedCount?: number;
      convertedCount?: number;
      conversionRate?: number;
    };
  };
  leads?: BackendLeadDoc[];
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  stats?: any;
}

export interface BackendLeadSingleResponse {
  status?: string;
  message?: string;
  data?: {
    lead?: BackendLeadDoc;
    visitorSession?: BackendVisitorSessionDoc | null;
  };
  lead?: BackendLeadDoc;
  visitorSession?: BackendVisitorSessionDoc | null;
}

export interface SubmitLeadPayload {
  email: string;
  fullName?: string;
  phone?: string;
  company?: string;
  inquiryType?: string;
  source?: string;
  page?: string;
  message?: string;
  visitorId?: string;
  sessionId?: string;
}

export interface UpdateLeadPayload {
  status?: LeadStatus;
  notes?: string;
}

/**
 * Normalizes backend ILead document into frontend LeadItem model.
 */
export function normalizeBackendLead(doc: BackendLeadDoc): LeadItem {
  return {
    id: String(doc._id),
    email: doc.email || "",
    full_name: doc.fullName || null,
    phone: doc.phone || null,
    company: doc.company || null,
    inquiry_type: doc.inquiryType || "general",
    source: doc.source || "website",
    page: doc.page || "/contact",
    message: doc.message || "",
    status: (doc.status as LeadStatus) || "new",
    visitor_id: doc.visitorId || null,
    session_id: doc.sessionId || null,
    created_at: doc.createdAt || new Date().toISOString(),
  };
}

/**
 * 1. SUBMIT PUBLIC LEAD / INQUIRY
 * Endpoint: POST /api/v1/leads/submit
 */
export async function submitLeadApi(payload: SubmitLeadPayload): Promise<LeadItem> {
  const res = await apiRequest<{
    status?: string;
    message?: string;
    data?: { leadId?: string; lead?: BackendLeadDoc };
    lead?: BackendLeadDoc;
  }>("/api/v1/leads/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  clearApiCache("/api/v1/admin-panel/leads");

  const leadDoc = res?.data?.lead || res?.lead;
  if (leadDoc) {
    return normalizeBackendLead(leadDoc);
  }
  throw new Error(res?.message || "Failed to submit lead inquiry.");
}

/**
 * 2. GET ALL ADMIN LEADS
 * Endpoint: GET /api/v1/admin-panel/leads/all
 */
export async function getAllAdminLeadsApi(filters: {
  page?: number;
  pageSize?: number;
  status?: string;
  source?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
} = {}): Promise<{
  leads: LeadItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats: LeadAnalyticsStats;
}> {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.source && filters.source !== "all") params.set("source", filters.source);
  if (filters.search) params.set("search", filters.search);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

  const query = params.toString() ? `?${params.toString()}` : "";

  const res = await apiRequest<BackendLeadListResponse>(
    `/api/v1/admin-panel/leads/all${query}`,
    { method: "GET" },
  );

  const rawLeads = Array.isArray(res?.data?.leads)
    ? res.data.leads
    : Array.isArray(res?.leads)
      ? res.leads
      : [];

  const leads = rawLeads.map(normalizeBackendLead);

  const total = res?.data?.total ?? res?.total ?? leads.length;
  const page = res?.data?.page ?? res?.page ?? filters.page ?? 1;
  const pageSize = res?.data?.pageSize ?? res?.pageSize ?? filters.pageSize ?? 15;
  const totalPages = res?.data?.totalPages ?? res?.totalPages ?? Math.max(1, Math.ceil(total / pageSize));

  const backendStats = res?.data?.stats || res?.stats || {
    totalLeads: total,
    newToday: 0,
    contactedCount: 0,
    convertedCount: 0,
    conversionRate: 0,
  };

  const stats: LeadAnalyticsStats = {
    totalLeads: backendStats.totalLeads ?? total,
    newToday: backendStats.newToday ?? 0,
    contactedCount: backendStats.contactedCount ?? backendStats.contactedLeads ?? leads.filter((l) => l.status === "contacted").length,
    convertedCount: backendStats.convertedCount ?? leads.filter((l) => l.status === "converted").length,
    conversionRate: backendStats.conversionRate ?? (total > 0 ? Math.round(((backendStats.convertedCount || 0) / total) * 100) : 0),
  };

  return {
    leads,
    total,
    page,
    pageSize,
    totalPages,
    stats,
  };
}

/**
 * 3. GET LEAD DETAILS & JOURNEY
 * Endpoint: GET /api/v1/admin-panel/leads/:id
 */
export async function getLeadDetailsApi(id: string): Promise<LeadDetailsWithJourney> {
  if (!id) throw new Error("Lead ID is required.");

  const res = await apiRequest<BackendLeadSingleResponse>(
    `/api/v1/admin-panel/leads/${encodeURIComponent(id)}`,
    { method: "GET" },
  );

  const leadDoc = res?.data?.lead || res?.lead;
  if (!leadDoc) {
    throw new Error(res?.message || "Lead not found.");
  }

  const lead = normalizeBackendLead(leadDoc);
  const session = res?.data?.visitorSession !== undefined ? res.data.visitorSession : res?.visitorSession;

  const visitorSession: VisitorSessionItem | null = session
    ? {
        id: session._id || `sess-${lead.id}`,
        session_id: session.sessionId || `sess-${lead.id}`,
        visitor_id: session.visitorId || `vis-${lead.id}`,
        auth_state: "anonymous",
        first_seen_at: session.createdAt || lead.created_at,
        last_seen_at: session.lastSeenAt || lead.created_at,
        started_at: session.createdAt || lead.created_at,
        page_count: session.pageCount || 1,
        total_duration_seconds: session.totalDurationSeconds || 0,
        initial_page: session.initialPage || "/contact",
        last_page: session.lastPage || "/contact",
        referrer: session.referrer || null,
        utm_source: session.utmSource || null,
        utm_medium: session.utmMedium || null,
        utm_campaign: session.utmCampaign || null,
        device_category: ((session.deviceCategory as any) || "desktop"),
        browser: session.browser || "Unknown",
        os: session.os || "Unknown",
        screen_resolution: session.screenResolution || null,
        visit_count: session.visitCount || 1,
        is_active: false,
        created_at: session.createdAt || lead.created_at,
        updated_at: session.updatedAt || lead.created_at,
      }
    : null;

  const pageJourney: PageViewItem[] = session?.initialPage
    ? [
        {
          id: `pv-${lead.id}-1`,
          page_view_id: `pv-${lead.id}-1`,
          session_id: session.sessionId || `sess-${lead.id}`,
          visitor_id: session.visitorId || `vis-${lead.id}`,
          path: session.initialPage,
          title: "Inquiry Page",
          referrer: session.referrer || null,
          entered_at: session.createdAt || lead.created_at,
          duration_seconds: session.totalDurationSeconds || 0,
          max_scroll_percent: 100,
          created_at: session.createdAt || lead.created_at,
          updated_at: session.updatedAt || lead.created_at,
        },
      ]
    : [];

  return {
    lead,
    visitorSession,
    pageJourney,
  };
}

/**
 * 4. UPDATE LEAD STATUS & NOTES
 * Endpoint: PATCH /api/v1/admin-panel/leads/:id/update
 */
export async function updateLeadApi(id: string, payload: UpdateLeadPayload): Promise<LeadItem> {
  if (!id) throw new Error("Lead ID is required.");

  const res = await apiRequest<{
    status?: string;
    message?: string;
    data?: { lead?: BackendLeadDoc };
    lead?: BackendLeadDoc;
  }>(
    `/api/v1/admin-panel/leads/${encodeURIComponent(id)}/update`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  clearApiCache("/api/v1/admin-panel/leads");

  const leadDoc = res?.data?.lead || res?.lead;
  if (leadDoc) {
    return normalizeBackendLead(leadDoc);
  }
  throw new Error(res?.message || "Failed to update lead.");
}

/**
 * 5. DELETE LEAD
 * Endpoint: DELETE /api/v1/admin-panel/leads/:id/delete
 */
export async function deleteLeadApi(id: string): Promise<boolean> {
  if (!id) throw new Error("Lead ID is required.");

  const res = await apiRequest<{ status?: string; message?: string }>(
    `/api/v1/admin-panel/leads/${encodeURIComponent(id)}/delete`,
    {
      method: "DELETE",
    },
  );

  clearApiCache("/api/v1/admin-panel/leads");
  return res?.status === "success" || true;
}
