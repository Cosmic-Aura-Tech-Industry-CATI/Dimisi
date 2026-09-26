/**
 * DIMISI Technologies — Leads & CRM Functions
 * Connects to live Express backend API endpoints (/api/v1/leads/* and /api/v1/admin-panel/leads/*).
 */
import type {
  LeadItem,
  LeadStatus,
  LeadAnalyticsStats,
  LeadDetailsWithJourney,
} from "./leads.shared";
import { sanitizeText } from "./reviews.shared";
import {
  submitLeadApi,
  getAllAdminLeadsApi,
  getLeadDetailsApi,
  updateLeadApi,
  deleteLeadApi,
} from "../services/lead.service";

export async function submitLeadFn({
  data,
}: {
  data: {
    email: string;
    fullName?: string | undefined;
    phone?: string | undefined;
    company?: string | undefined;
    inquiryType?: string | undefined;
    source?: string | undefined;
    page?: string | undefined;
    message?: string | undefined;
    visitorId?: string | undefined;
    sessionId?: string | undefined;
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

  const created = await submitLeadApi({
    email: cleanEmail,
    fullName: cleanName || undefined,
    phone: cleanPhone || undefined,
    company: cleanCompany || undefined,
    inquiryType: cleanInquiry || undefined,
    source: cleanSource,
    page: cleanPage,
    message: cleanMessage || undefined,
    visitorId: data.visitorId || undefined,
    sessionId: data.sessionId || undefined,
  });

  return { success: true, leadId: created.id };
}

export async function getAdminLeadsFn({
  data,
}: {
  data?: {
    page?: number | undefined;
    pageSize?: number | undefined;
    status?: string | undefined;
    source?: string | undefined;
    search?: string | undefined;
    sortBy?: string | undefined;
    sortOrder?: string | undefined;
  } | undefined;
} = {}): Promise<{
  leads: LeadItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats: LeadAnalyticsStats;
}> {
  const res = await getAllAdminLeadsApi({
    page: data?.page || 1,
    pageSize: data?.pageSize || 20,
    status: data?.status,
    source: data?.source,
    search: data?.search,
    sortBy: data?.sortBy,
    sortOrder: data?.sortOrder,
  });

  return {
    leads: res.leads,
    total: res.total,
    page: res.page,
    pageSize: res.pageSize,
    totalPages: res.totalPages,
    stats: {
      totalLeads: res.stats.totalLeads ?? (res.stats as any).total ?? res.total ?? 0,
      newToday: res.stats.newToday ?? 0,
      contactedCount: res.stats.contactedCount ?? (res.stats as any).contacted ?? 0,
      convertedCount: res.stats.convertedCount ?? (res.stats as any).converted ?? 0,
      conversionRate: res.stats.conversionRate ?? 0,
    },
  };
}

export async function getAdminLeadDetailsFn({
  data,
}: {
  data: { leadId: string };
}): Promise<LeadDetailsWithJourney | null> {
  if (!data?.leadId) return null;
  try {
    return await getLeadDetailsApi(data.leadId);
  } catch (err) {
    console.warn("Failed to fetch lead details from API:", err);
    return null;
  }
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
  if (!data?.leadId) return { success: false };
  await updateLeadApi(data.leadId, {
    status: data.status,
    notes: data.notes,
  });
  return { success: true };
}

export async function deleteAdminLeadFn({
  data,
}: {
  data: { leadId: string };
}): Promise<{ success: boolean }> {
  if (!data?.leadId) return { success: false };
  await deleteLeadApi(data.leadId);
  return { success: true };
}
