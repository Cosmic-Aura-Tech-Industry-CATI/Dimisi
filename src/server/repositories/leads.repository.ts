/**
 * Leads Repository — MongoDB Data Access Layer
 * Supports lead lifecycle status, search, pagination, and visitor intelligence linking.
 */
import {
  getCollection,
  COLLECTIONS,
  type MongoLead,
  type LeadStatus,
  type MongoVisitorSession,
  type MongoPageView,
} from "../db/collections";
import { visitorsRepository } from "./visitors.repository";

export interface LeadInput {
  id?: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  company?: string | null;
  inquiry_type?: string | null;
  source?: string | null;
  page?: string | null;
  message?: string | null;
  status?: LeadStatus;
  visitor_id?: string | null;
  session_id?: string | null;
  notes?: string | null;
  created_at?: string;
}

export interface LeadFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | LeadStatus;
  source?: string;
  sortBy?: "created_at" | "full_name" | "email" | "status";
  sortOrder?: "asc" | "desc";
}

export interface LeadWithContext extends MongoLead {
  visitorSession?: MongoVisitorSession | null;
  pageJourney?: MongoPageView[];
}

export class LeadsRepository {
  /**
   * Insert or update a lead record with optional visitor context.
   */
  async insertLead(lead: LeadInput): Promise<MongoLead> {
    const col = await getCollection<MongoLead>(COLLECTIONS.LEADS);
    const now = new Date().toISOString();
    const doc: MongoLead = {
      id: lead.id || crypto.randomUUID(),
      email: lead.email.trim().toLowerCase(),
      full_name: lead.full_name?.trim() || null,
      phone: lead.phone?.trim() || null,
      company: lead.company?.trim() || null,
      inquiry_type: lead.inquiry_type?.trim() || null,
      source: lead.source || "contact_page",
      page: lead.page || "/contact",
      message: lead.message || null,
      status: lead.status || "new",
      visitor_id: lead.visitor_id || null,
      session_id: lead.session_id || null,
      notes: lead.notes || null,
      created_at: lead.created_at || now,
      updated_at: now,
    };

    if (col) {
      await col.updateOne({ id: doc.id }, { $set: doc }, { upsert: true });
    }
    return doc;
  }

