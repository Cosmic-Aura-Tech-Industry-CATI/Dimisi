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

export type LeadStatus = "new" | "contacted" | "in_progress" | "converted" | "archived";

export interface MongoLead extends MongoDoc {
  id: string;
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
  created_at: string;
  updated_at?: string;
}

export interface MongoVisitorSession extends MongoDoc {
  id: string; // session id
  session_id: string;
  visitor_id: string;
  user_id?: string | null;
  auth_state: "anonymous" | "registered" | "authenticated";
  first_seen_at: string;
  last_seen_at: string;
  started_at: string;
  ended_at?: string | null;
  page_count: number;
  total_duration_seconds: number;
  initial_page: string;
  last_page: string;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  device_category: "desktop" | "mobile" | "tablet" | "unknown";
  browser?: string | null;
  os?: string | null;
  screen_resolution?: string | null;
  visit_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MongoPageView extends MongoDoc {
  id: string;
  page_view_id: string;
  session_id: string;
  visitor_id: string;
  user_id?: string | null;
  path: string;
  title?: string | null;
  referrer?: string | null;
  entered_at: string;
  exited_at?: string | null;
  duration_seconds: number;
  max_scroll_percent: number;
  created_at: string;
  updated_at: string;
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
  VISITOR_SESSIONS: "visitor_sessions",
  PAGE_VIEWS: "page_views",
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
