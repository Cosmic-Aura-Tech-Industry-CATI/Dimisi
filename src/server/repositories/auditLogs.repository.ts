/**
 * Audit Logs Repository — MongoDB Compliance and Governance Layer
 */
import { getCollection, COLLECTIONS, type MongoAuditLog } from "../db/collections";
import type { AdminAuditLog } from "@/lib/reviews.shared";

export class AuditLogsRepository {
  async log(entry: {
    admin_id?: string | null;
    action: string;
    entity_type: string;
    entity_id: string;
    old_value?: any;
    new_value?: any;
    ip_address?: string | null;
  }): Promise<AdminAuditLog> {
    const col = await getCollection<MongoAuditLog>(COLLECTIONS.AUDIT_LOGS);
    const doc: AdminAuditLog = {
      id: crypto.randomUUID(),
      admin_id: entry.admin_id || "admin",
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      old_value: entry.old_value !== undefined ? entry.old_value : null,
      new_value: entry.new_value !== undefined ? entry.new_value : null,
      ip_address: entry.ip_address || "127.0.0.1",
      created_at: new Date().toISOString(),
    };

    if (col) {
      await col.insertOne(doc as MongoAuditLog);
    }
    return doc;
  }

  async getRecentLogs(limit: number = 200): Promise<AdminAuditLog[]> {
    const col = await getCollection<MongoAuditLog>(COLLECTIONS.AUDIT_LOGS);
    if (!col) return [];
    const docs = await col.find().sort({ created_at: -1 }).limit(limit).toArray();
    return docs.map(({ _id, ...rest }) => rest as AdminAuditLog);
  }
}

export const auditLogsRepository = new AuditLogsRepository();
