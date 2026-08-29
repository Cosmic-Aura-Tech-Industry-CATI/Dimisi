/**
 * Review Campaigns Repository — MongoDB Data Access Layer
 */
import { getCollection, COLLECTIONS, type MongoCampaign } from "../db/collections";
import type { ReviewCampaign } from "@/lib/reviews.shared";

export class CampaignsRepository {
  /**
   * Find an active, valid campaign by slug (used for public `/review/$slug` and QR scans).
   */
  async findActiveBySlug(slug: string): Promise<ReviewCampaign | null> {
    const col = await getCollection<MongoCampaign>(COLLECTIONS.CAMPAIGNS);
    if (!col) return null;

    const doc = await col.findOne({ slug: slug.toLowerCase() });
    if (!doc) return null;

    if (!doc.is_active) return null;
    if (doc.expires_at && new Date(doc.expires_at).getTime() < Date.now()) {
      return null;
    }

    const { _id, ...rest } = doc;
    return rest as ReviewCampaign;
  }

  /**
   * Find any campaign by slug (regardless of active status).
   */
  async findBySlug(slug: string): Promise<ReviewCampaign | null> {
    const col = await getCollection<MongoCampaign>(COLLECTIONS.CAMPAIGNS);
    if (!col) return null;
    const doc = await col.findOne({ slug: slug.toLowerCase() });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return rest as ReviewCampaign;
  }

  /**
   * Find campaign by ID.
   */
  async findById(id: string): Promise<ReviewCampaign | null> {
    const col = await getCollection<MongoCampaign>(COLLECTIONS.CAMPAIGNS);
    if (!col) return null;
    const doc = await col.findOne({ id });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return rest as ReviewCampaign;
  }

  /**
   * Admin: List all review campaigns ordered by creation date descending.
   */
  async getAllForAdmin(): Promise<ReviewCampaign[]> {
    const col = await getCollection<MongoCampaign>(COLLECTIONS.CAMPAIGNS);
    if (!col) return [];

    const docs = await col.find().sort({ created_at: -1 }).toArray();
    return docs.map(({ _id, ...rest }) => rest as ReviewCampaign);
  }

  /**
   * Save or update a review campaign (upsert by id or slug).
   */
  async save(campaign: ReviewCampaign): Promise<ReviewCampaign> {
    const col = await getCollection<MongoCampaign>(COLLECTIONS.CAMPAIGNS);
    if (col) {
      await col.updateOne(
        { id: campaign.id },
        {
          $set: {
            ...campaign,
            slug: campaign.slug.toLowerCase(),
            updated_at: new Date().toISOString(),
          },
        },
        { upsert: true },
      );
    }
    return campaign;
  }

  /**
   * Atomically increment campaign analytics counter (visits, scans, submissions).
   */
  async incrementCounter(
    idOrSlug: string,
    field: "visits" | "scans" | "submissions",
  ): Promise<void> {
    const col = await getCollection<MongoCampaign>(COLLECTIONS.CAMPAIGNS);
    if (!col) return;

    await col.updateOne(
      { $or: [{ id: idOrSlug }, { slug: idOrSlug.toLowerCase() }] },
      {
        $inc: { [field]: 1 },
        $set: { updated_at: new Date().toISOString() },
      },
    );
  }

  /**
   * Delete review campaign by ID.
   */
  async delete(id: string): Promise<boolean> {
    const col = await getCollection<MongoCampaign>(COLLECTIONS.CAMPAIGNS);
    if (!col) return false;
    const res = await col.deleteOne({ id });
    return res.deletedCount > 0;
  }

  /**
   * Seed initial campaigns if collection is empty.
   */
  async seedIfEmpty(seeds: ReviewCampaign[]): Promise<void> {
    const col = await getCollection<MongoCampaign>(COLLECTIONS.CAMPAIGNS);
    if (!col || seeds.length === 0) return;

    const count = await col.countDocuments();
    if (count === 0) {
      await col.insertMany(seeds.map((s) => ({ ...s } as MongoCampaign)));
      console.log(`[mongodb] Seeded ${seeds.length} initial campaigns.`);
    }
  }
}

export const campaignsRepository = new CampaignsRepository();