  /**
   * Paginated, searchable, and filterable retrieval of leads.
   */
  async getLeads(options: LeadFilterOptions = {}): Promise<{
    leads: MongoLead[];
    total: number;
    page: number;
    totalPages: number;
    newCount: number;
  }> {
    const col = await getCollection<MongoLead>(COLLECTIONS.LEADS);
    if (!col) {
      return { leads: [], total: 0, page: 1, totalPages: 1, newCount: 0 };
    }

    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    // Search query
    if (options.search?.trim()) {
      const searchRegex = new RegExp(options.search.trim(), "i");
      query.$or = [
        { full_name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { company: searchRegex },
        { message: searchRegex },
        { source: searchRegex },
        { page: searchRegex },
      ];
    }

    // Filter by status
    if (options.status && options.status !== "all") {
      query.status = options.status;
    }

    // Filter by source
    if (options.source && options.source !== "all") {
      query.source = options.source;
    }

    const sortField = options.sortBy || "created_at";
    const sortDir = options.sortOrder === "asc" ? 1 : -1;

    const [docs, total, newCount] = await Promise.all([
      col.find(query).sort({ [sortField]: sortDir }).skip(skip).limit(limit).toArray(),
      col.countDocuments(query),
      col.countDocuments({ status: "new" }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const leads = docs.map(({ _id, ...rest }) => rest as MongoLead);

    return { leads, total, page, totalPages, newCount };
  }

  /**
   * Retrieve all leads (for backward compatibility and export).
   */
  async getAllLeads(limit: number = 200): Promise<MongoLead[]> {
    const col = await getCollection<MongoLead>(COLLECTIONS.LEADS);
    if (!col) return [];
    const docs = await col.find().sort({ created_at: -1 }).limit(limit).toArray();
    return docs.map(({ _id, ...rest }) => rest as MongoLead);
  }

  /**
   * Retrieve a single lead with full visitor session context and chronological page journey.
   */
  async getLeadWithVisitorContext(leadId: string): Promise<LeadWithContext | null> {
    const col = await getCollection<MongoLead>(COLLECTIONS.LEADS);
    if (!col) return null;

    const lead = await col.findOne({ id: leadId });
    if (!lead) return null;

    const { _id, ...cleanLead } = lead;
    let visitorSession: MongoVisitorSession | null = null;
    let pageJourney: MongoPageView[] = [];

    if (cleanLead.session_id || cleanLead.visitor_id) {
      const sessionsCol = await getCollection<MongoVisitorSession>(COLLECTIONS.VISITOR_SESSIONS);
      if (sessionsCol) {
        if (cleanLead.session_id) {
          const s = await sessionsCol.findOne({ session_id: cleanLead.session_id });
          if (s) visitorSession = { ...s, _id: undefined } as MongoVisitorSession;
        }
        if (!visitorSession && cleanLead.visitor_id) {
          const s = await sessionsCol.findOne({ visitor_id: cleanLead.visitor_id }, { sort: { last_seen_at: -1 } });
          if (s) visitorSession = { ...s, _id: undefined } as MongoVisitorSession;
        }
      }

      pageJourney = await visitorsRepository.getVisitorJourney(cleanLead.visitor_id, cleanLead.session_id);
    }

    return {
      ...(cleanLead as MongoLead),
      visitorSession,
      pageJourney,
    };
  }

  /**
   * Update lead status (e.g. new -> contacted -> converted).
   */
  async updateLeadStatus(leadId: string, status: LeadStatus, notes?: string | null): Promise<boolean> {
    const col = await getCollection<MongoLead>(COLLECTIONS.LEADS);
    if (!col) return false;

    const updateDoc: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (typeof notes !== "undefined") {
      updateDoc.notes = notes;
    }

    const res = await col.updateOne({ id: leadId }, { $set: updateDoc });
    return res.matchedCount > 0;
  }

  /**
   * Delete a lead by ID.
   */
  async deleteLead(leadId: string): Promise<boolean> {
    const col = await getCollection<MongoLead>(COLLECTIONS.LEADS);
    if (!col) return false;
    const res = await col.deleteOne({ id: leadId });
    return res.deletedCount > 0;
  }

  /**
   * Aggregate statistics for lead overview cards.
   */
  async getLeadStats(): Promise<{
    totalLeads: number;
    newToday: number;
    contactedCount: number;
    convertedCount: number;
    conversionRate: number;
  }> {
    const col = await getCollection<MongoLead>(COLLECTIONS.LEADS);
    if (!col) {
      return { totalLeads: 0, newToday: 0, contactedCount: 0, convertedCount: 0, conversionRate: 0 };
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalLeads, newToday, contactedCount, convertedCount, visitorStats] = await Promise.all([
      col.countDocuments(),
      col.countDocuments({ created_at: { $gte: startOfDay.toISOString() } }),
      col.countDocuments({ status: "contacted" }),
      col.countDocuments({ status: "converted" }),
      visitorsRepository.getVisitorStats(),
    ]);

    const totalVisitors = visitorStats.totalSessions || 1;
    const conversionRate = Math.round((totalLeads / totalVisitors) * 1000) / 10;

    return {
      totalLeads,
      newToday,
      contactedCount,
      convertedCount,
      conversionRate,
    };
  }

  async countLeads(): Promise<number> {
    const col = await getCollection<MongoLead>(COLLECTIONS.LEADS);
    if (!col) return 0;
    return col.countDocuments();
  }

  async countLeadsToday(): Promise<number> {
    const col = await getCollection<MongoLead>(COLLECTIONS.LEADS);
    if (!col) return 0;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return col.countDocuments({ created_at: { $gte: startOfDay.toISOString() } });
  }
}

export const leadsRepository = new LeadsRepository();
