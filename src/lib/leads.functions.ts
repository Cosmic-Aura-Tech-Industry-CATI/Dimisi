/**
 * DIMISI Technologies — Client-Side Leads & Inquiries Manager
 * Pure client-side implementation using local storage and in-memory state.
 */
import type {
  LeadItem,
  LeadStatus,
  LeadAnalyticsStats,
  LeadDetailsWithJourney,
} from "./leads.shared";
import { sanitizeText } from "./reviews.shared";

const STORAGE_KEY = "dimisi_leads_storage_v1";

const INITIAL_LEADS: LeadItem[] = [
  {
    id: "lead-001",
    email: "sarah.chen@innovate.ai",
    full_name: "Sarah Chen",
    phone: "+1 415 890 1234",
    company: "Innovate AI",
    inquiry_type: "enterprise_ai",
    source: "contact-page",
    page: "/contact",
    message: "Interested in custom multi-agent architecture and high-throughput LLM deployment for enterprise customer service.",
    status: "new",
    visitor_id: "vis-demo-101",
    session_id: "ses-demo-101",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "lead-002",
    email: "rajesh.patel@fintechglobal.com",
    full_name: "Rajesh Patel",
    phone: "+91 98200 12345",
    company: "FinTech Global",
    inquiry_type: "web3_system",
    source: "service-page",
    page: "/services/web3-and-blockchain",
    message: "Looking for high-frequency settlement engine and smart contract security audit.",
    status: "in_progress",
    visitor_id: "vis-demo-102",
    session_id: "ses-demo-102",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "lead-003",
    email: "elena.rostova@cloudscale.io",
    full_name: "Elena Rostova",
    phone: "+44 20 7946 0912",
    company: "CloudScale Systems",
    inquiry_type: "cloud_architecture",
    source: "work-page",
    page: "/work/astral-vault",
    message: "Need architectural consulting on Kubernetes autoscaling and microservices modernization.",
    status: "converted",
    visitor_id: "vis-demo-103",
    session_id: "ses-demo-103",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

function getStoredLeads(): LeadItem[] {
  if (typeof window === "undefined") return INITIAL_LEADS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_LEADS;
}

function saveStoredLeads(leads: LeadItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch {}
}

export async function submitLeadFn({
  data,
}: {
  data: {
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
  };
}): Promise<{ success: boolean; leadId: string }> {
  const cleanEmail = sanitizeText(data.email, 160).toLowerCase();
  const cleanName = sanitizeText(data.fullName, 120);
  const cleanPhone = sanitizeText(data.phone, 50);
  const cleanCompany = sanitizeText(data.company, 120);
  const cleanInquiry = sanitizeText(data.inquiryType, 80);
  const cleanSource = sanitizeText(data.source, 80) || "website";
  const cleanPage = sanitizeText(data.page, 200) || "/";
  const cleanMessage = sanitizeText(data.message, 3000);

  const newLead: LeadItem = {
    id: `lead-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    email: cleanEmail,
    full_name: cleanName || null,
    phone: cleanPhone || null,
    company: cleanCompany || null,
    inquiry_type: cleanInquiry || null,
    source: cleanSource,
    page: cleanPage,
    message: cleanMessage || null,
    status: "new",
    visitor_id: data.visitorId || null,
    session_id: data.sessionId || null,
    created_at: new Date().toISOString(),
  };

  const leads = getStoredLeads();
  leads.unshift(newLead);
  saveStoredLeads(leads);

  return { success: true, leadId: newLead.id };
}

export async function getAdminLeadsFn({
  data,
}: {
  data?: {
    page?: number;
    pageSize?: number;
    status?: string;
    source?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  };
} = {}): Promise<{
  leads: LeadItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats: LeadAnalyticsStats;
}> {
  let leads = getStoredLeads();

  if (data?.status && data.status !== "all") {
    leads = leads.filter((l) => l.status === data.status);
  }

  if (data?.source && data.source !== "all") {
    leads = leads.filter((l) => l.source === data.source);
  }

  if (data?.search && data.search.trim()) {
    const q = data.search.trim().toLowerCase();
    leads = leads.filter(
      (l) =>
        l.email.toLowerCase().includes(q) ||
        (l.full_name && l.full_name.toLowerCase().includes(q)) ||
        (l.company && l.company.toLowerCase().includes(q)) ||
        (l.message && l.message.toLowerCase().includes(q)),
    );
  }

  const allLeads = getStoredLeads();
  const totalLeads = allLeads.length;
  const newToday = allLeads.filter((l) => l.status === "new").length;
  const contactedCount = allLeads.filter((l) => l.status === "contacted").length;
  const convertedCount = allLeads.filter((l) => l.status === "converted").length;
  const conversionRate = totalLeads > 0 ? (convertedCount / totalLeads) * 100 : 0;

  const page = data?.page || 1;
  const pageSize = data?.pageSize || 20;
  const total = leads.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const paginated = leads.slice(start, start + pageSize);

  return {
    leads: paginated,
    total,
    page,
    pageSize,
    totalPages,
    stats: {
      totalLeads,
      newToday,
      contactedCount,
      convertedCount,
      conversionRate,
    },
  };
}

export async function getAdminLeadDetailsFn({
  data,
}: {
  data: { leadId: string };
}): Promise<LeadDetailsWithJourney | null> {
  const leads = getStoredLeads();
  const lead = leads.find((l) => l.id === data.leadId);
  if (!lead) return null;

  return {
    lead,
    visitorSession: lead.session_id
      ? {
          id: lead.session_id,
          session_id: lead.session_id,
          visitor_id: lead.visitor_id || "vis-demo",
          auth_state: "anonymous",
          first_seen_at: lead.created_at,
          last_seen_at: lead.created_at,
          started_at: lead.created_at,
          page_count: 3,
          total_duration_seconds: 145,
          initial_page: "/",
          last_page: lead.page || "/contact",
          device_category: "desktop",
          browser: "Chrome",
          os: "Windows",
          visit_count: 1,
          is_active: false,
          created_at: lead.created_at,
          updated_at: lead.created_at,
        }
      : null,
    pageJourney: [
      {
        id: "pv-1",
        page_view_id: "pv-1",
        session_id: lead.session_id || "ses-demo",
        visitor_id: lead.visitor_id || "vis-demo",
        path: "/",
        title: "Home — DIMISI Technologies",
        entered_at: lead.created_at,
        duration_seconds: 45,
        max_scroll_percent: 100,
        created_at: lead.created_at,
        updated_at: lead.created_at,
      },
      {
        id: "pv-2",
        page_view_id: "pv-2",
        session_id: lead.session_id || "ses-demo",
        visitor_id: lead.visitor_id || "vis-demo",
        path: lead.page || "/contact",
        title: "Contact Us — DIMISI Technologies",
        entered_at: lead.created_at,
        duration_seconds: 100,
        max_scroll_percent: 85,
        created_at: lead.created_at,
        updated_at: lead.created_at,
      },
    ],
  };
}

export async function updateAdminLeadStatusFn({
  data,
}: {
  data: {
    leadId: string;
    status: LeadStatus;
    notes?: string;
  };
}): Promise<{ success: boolean }> {
  const leads = getStoredLeads();
  const index = leads.findIndex((l) => l.id === data.leadId);
  if (index !== -1) {
    leads[index].status = data.status;
    if (data.notes !== undefined) leads[index].notes = data.notes;
    leads[index].updated_at = new Date().toISOString();
    saveStoredLeads(leads);
  }
  return { success: true };
}

export async function deleteAdminLeadFn({
  data,
}: {
  data: { leadId: string };
}): Promise<{ success: boolean }> {
  let leads = getStoredLeads();
  leads = leads.filter((l) => l.id !== data.leadId);
  saveStoredLeads(leads);
  return { success: true };
}
