/** Server-only helpers and unified data store for the DIMISI review system (captcha, storage, email, audit, persistence). */
import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import {
  computeStats,
  calculateConversionRate,
  normalizeReviewerType,
  NAME_MAX,
  PHOTO_MAX_BYTES,
  PHOTO_TYPES,
  REVIEW_TEXT_MAX,
  type PublicReview,
  type AdminReview,
  type ReviewCampaign,
  type ReviewReport,
  type ReviewSettings,
  type ReviewStats,
  type ReviewStatus,
  type ReviewType,
} from "./reviews.shared";

const CAPTCHA_TTL_MS = 10 * 60 * 1000;

function captchaSecret(): string {
  return process.env["SESSION_SECRET"] ?? process.env["MONGODB_URI"] ?? "dimisi-review-secret-key-2026";
}

export type Captcha = { question: string; token: string };

/** Issues a signed arithmetic challenge — zero external third-party dependency. */
export function issueCaptcha(): Captcha {
  const a = 1 + Math.floor(Math.random() * 9);
  const b = 1 + Math.floor(Math.random() * 9);
  const answer = String(a + b);
  const expires = Date.now() + CAPTCHA_TTL_MS;
  const nonce = randomBytes(8).toString("hex");
  const payload = `${expires}.${nonce}`;
  const sig = createHmac("sha256", captchaSecret()).update(`${payload}.${answer}`).digest("hex");
  return { question: `What is ${a} + ${b}?`, token: `${payload}.${sig}` };
}

export function verifyCaptcha(token: string, answer: string): boolean {
  const parts = String(token ?? "").split(".");
  if (parts.length !== 3) return false;
  const [expires, nonce, sig] = parts as [string, string, string];
  if (!/^\d+$/.test(expires) || Number(expires) < Date.now()) return false;
  const expected = createHmac("sha256", captchaSecret())
    .update(`${expires}.${nonce}.${String(answer ?? "").trim()}`)
    .digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function clientIp(headers?: Headers): string {
  if (!headers) return "127.0.0.1";
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}

/** Signs private storage paths so approved photos can be shown publicly. */
export async function signPhotos<T extends { customer_photo_url: string | null }>(
  admin: any,
  rows: T[],
): Promise<Map<string, string>> {
  const paths = rows
    .map((r) => r.customer_photo_url)
    .filter((p): p is string => !!p && !p.startsWith("http") && !p.startsWith("data:"));
  const map = new Map<string, string>();
  if (paths.length === 0 || !admin?.storage) return map;

  try {
    const { data } = await admin.storage.from("review-photos").createSignedUrls(paths, 60 * 60 * 24);
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) map.set(item.path, item.signedUrl);
    }
  } catch (err) {
    console.warn("[reviews] signPhotos storage fallback", err);
  }
  return map;
}

export function toPublicReview(
  row: AdminReview,
  photos: Map<string, string>,
): PublicReview {
  const rType: ReviewType = normalizeReviewerType(row.reviewer_type);
  const photo = row.customer_photo_url
    ? (photos.get(row.customer_photo_url) ??
      (row.customer_photo_url.startsWith("http") || row.customer_photo_url.startsWith("data:")
        ? row.customer_photo_url
        : null))
    : null;

  return {
    id: row.id,
    customer_name: row.customer_name,
    service_name: row.service_name,
    reviewer_type: rType,
    role_or_title: row.role_or_title ?? null,
    employee_department: row.employee_department ?? null,
    employment_status: row.employment_status ?? null,
    is_verified: row.is_verified === true,
    rating: row.rating,
    review_text: row.review_text,
    photo_url: photo,
    customer_location: row.customer_location,
    is_featured: row.is_featured,
    published_at: row.published_at ?? row.approved_at ?? row.submitted_at,
  };
}

/** Sends a notification email when RESEND_API_KEY is configured; otherwise logs with full preview. */
export async function sendNotification(to: string, subject: string, html: string): Promise<void> {
  const key = process.env["RESEND_API_KEY"];
  if (!key || !to) {
    console.info(`[DIMISI Reviews Notification] -> ${to || "Admin"}: ${subject}`);
    return;
  }
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ from: "DIMISI Reviews <reviews@dimisi.in>", to: [to], subject, html }),
    });
  } catch (err) {
    console.error("[reviews] notification failed", err);
  }
}

