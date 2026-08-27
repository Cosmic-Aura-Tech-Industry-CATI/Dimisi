/** Shared, client-safe types + validation for the DIMISI review system. */

export type ReviewStatus = "pending" | "approved" | "rejected" | "archived";
export type ReportStatus = "open" | "resolved" | "dismissed";

export const REVIEW_TEXT_MAX = 2000;
export const REVIEW_TEXT_MIN = 5;
export const NAME_MAX = 80;
export const PHOTO_MAX_BYTES = 3 * 1024 * 1024; // 3MB
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const DIMISI_SERVICES = [
  "AI & Autonomous Agents",
  "Web Development & Platforms",
  "Mobile App Development",
  "Cloud & DevOps Architecture",
  "Automation & Workflows",
  "UI/UX Design & 3D Experiences",
  "Kalesh Mobile App",
  "Enterprise Software Solutions",
  "Consulting & Architecture",
  "Other Services",
] as const;

export const REPORT_REASONS = [
  "Offensive language",
  "False or misleading content",
  "Personal information",
  "Spam",
  "Copyright issue",
  "Other",
] as const;

export type PublicReview = {
  id: string;
  customer_name: string;
  service_name: string | null;
  rating: number;
  review_text: string;
  photo_url: string | null;
  customer_location: string | null;
  is_featured: boolean;
  published_at: string;
};

export type AdminReview = {
  id: string;
  campaign_id: string | null;
  campaign_name?: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  service_name: string | null;
  rating: number;
  review_text: string;
  customer_photo_url: string | null;
  photo_url?: string | null;
  customer_location: string | null;
  consent_to_publish: boolean;
  status: ReviewStatus;
  is_featured: boolean;
  moderation_reason: string | null;
  moderated_by: string | null;
  submitter_ip: string | null;
  submitted_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  archived_at: string | null;
  updated_at: string;
};

export type ReviewCampaign = {
  id: string;
  campaign_name: string;
  slug: string;
  service_name: string | null;
  location: string | null;
  is_active: boolean;
  expires_at: string | null;
  visits: number;
  scans: number;
  submissions: number;
  approved_count?: number;
  conversion_rate?: number;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
};

export type ReviewReport = {
  id: string;
  review_id: string;
  reporter_name: string | null;
  reporter_email: string | null;
  reason: string;
  message: string | null;
  status: ReportStatus;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  review?: {
    customer_name: string;
    rating: number;
    review_text: string;
    status: ReviewStatus;
  } | null;
};

export type ReviewSettings = {
  id: boolean;
  notify_on_submit: boolean;
  notify_on_approve: boolean;
  notify_on_reject: boolean;
  notify_on_report: boolean;
  notify_campaign_summary: boolean;
  notify_email: string | null;
  updated_at?: string;
};

export type ReviewStats = {
  total: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  pendingCount?: number;
  approvedCount?: number;
  rejectedCount?: number;
  archivedCount?: number;
};

export type ReviewInput = {
  slug?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  serviceName?: string;
  rating: number;
  reviewText: string;
  customerLocation?: string;
  consent: boolean;
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^[+0-9\s\-().]{7,25}$/;

/** Returns a map of field -> error message. Empty object means valid. */
export function validateReview(input: Partial<ReviewInput>): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = (input.customerName ?? "").trim();
  const text = (input.reviewText ?? "").trim();
  const email = (input.customerEmail ?? "").trim();
  const phone = (input.customerPhone ?? "").trim();

  if (name.length < 2) errors["customerName"] = "Please enter your name (at least 2 characters).";
  else if (name.length > NAME_MAX) errors["customerName"] = `Name must be under ${NAME_MAX} characters.`;

  if (!input.rating || input.rating < 1 || input.rating > 5) errors["rating"] = "Please choose a star rating from 1 to 5.";

  if (text.length < REVIEW_TEXT_MIN) errors["reviewText"] = `Please write a review of at least ${REVIEW_TEXT_MIN} characters.`;
  else if (text.length > REVIEW_TEXT_MAX)
    errors["reviewText"] = `Review must be under ${REVIEW_TEXT_MAX} characters.`;

  if (email && !EMAIL_RE.test(email)) errors["customerEmail"] = "Please enter a valid email address.";
  if (phone && !PHONE_RE.test(phone)) errors["customerPhone"] = "Please enter a valid phone number.";

  if (!input.consent) errors["consent"] = "Please accept the publication consent to submit.";

  return errors;
}

/** Strips control chars and angle brackets so stored text can never carry markup. */
export function sanitizeText(value: unknown, max: number): string {
  return String(value ?? "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, max);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function computeStats(rows: { rating: number }[]): ReviewStats {
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of rows) {
    const k = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[k] = (distribution[k] || 0) + 1;
    sum += r.rating;
  }
  const total = rows.length;
  return { total, average: total ? Math.round((sum / total) * 10) / 10 : 0, distribution };
}

export function calculateConversionRate(visits: number, submissions: number): number {
  if (!visits || visits <= 0) return 0;
  return Math.min(100, Math.round((submissions / visits) * 1000) / 10);
}
