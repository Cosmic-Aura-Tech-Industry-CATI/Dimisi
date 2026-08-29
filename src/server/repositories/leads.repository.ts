/**
 * Leads Repository — MongoDB Data Access Layer
 */
import { getCollection, COLLECTIONS, type MongoLead } from "../db/collections";

export interface LeadInput {
  id?: string;
  email: string;
  full_name?: string | null;
  source?: string | null;
  page?: string | null;
  message?: string | null;
  created_at?: string;
}

export class LeadsRepository {
  async insertLead(lead: LeadInput): Promise<MongoLead> {
    const col = await getCollection<MongoLead>(COLLECTIONS.LEADS);
    const doc: MongoLead = {
      id: lead.id || crypto.randomUUID(),
      email: lead.email.trim().toLowerCase(),
      full_name: lead.full_name?.trim() || null,
      source: lead.source || "contact_page",
      page: lead.page || "/contact",
      message: lead.message || null,
      created_at: lead.created_at || new Date().toISOString(),
    };

    if (col) {
      await col.updateOne({ id: doc.id }, { $set: doc }, { upsert: true });
    }
    return doc;
  }

  async getAllLeads(limit: number = 200): Promise<MongoLead[]> {
    const col = await getCollection<MongoLead>(COLLECTIONS.LEADS);
    if (!col) return [];
    const docs = await col.find().sort({ created_at: -1 }).limit(limit).toArray();
    return docs.map(({ _id, ...rest }) => rest as MongoLead);
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