export const emailTemplates = {
  submitted: (name: string, rating: number, text: string) => ({
    subject: `New DIMISI Review: ${name} (${rating}★)`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0c0d12; color: #f0f0f5; padding: 28px; border-radius: 12px; border: 1px solid #232533;">
        <div style="color: #6366f1; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">DIMISI Control Room</div>
        <h2 style="color: #ffffff; margin-top: 0;">New Review Submitted</h2>
        <p style="font-size: 16px; color: #cbd5e1;"><strong>${escapeHtml(name)}</strong> left a <strong>${rating} out of 5 star</strong> review:</p>
        <blockquote style="border-left: 3px solid #6366f1; margin: 16px 0; padding: 12px 16px; background: #13151f; border-radius: 4px; font-style: italic; color: #e2e8f0;">
          "${escapeHtml(text)}"
        </blockquote>
        <p style="margin-top: 24px;">
          <a href="https://dimisi.in/dimisi-admin" style="background: #6366f1; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Open Admin Moderation</a>
        </p>
      </div>
    `,
  }),
  approved: (name: string) => ({
    subject: "Your DIMISI Review is Now Published!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0c0d12; color: #f0f0f5; padding: 28px; border-radius: 12px; border: 1px solid #232533;">
        <div style="color: #10b981; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">DIMISI Technologies</div>
        <h2 style="color: #ffffff; margin-top: 0;">Thank You, ${escapeHtml(name)}!</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">Your review has been reviewed and approved by our team. It is now featured on the official DIMISI website.</p>
        <p style="margin-top: 24px;">
          <a href="https://dimisi.in/reviews" style="background: #10b981; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">View Public Reviews</a>
        </p>
      </div>
    `,
  }),
  rejected: (name: string, reason: string) => ({
    subject: "Update Regarding Your DIMISI Review",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0c0d12; color: #f0f0f5; padding: 28px; border-radius: 12px; border: 1px solid #232533;">
        <div style="color: #f59e0b; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">DIMISI Technologies</div>
        <h2 style="color: #ffffff; margin-top: 0;">Hello ${escapeHtml(name)},</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">Thank you for taking the time to submit feedback. Following our review guidelines, your submission could not be published at this time.</p>
        <p style="font-size: 14px; color: #94a3b8; background: #181a24; padding: 12px; border-radius: 6px;">Reason: ${escapeHtml(reason || "Does not meet our content moderation criteria.")}</p>
        <p style="font-size: 13px; color: #64748b; margin-top: 20px;">If you have any questions or would like to contact our team directly, feel free to reply to hello@dimisi.in.</p>
      </div>
    `,
  }),
  reported: (reason: string, text: string) => ({
    subject: `[Moderation Alert] Review Reported (${reason})`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0c0d12; color: #f0f0f5; padding: 28px; border-radius: 12px; border: 1px solid #ef4444;">
        <div style="color: #ef4444; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Moderation Queue</div>
        <h2 style="color: #ffffff; margin-top: 0;">A Review Was Flagged by a Visitor</h2>
        <p style="color: #fca5a5;"><strong>Reason:</strong> ${escapeHtml(reason)}</p>
        <blockquote style="border-left: 3px solid #ef4444; margin: 16px 0; padding: 12px 16px; background: #181318; border-radius: 4px; color: #f1f5f9;">
          "${escapeHtml(text)}"
        </blockquote>
        <p style="margin-top: 20px;">
          <a href="https://dimisi.in/dimisi-admin" style="background: #ef4444; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Resolve in Moderation Queue</a>
        </p>
      </div>
    `,
  }),
};

