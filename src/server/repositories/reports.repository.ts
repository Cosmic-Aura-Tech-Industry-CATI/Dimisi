/**
 * Review Reports and Settings Repository — MongoDB Data Access Layer
 */
import {
  getCollection,
  COLLECTIONS,
  type MongoReport,
  type MongoSettings,
} from "../db/collections";
import type { ReviewReport, ReviewSettings } from "@/lib/reviews.shared";

export class ReportsRepository {
  async getAllReports(): Promise<ReviewReport[]> {
    const col = await getCollection<MongoReport>(COLLECTIONS.REPORTS);
    if (!col) return [];
    const docs = await col.find().sort({ created_at: -1 }).toArray();
    return docs.map(({ _id, ...rest }) => rest as ReviewReport);
  }

  async insertReport(report: ReviewReport): Promise<ReviewReport> {
    const col = await getCollection<MongoReport>(COLLECTIONS.REPORTS);
    if (col) {
      await col.updateOne({ id: report.id }, { $set: report }, { upsert: true });
    }
    return report;
  }

  async resolveReport(id: string, status: "resolved" | "dismissed", resolvedBy: string): Promise<boolean> {
    const col = await getCollection<MongoReport>(COLLECTIONS.REPORTS);
    if (!col) return false;
    const res = await col.updateOne(
      { id },
      {
        $set: {
          status,
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy,
        },
      },
    );
    return res.modifiedCount > 0;
  }

  async getSettings(): Promise<ReviewSettings | null> {
    const col = await getCollection<MongoSettings>(COLLECTIONS.SETTINGS);
    if (!col) return null;
    const doc = await col.findOne({ id: true });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return rest as ReviewSettings;
  }

  async updateSettings(settings: Partial<ReviewSettings>): Promise<ReviewSettings> {
    const col = await getCollection<MongoSettings>(COLLECTIONS.SETTINGS);
    const now = new Date().toISOString();
    const doc = {
      id: true,
      notify_on_submit: true,
      notify_on_approve: true,
      notify_on_reject: false,
      notify_on_report: true,
      notify_campaign_summary: false,
      notify_email: "hello@dimisi.in",
      ...settings,
      updated_at: now,
    };
    if (col) {
      await col.updateOne({ id: true }, { $set: doc }, { upsert: true });
    }
    return doc as ReviewSettings;
  }
}

export const reportsRepository = new ReportsRepository();
