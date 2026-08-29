/**
 * Leads Management — Server Functions
 */
import { createServerFn } from "@tanstack/react-start";
import { leadsRepository } from "@/server/repositories/leads.repository";
import { requireAdminAuth } from "@/server/auth/auth-middleware";
import { assertPermission } from "@/../dimisi-admin/server/authorization.server";
import { sanitizeText } from "./reviews.shared";
import type {
  LeadItem,
  LeadStatus,
  LeadDetailsWithJourney,
  LeadAnalyticsStats,
  VisitorSessionItem,
  PageViewItem,
} from "./leads.shared";

/**
 * Public / User: Submit a lead (Contact form, Signup lead, Campaign lead).
 */
export const submitLeadFn = createServerFn({ method: "POST" })
  .validator(
    (input: {
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
    }) => ({
      email: sanitizeText(input.email, 160).toLowerCase(),
      fullName: input.fullName ? sanitizeText(input.fullName, 120) : undefined,
      phone: input.phone ? sanitizeText(input.phone, 30) : undefined,
      company: input.company ? sanitizeText(input.company, 120) : undefined,
      inquiryType: input.inquiryType ? sanitizeText(input.inquiryType, 100) : undefined,
      source: input.source ? sanitizeText(input.source, 60) : "contact_page",
      page: input.page ? sanitizeText(input.page, 100) : "/contact",
      message: input.message ? sanitizeText(input.message, 3000) : undefined,
      visitorId: input.visitorId ? sanitizeText(input.visitorId, 64) : undefined,
      sessionId: input.sessionId ? sanitizeText(input.sessionId, 64) : undefined,
    }),
  )
  .handler(async ({ data }): Promise<{ success: boolean; id: string }> => {
    if (!data.email) throw new Error("Email address is required.");

    const saved = await leadsRepository.insertLead({
      email: data.email,
      full_name: data.fullName || null,
      phone: data.phone || null,
      company: data.company || null,
      inquiry_type: data.inquiryType || null,
      source: data.source || "contact_page",
      page: data.page || "/contact",
      message: data.message || null,
      status: "new",
      visitor_id: data.visitorId || null,
      session_id: data.sessionId || null,
    });

    return { success: true, id: saved.id };
  });

/**
 * Admin: Retrieve paginated, searchable, and filtered leads.
 */
export const getAdminLeadsFn = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .validator((input: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "all" | LeadStatus;
    source?: string;
    sortBy?: "created_at" | "full_name" | "email" | "status";
    sortOrder?: "asc" | "desc";
  }) => input)
  .handler(async ({ data, context }): Promise<{
    leads: LeadItem[];
    total: number;
    page: number;
    totalPages: number;
    newCount: number;
    stats: LeadAnalyticsStats;
  }> => {
    await assertPermission(context, "leads.view");

    const [leadsRes, stats] = await Promise.all([
      leadsRepository.getLeads({
        page: Number(data?.page) || 1,
        limit: Number(data?.limit) || 20,
        search: data?.search || "",
        status: data?.status || "all",
        source: data?.source || "all",
        sortBy: data?.sortBy || "created_at",
        sortOrder: data?.sortOrder || "desc",
      }),
      leadsRepository.getLeadStats(),
    ]);

    return {
      leads: leadsRes.leads as LeadItem[],
      total: leadsRes.total,
      page: leadsRes.page,
      totalPages: leadsRes.totalPages,
      newCount: leadsRes.newCount,
      stats,
    };
  });

/**
 * Admin: Get complete single lead details with linked visitor intelligence & page journey.
 */
export const getAdminLeadDetailsFn = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .validator((input: { leadId: string }) => ({
    leadId: String(input.leadId ?? "").trim(),
  }))
  .handler(async ({ data, context }): Promise<LeadDetailsWithJourney | null> => {
    await assertPermission(context, "leads.view");
    if (!data.leadId) return null;

    const leadWithContext = await leadsRepository.getLeadWithVisitorContext(data.leadId);
    if (!leadWithContext) return null;

    return {
      lead: {
        id: leadWithContext.id,
        email: leadWithContext.email,
        full_name: leadWithContext.full_name,
        phone: leadWithContext.phone,
        company: leadWithContext.company,
        inquiry_type: leadWithContext.inquiry_type,
        source: leadWithContext.source,
        page: leadWithContext.page,
        message: leadWithContext.message,
        status: leadWithContext.status || "new",
        visitor_id: leadWithContext.visitor_id,
        session_id: leadWithContext.session_id,
        notes: leadWithContext.notes,
        created_at: leadWithContext.created_at,
        updated_at: leadWithContext.updated_at,
      },
      visitorSession: (leadWithContext.visitorSession as VisitorSessionItem) || null,
      pageJourney: (leadWithContext.pageJourney as PageViewItem[]) || [],
    };
  });

/**
 * Admin: Update lead status (e.g. new -> contacted -> converted) and optional notes.
 */
export const updateAdminLeadStatusFn = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((input: {
    leadId: string;
    status: LeadStatus;
    notes?: string;
  }) => ({
    leadId: String(input.leadId ?? "").trim(),
    status: input.status,
    notes: typeof input.notes === "string" ? sanitizeText(input.notes, 2000) : undefined,
  }))
  .handler(async ({ data, context }): Promise<{ success: boolean }> => {
    await assertPermission(context, "leads.view");
    const ok = await leadsRepository.updateLeadStatus(data.leadId, data.status, data.notes);
    return { success: ok };
  });

/**
 * Admin: Delete a lead permanently.
 */
export const deleteAdminLeadFn = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((input: { leadId: string }) => ({
    leadId: String(input.leadId ?? "").trim(),
  }))
  .handler(async ({ data, context }): Promise<{ success: boolean }> => {
    await assertPermission(context, "leads.view");
    const ok = await leadsRepository.deleteLead(data.leadId);
    return { success: ok };
  });
