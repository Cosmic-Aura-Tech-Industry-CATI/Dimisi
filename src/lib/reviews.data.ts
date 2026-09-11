/**
 * Pure in-memory review helpers and utilities.
 */
import {
  computeStats,
  calculateConversionRate,
  normalizeReviewerType,
  type PublicReview,
  type AdminReview,
  type ReviewStats,
  type ReviewType,
} from "./reviews.shared";

export type Captcha = { question: string; token: string };

export function issueCaptcha(): Captcha {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 1;
  const token = btoa(`${a + b}:${Date.now()}`);
  return { question: `What is ${a} + ${b}?`, token };
}

export function verifyCaptcha(token: string, answer: string): boolean {
  try {
    const raw = atob(token);
    const expected = raw.split(":")[0];
    return String(answer).trim() === expected;
  } catch {
    return false;
  }
}

export function escapeHtml(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function toPublicReview(row: AdminReview): PublicReview {
  return {
    id: row.id,
    customer_name: row.customer_name,
    service_name: row.service_name,
    reviewer_type: normalizeReviewerType(row.reviewer_type),
    role_or_title: row.role_or_title,
    employee_department: row.employee_department,
    employment_status: row.employment_status,
    is_verified: row.is_verified,
    rating: row.rating,
    review_text: row.review_text,
    customer_photo_url: row.customer_photo_url,
    customer_location: row.customer_location,
    is_featured: row.is_featured,
    submitted_at: row.submitted_at,
  };
}

export class MemoryStore {
  reviews: AdminReview[] = [];
  campaigns: any[] = [];
  reports: any[] = [];
  settings: any = {
    id: true,
    notify_on_submit: true,
    notify_on_approve: true,
    notify_on_reject: false,
    auto_approve_5_star: false,
    notification_email: "hello@dimisi.in",
    default_min_rating_to_show: 1,
    captcha_enabled: true,
    profanity_filter_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  createReview(r: AdminReview) {
    this.reviews.unshift(r);
    return r;
  }

  updateReviewStatus(id: string, status: any, reason?: string, by?: string) {
    const rev = this.reviews.find((r) => r.id === id);
    if (rev) {
      rev.status = status;
      if (reason) rev.moderation_reason = reason;
      if (by) rev.moderated_by = by;
    }
    return rev;
  }
}

export const memoryStore = new MemoryStore();