export function escapeHtml(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ==========================================
// CANONICAL IN-MEMORY PERSISTENCE STORE
// ==========================================
const SEED_REVIEWS: AdminReview[] = [
  {
    id: "rev-001",
    campaign_id: "camp-001",
    campaign_name: "Web Clients Q3",
    customer_name: "Alexander Wright",
    customer_email: "alex.wright@apexgroup.io",
    customer_phone: "+1 415-890-1200",
    service_name: "AI & Autonomous Agents",
    reviewer_type: "client",
    role_or_title: "CTO, Apex Group",
    is_verified: true,
    rating: 5,
    review_text:
      "DIMISI engineered an autonomous multi-agent pipeline that transformed our enterprise workflow. Their precision, architectural depth, and speed exceeded every expectation.",
    customer_photo_url: null,
    customer_location: "San Francisco, CA",
    consent_to_publish: true,
    status: "approved",
    is_featured: true,
    moderation_reason: "Verified client project",
    moderated_by: "admin",
    submitter_ip: "127.0.0.1",
    submitted_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    approved_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    rejected_at: null,
    archived_at: null,
    updated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: "rev-002",
    campaign_id: "camp-001",
    campaign_name: "Web Clients Q3",
    customer_name: "Dr. Elena Rostova",
    customer_email: "elena@vortexbiotech.com",
    customer_phone: "+44 20 7946 0912",
    service_name: "Web Development & Platforms",
    reviewer_type: "client",
    role_or_title: "Head of Digital, Vortex Bio",
    is_verified: true,
    rating: 5,
    review_text:
      "The 3D WebGL web platform built by DIMISI is breathtaking. Our inbound investor inquiries jumped 400% after launching the new digital experience.",
    customer_photo_url: null,
    customer_location: "London, UK",
    consent_to_publish: true,
    status: "approved",
    is_featured: true,
    moderation_reason: "Verified client",
    moderated_by: "admin",
    submitter_ip: "127.0.0.1",
    submitted_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    approved_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    rejected_at: null,
    archived_at: null,
    updated_at: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    id: "rev-emp-001",
    campaign_id: null,
    campaign_name: null,
    customer_name: "Harsh Mishra",
    customer_email: "harsh@dimisi.in",
    customer_phone: "+91 85450 99251",
    service_name: "Engineering & Core Systems",
    reviewer_type: "employee",
    role_or_title: "Full-Stack Engineer",
    employee_department: "Engineering",
    employment_status: "current",
    is_verified: true,
    rating: 5,
    review_text:
      "Building scalable platforms and working on the Kalesh app at DIMISI has been an unmatched journey. The engineering culture prioritizes clean architecture, zero bloat, and sub-millisecond execution.",
    customer_photo_url: null,
    customer_location: "Kanpur, India",
    consent_to_publish: true,
    status: "approved",
    is_featured: true,
    moderation_reason: "Verified Team Member",
    moderated_by: "admin",
    submitter_ip: "127.0.0.1",
    submitted_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    approved_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    rejected_at: null,
    archived_at: null,
    updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "rev-003",
    campaign_id: "camp-002",
    campaign_name: "Mobile App Outreach",
    customer_name: "Vikram Sengupta",
    customer_email: "vikram@novapay.in",
    customer_phone: "+91 98200 45678",
    service_name: "Mobile App Development",
    reviewer_type: "client",
    role_or_title: "VP Engineering, NovaPay",
    is_verified: true,
    rating: 5,
    review_text:
      "Flawless mobile app architecture with sub-second biometric payments and instant sync. The team's craftsmanship is second to none.",
    customer_photo_url: null,
    customer_location: "Bengaluru, India",
    consent_to_publish: true,
    status: "approved",
    is_featured: true,
    moderation_reason: null,
    moderated_by: "admin",
    submitter_ip: "127.0.0.1",
    submitted_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    approved_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    rejected_at: null,
    archived_at: null,
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "rev-emp-002",
    campaign_id: null,
    campaign_name: null,
    customer_name: "Ananya Sen",
    customer_email: "ananya.sen@dimisi.in",
    customer_phone: null,
    service_name: "AI & Autonomous Agents",
    reviewer_type: "employee",
    role_or_title: "AI & ML Research Engineer",
    employee_department: "AI & Research",
    employment_status: "current",
    is_verified: true,
    rating: 5,
    review_text:
      "The autonomy we have to push bleeding-edge GenAI workflows, custom tool-calling agents, and real-time streaming pipelines is rare. DIMISI provides the ultimate playground for hardcore builders.",
    customer_photo_url: null,
    customer_location: "Bengaluru, India",
    consent_to_publish: true,
    status: "approved",
    is_featured: true,
    moderation_reason: "Verified Team Member",
    moderated_by: "admin",
    submitter_ip: "127.0.0.1",
    submitted_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    approved_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    rejected_at: null,
    archived_at: null,
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "rev-004",
    campaign_id: "camp-002",
    campaign_name: "Mobile App Outreach",
    customer_name: "Marcus Vance",
    customer_email: "marcus@aerocloud.de",
    customer_phone: null,
    service_name: "Cloud & DevOps Architecture",
    reviewer_type: "client",
    role_or_title: "Infrastructure Lead",
    is_verified: false,
    rating: 4,
    review_text:
      "Robust Kubernetes and multi-region deployment. Migration was completely zero-downtime. Highly recommended team.",
    customer_photo_url: null,
    customer_location: "Berlin, Germany",
    consent_to_publish: true,
    status: "approved",
    is_featured: false,
    moderation_reason: null,
    moderated_by: "admin",
    submitter_ip: "127.0.0.1",
    submitted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    approved_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    rejected_at: null,
    archived_at: null,
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "rev-emp-003",
    campaign_id: null,
    campaign_name: null,
    customer_name: "Priya Nair",
    customer_email: "priya.nair@dimisi.in",
    customer_phone: null,
    service_name: "UI/UX Design & 3D Experiences",
    reviewer_type: "employee",
    role_or_title: "UI/UX & 3D Designer",
    employee_department: "Design & Creative",
    employment_status: "current",
    is_verified: true,
    rating: 5,
    review_text:
      "We treat every micro-interaction and 3D shader like digital art. Designing for DIMISI feels cinematic and ambitious — every member of our team is dedicated to perfection.",
    customer_photo_url: null,
    customer_location: "Noida, India",
    consent_to_publish: true,
    status: "approved",
    is_featured: false,
    moderation_reason: "Verified Team Member",
    moderated_by: "admin",
    submitter_ip: "127.0.0.1",
    submitted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    approved_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    rejected_at: null,
    archived_at: null,
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const SEED_CAMPAIGNS: ReviewCampaign[] = [
  {
    id: "camp-001",
    campaign_name: "Web Clients Q3",
    slug: "web-clients-q3",
    service_name: "Web Development & Platforms",
    location: "Worldwide",
    is_active: true,
    expires_at: null,
    visits: 42,
    scans: 28,
    submissions: 15,
    created_by: "admin",
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "camp-002",
    campaign_name: "Mobile App Outreach",
    slug: "mobile-app-outreach",
    service_name: "Mobile App Development",
    location: "India & US",
    is_active: true,
    expires_at: null,
    visits: 68,
    scans: 45,
    submissions: 22,
    created_by: "admin",
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "camp-003",
    campaign_name: "Noida Office Direct QR",
    slug: "noida-office",
    service_name: "AI & Autonomous Agents",
    location: "Noida Sector 62",
    is_active: true,
    expires_at: null,
    visits: 19,
    scans: 14,
    submissions: 6,
    created_by: "admin",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

class MemoryStore {
  reviews: AdminReview[] = [...SEED_REVIEWS];
  campaigns: ReviewCampaign[] = [...SEED_CAMPAIGNS];
  reports: ReviewReport[] = [
    {
      id: "rep-001",
      review_id: "rev-004",
      reporter_name: "Visitor",
      reporter_email: "visitor@example.com",
      reason: "Spam",
      message: "Testing the reporting queue functionality.",
      status: "open",
      created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
      resolved_at: null,
      resolved_by: null,
    },
  ];
  settings: ReviewSettings = {
    id: true,
    notify_on_submit: true,
    notify_on_approve: true,
    notify_on_reject: false,
    notify_on_report: true,
    notify_campaign_summary: true,
    notify_email: "hello@dimisi.in",
    updated_at: new Date().toISOString(),
  };
  auditLogs: {
    id: string;
    admin_id: string | null;
    action: string;
    entity_type: string;
    entity_id: string | null;
    old_value: any;
    new_value: any;
    ip_address: string | null;
    created_at: string;
  }[] = [];

  private _dbSynced = false;

  async syncWithMongo() {
    try {
      const { reviewsRepository } = await import("@/server/repositories/reviews.repository");
      const { campaignsRepository } = await import("@/server/repositories/campaigns.repository");
      const { reportsRepository } = await import("@/server/repositories/reports.repository");

      // 1. Initial Seeding if MongoDB collections are empty
      await reviewsRepository.seedIfEmpty(this.reviews);
      await campaignsRepository.seedIfEmpty(this.campaigns);

      // 2. Fetch latest MongoDB data
      const [dbReviews, dbCampaigns, dbReports, dbSettings] = await Promise.all([
        reviewsRepository.getAllForAdmin(),
        campaignsRepository.getAllForAdmin(),
        reportsRepository.getAllReports(),
        reportsRepository.getSettings(),
      ]);

      if (Array.isArray(dbReviews) && dbReviews.length > 0) {
        const dbMap = new Map<string, AdminReview>(dbReviews.map((r) => [r.id, r]));
        const merged: AdminReview[] = [...dbReviews];

        for (const local of this.reviews) {
          if (!dbMap.has(local.id)) {
            merged.push(local);
          }
        }
        this.reviews = merged;
      }

      if (Array.isArray(dbCampaigns) && dbCampaigns.length > 0) {
        const dbCampMap = new Map<string, ReviewCampaign>(dbCampaigns.map((c) => [c.id, c]));
        const mergedCamps: ReviewCampaign[] = [...dbCampaigns];

        for (const local of this.campaigns) {
          if (!dbCampMap.has(local.id) && !mergedCamps.some((c) => c.slug === local.slug)) {
            mergedCamps.push(local);
          }
        }
        this.campaigns = mergedCamps;
      }

      if (Array.isArray(dbReports) && dbReports.length > 0) {
        const repMap = new Map<string, ReviewReport>(dbReports.map((r) => [r.id, r]));
        const mergedReps: ReviewReport[] = [...dbReports];
        for (const local of this.reports) {
          if (!repMap.has(local.id)) mergedReps.push(local);
        }
        this.reports = mergedReps;
      }

      if (dbSettings) {
        this.settings = { ...this.settings, ...dbSettings };
      }

      this._dbSynced = true;
    } catch (err) {
      console.warn("[reviews] MongoDB sync note:", err instanceof Error ? err.message : String(err));
    }
  }
}

// Guarantee persistent singleton on globalThis in all environments (Node, SSR, Dev)
const globalForStore = globalThis as unknown as { __DIMISI_REVIEW_STORE__?: MemoryStore };
if (!globalForStore.__DIMISI_REVIEW_STORE__) {
  globalForStore.__DIMISI_REVIEW_STORE__ = new MemoryStore();
}
export const memoryStore = globalForStore.__DIMISI_REVIEW_STORE__;

export async function logAudit(
  _legacyAdmin: any,
  adminId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  oldVal: any,
  newVal: any,
  ip: string | null,
) {
  const auditEntry = {
    id: crypto.randomUUID(),
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_value: oldVal,
    new_value: newVal,
    ip_address: ip,
    created_at: new Date().toISOString(),
  };

  memoryStore.auditLogs.unshift(auditEntry);

  try {
    const { auditLogsRepository } = await import("@/server/repositories/auditLogs.repository");
    await auditLogsRepository.log({
      admin_id: adminId,
      action,
      entity_type: entityType,
      entity_id: entityId || "unknown",
      old_value: oldVal,
      new_value: newVal,
      ip_address: ip,
    });
  } catch (err) {
    console.warn("[reviews] MongoDB audit logging note:", err);
  }
}

