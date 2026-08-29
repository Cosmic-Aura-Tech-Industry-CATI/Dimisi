/**
 * Strongly-typed collection accessors for MongoDB.
 */
import type { Collection, Document } from "mongodb";
import { getDb } from "./mongodb";

import type {
  Review,
  ReviewCampaign,
  ReviewReport,
  ReviewSettings,
  AdminAuditLog,
} from "@/lib/reviews.shared";
import type { CompanyEvent, EventGalleryItem } from "@/lib/events.shared";
import type { CompanyService, IndustrySector } from "@/lib/services.shared";
import type { ProjectItem } from "@/lib/work.shared";
import type {
  JobOpening,
  HiringProcessStep,
  CultureBenefit,
  CareersHeroConfig,
  CareersClosingCtaConfig,
} from "@/lib/careers.shared";
import type { BlogPostItem, BlogConfig } from "@/lib/blog.shared";
import type { AdminRole } from "@/lib/rbac.shared";

export interface MongoDoc extends Document {
  _id?: any;
}

export interface MongoReview extends Review, MongoDoc {}
export interface MongoCampaign extends ReviewCampaign, MongoDoc {}
export interface MongoReport extends ReviewReport, MongoDoc {}
export interface MongoSettings extends ReviewSettings, MongoDoc {}
export interface MongoAuditLog extends AdminAuditLog, MongoDoc {}

export interface MongoLead extends MongoDoc {
  id: string;
  email: string;
  full_name?: string | null;
  source?: string | null;
  page?: string | null;
  message?: string | null;
  created_at: string;
}

export interface MongoProfile extends MongoDoc {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  designation?: string | null;
  is_active?: boolean;
  notify_email?: boolean;
  created_at: string;
  updated_at: string;
}

export interface MongoAdminUser extends MongoDoc {
  user_id: string;
  email: string;
  full_name?: string | null;
  designation?: string | null;
  role: AdminRole;
  is_active: boolean;
  password_hash?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface MongoEvent extends CompanyEvent, MongoDoc {}
export interface MongoGalleryItem extends EventGalleryItem, MongoDoc {}
export interface MongoService extends CompanyService, MongoDoc {}
export interface MongoIndustrySector extends IndustrySector, MongoDoc {}
export interface MongoProject extends ProjectItem, MongoDoc {}
export interface MongoJobOpening extends JobOpening, MongoDoc {}
export interface MongoCareersConfig extends MongoDoc {
  _id?: string;
  hiring_steps: HiringProcessStep[];
  benefits: CultureBenefit[];
  hero: CareersHeroConfig;
  closing_cta: CareersClosingCtaConfig;
  updated_at: string;
}
export interface MongoBlogPost extends BlogPostItem, MongoDoc {}
export interface MongoBlogConfigDoc extends MongoDoc {
  _id?: string;
  config: BlogConfig;
  categories: string[];
  updated_at: string;
}

export const COLLECTIONS = {
  REVIEWS: "reviews",
  CAMPAIGNS: "review_campaigns",
  REPORTS: "review_reports",
  SETTINGS: "review_settings",
  AUDIT_LOGS: "admin_audit_logs",
  LEADS: "leads",
  PROFILES: "profiles",
  ADMIN_USERS: "admin_users",
  EVENTS: "events",
  GALLERY: "event_gallery",
  SERVICES: "services",
  INDUSTRIES: "industry_sectors",
  PROJECTS: "projects",
  JOBS: "careers_jobs",
  CAREERS_CONFIG: "careers_config",
  BLOG_POSTS: "blog_posts",
  BLOG_CONFIG: "blog_config",
} as const;

/**
 * Get a strongly-typed MongoDB collection instance.
 */
export async function getCollection<T extends Document = Document>(
  collectionName: string,
): Promise<Collection<T> | null> {
  const db = await getDb();
  if (!db) return null;
  return db.collection<T>(collectionName);
}
