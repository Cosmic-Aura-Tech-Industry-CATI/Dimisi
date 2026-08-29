/**
 * Reviews Repository — MongoDB Data Access Layer
 */
import { getCollection, COLLECTIONS, type MongoReview } from "../db/collections";
import type { Review, PublicReview, ReviewerType, ReviewStatus } from "@/lib/reviews.shared";

export class ReviewsRepository {
  /**
   * Get all approved reviews for public display on Home and Reviews page.
   * Strips private customer info (email, phone, ip, moderation details).
   */
  async getPublicReviews(options?: {
    featuredOnly?: boolean;
    reviewerType?: ReviewerType | "all";
    serviceName?: string;
    limit?: number;
  }): Promise<PublicReview[]> {
    const col = await getCollection<MongoReview>(COLLECTIONS.REVIEWS);
    if (!col) return [];

    const query: Record<string, any> = { status: "approved" };

    if (options?.featuredOnly) {
      query.is_featured = true;
    }

    if (options?.reviewerType && options.reviewerType !== "all") {
      query.reviewer_type = options.reviewerType;
    }

    if (options?.serviceName && options.serviceName !== "all") {
      query.service_name = options.serviceName;
    }

    const docs = await col
      .find(query, {
        projection: {
          id: 1,
          customer_name: 1,
          service_name: 1,
          rating: 1,
          review_text: 1,
          customer_photo_url: 1,
          customer_location: 1,
          submitted_at: 1,
          approved_at: 1,
          is_featured: 1,
          is_verified: 1,
          reviewer_type: 1,
          role_or_title: 1,
          employee_department: 1,
          employment_status: 1,
          campaign_id: 1,
        },
      })
      .sort({ is_featured: -1, submitted_at: -1 })
      .limit(options?.limit || 100)
      .toArray();

    return docs.map((d) => ({
      id: d.id,
      customer_name: d.customer_name,
      service_name: d.service_name,
      rating: d.rating,
      review_text: d.review_text,
      customer_photo_url: d.customer_photo_url,
      customer_location: d.customer_location,
      submitted_at: d.submitted_at,
      approved_at: d.approved_at,
      is_featured: d.is_featured,
      is_verified: d.is_verified,
      reviewer_type: d.reviewer_type,
      role_or_title: d.role_or_title,
      employee_department: d.employee_department,
      employment_status: d.employment_status,
      campaign_id: d.campaign_id,
    }));
  }

  /**
   * Admin: Get all reviews with full administrative fields and filters.
   */
  async getAllForAdmin(options?: {
    status?: ReviewStatus | "all";
    reviewerType?: ReviewerType | "all";
    campaignId?: string;
    search?: string;
    limit?: number;
  }): Promise<Review[]> {
    const col = await getCollection<MongoReview>(COLLECTIONS.REVIEWS);
    if (!col) return [];

    const query: Record<string, any> = {};

    if (options?.status && options.status !== "all") {
      query.status = options.status;
    }

    if (options?.reviewerType && options.reviewerType !== "all") {
      query.reviewer_type = options.reviewerType;
    }

    if (options?.campaignId) {
      query.campaign_id = options.campaignId;
    }

    if (options?.search) {
      const s = options.search.trim();
      query.$or = [
        { customer_name: { $regex: s, $options: "i" } },
        { review_text: { $regex: s, $options: "i" } },
        { customer_email: { $regex: s, $options: "i" } },
        { service_name: { $regex: s, $options: "i" } },
      ];
    }

    const docs = await col
      .find(query)
      .sort({ submitted_at: -1 })
      .limit(options?.limit || 500)
      .toArray();

    return docs.map(({ _id, ...rest }) => rest as Review);
  }

  /**
   * Find a single review by its unique UUID/string ID.
   */
  async findById(id: string): Promise<Review | null> {
    const col = await getCollection<MongoReview>(COLLECTIONS.REVIEWS);
    if (!col) return null;
    const doc = await col.findOne({ id });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return rest as Review;
  }

  /**
   * Insert a newly submitted review into MongoDB.
   */
  async insert(review: Review): Promise<Review> {
    const col = await getCollection<MongoReview>(COLLECTIONS.REVIEWS);
    if (col) {
      await col.updateOne({ id: review.id }, { $set: review }, { upsert: true });
    }
    return review;
  }

  /**
   * Update review moderation status (approve, reject, archive, publish).
   */
  async updateStatus(
    id: string,
    status: ReviewStatus,
    meta?: {
      moderated_by?: string;
      moderation_reason?: string | null;
      is_featured?: boolean;
    },
  ): Promise<Review | null> {
    const col = await getCollection<MongoReview>(COLLECTIONS.REVIEWS);
    if (!col) return null;

    const now = new Date().toISOString();
    const update: Record<string, any> = {
      status,
      updated_at: now,
    };

    if (meta?.moderated_by !== undefined) update.moderated_by = meta.moderated_by;
    if (meta?.moderation_reason !== undefined) update.moderation_reason = meta.moderation_reason;
    if (meta?.is_featured !== undefined) update.is_featured = meta.is_featured;

    if (status === "approved") {
      update.approved_at = now;
    } else if (status === "rejected") {
      update.rejected_at = now;
    } else if (status === "archived") {
      update.archived_at = now;
    }

    const res = await col.findOneAndUpdate({ id }, { $set: update }, { returnDocument: "after" });

    if (!res) return null;
    const { _id, ...rest } = res;
    return rest as Review;
  }

  /**
   * Update editable content fields of a review.
   */
  async updateFields(id: string, fields: Partial<Review>): Promise<Review | null> {
    const col = await getCollection<MongoReview>(COLLECTIONS.REVIEWS);
    if (!col) return null;

    const update = {
      ...fields,
      updated_at: new Date().toISOString(),
    };

    const res = await col.findOneAndUpdate({ id }, { $set: update }, { returnDocument: "after" });

    if (!res) return null;
    const { _id, ...rest } = res;
    return rest as Review;
  }

  /**
   * Delete review by ID.
   */
  async delete(id: string): Promise<boolean> {
    const col = await getCollection<MongoReview>(COLLECTIONS.REVIEWS);
    if (!col) return false;
    const res = await col.deleteOne({ id });
    return res.deletedCount > 0;
  }

  /**
   * Bulk seed reviews into MongoDB if collection is currently empty.
   */
  async seedIfEmpty(seeds: Review[]): Promise<void> {
    const col = await getCollection<MongoReview>(COLLECTIONS.REVIEWS);
    if (!col || seeds.length === 0) return;

    const count = await col.countDocuments();
    if (count === 0) {
      await col.insertMany(seeds.map((s) => ({ ...s } as MongoReview)));
      console.log(`[mongodb] Seeded ${seeds.length} initial reviews.`);
    }
  }
}

export const reviewsRepository = new ReviewsRepository();
