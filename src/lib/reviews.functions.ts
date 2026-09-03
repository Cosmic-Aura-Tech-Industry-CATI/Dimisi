/**
 * DIMISI Technologies — Client-Side Reviews Manager
 * Pure frontend implementation with rich local storage and in-memory state.
 */
import {
  computeStats,
  calculateConversionRate,
  normalizeReviewerType,
  sanitizeText,
  slugify,
  type PublicReview,
  type AdminReview,
  type ReviewCampaign,
  type ReviewReport,
  type ReviewSettings,
  type ReviewStats,
  type ReviewStatus,
  type ReviewType,
} from "./reviews.shared";

const REVIEWS_STORAGE_KEY = "dimisi_reviews_v1";
const CAMPAIGNS_STORAGE_KEY = "dimisi_campaigns_v1";
const REPORTS_STORAGE_KEY = "dimisi_reports_v1";
const SETTINGS_STORAGE_KEY = "dimisi_settings_v1";

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
];

function getStoredReviews(): AdminReview[] {
  if (typeof window === "undefined") return SEED_REVIEWS;
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return SEED_REVIEWS;
}

function saveStoredReviews(reviews: AdminReview[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch {}
}

function getStoredCampaigns(): ReviewCampaign[] {
  if (typeof window === "undefined") return SEED_CAMPAIGNS;
  try {
    const raw = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return SEED_CAMPAIGNS;
}

function saveStoredCampaigns(campaigns: ReviewCampaign[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
  } catch {}
}

export function toPublicReview(row: AdminReview): PublicReview {
  return {
    id: row.id,
    customer_name: row.customer_name,
    service_name: row.service_name,
    reviewer_type: row.reviewer_type,
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

export async function getPublicReviews({
  data,
}: {
  data?: {
    page?: number;
    pageSize?: number;
    rating?: number;
    reviewerType?: ReviewType | "all";
    service?: string;
    sortBy?: "newest" | "highest" | "lowest";
  };
} = {}): Promise<{
  reviews: PublicReview[];
  stats: ReviewStats;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const allReviews = getStoredReviews();
  const approved = allReviews.filter((r) => r.status === "approved");
  const stats = computeStats(approved);

  let filtered = [...approved];

  if (data?.rating && data.rating >= 1 && data.rating <= 5) {
    filtered = filtered.filter((r) => Math.round(r.rating) === data.rating);
  }

  if (data?.reviewerType && data.reviewerType !== "all") {
    filtered = filtered.filter((r) => r.reviewer_type === data.reviewerType);
  }

  if (data?.service && data.service !== "all") {
    filtered = filtered.filter((r) => r.service_name === data.service);
  }

  if (data?.sortBy === "highest") {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (data?.sortBy === "lowest") {
    filtered.sort((a, b) => a.rating - b.rating);
  } else {
    filtered.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  }

  const page = data?.page || 1;
  const pageSize = data?.pageSize || 12;
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize).map(toPublicReview);

  return {
    reviews: paginated,
    stats,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getReviewCaptcha(): Promise<{ question: string; token: string }> {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 1;
  const token = btoa(`${a + b}:${Date.now()}`);
  return {
    question: `What is ${a} + ${b}?`,
    token,
  };
}

export async function getReviewCampaign({
  data,
}: {
  data: { slug: string };
}): Promise<{ campaign: ReviewCampaign | null }> {
  const campaigns = getStoredCampaigns();
  const campaign = campaigns.find((c) => c.slug === data.slug && c.is_active) || null;
  return { campaign };
}

export async function submitReview({
  data,
}: {
  data: {
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    serviceName?: string;
    reviewerType?: ReviewType;
    roleOrTitle?: string;
    employeeDepartment?: string;
    employmentStatus?: "current" | "former";
    rating: number;
    reviewText: string;
    customerPhoto?: string;
    customerLocation?: string;
    consent: boolean;
    campaignId?: string;
    captchaToken?: string;
    captchaAnswer?: string;
  };
}): Promise<{ success: boolean; reviewId: string }> {
  const newReview: AdminReview = {
    id: `rev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    campaign_id: data.campaignId || null,
    campaign_name: null,
    customer_name: sanitizeText(data.customerName, 80),
    customer_email: sanitizeText(data.customerEmail, 160) || null,
    customer_phone: sanitizeText(data.customerPhone, 50) || null,
    service_name: sanitizeText(data.serviceName, 100) || null,
    reviewer_type: normalizeReviewerType(data.reviewerType),
    role_or_title: sanitizeText(data.roleOrTitle, 100) || null,
    employee_department: sanitizeText(data.employeeDepartment, 100) || null,
    employment_status: data.employmentStatus || null,
    is_verified: false,
    rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
    review_text: sanitizeText(data.reviewText, 2000),
    customer_photo_url: data.customerPhoto || null,
    customer_location: sanitizeText(data.customerLocation, 100) || null,
    consent_to_publish: Boolean(data.consent),
    status: "approved", // Client mode: Automatically visible in public reviews
    is_featured: false,
    moderation_reason: "Submitted via website",
    moderated_by: "system",
    submitter_ip: "127.0.0.1",
    submitted_at: new Date().toISOString(),
    approved_at: new Date().toISOString(),
    rejected_at: null,
    archived_at: null,
    updated_at: new Date().toISOString(),
  };

  const reviews = getStoredReviews();
  reviews.unshift(newReview);
  saveStoredReviews(reviews);

  return { success: true, reviewId: newReview.id };
}

export async function reportReview({
  data,
}: {
  data: {
    reviewId: string;
    reporterName?: string;
    reporterEmail?: string;
    reason: string;
    message?: string;
  };
}): Promise<{ success: boolean }> {
  return { success: true };
}

// ==========================================
// ADMIN REVIEW CONTROL FUNCTIONS
// ==========================================

export type AdminDashboardData = {
  reviews: AdminReview[];
  campaigns: ReviewCampaign[];
  reports: ReviewReport[];
  settings: ReviewSettings;
  stats: ReviewStats;
};

export async function getAdminReviewsData(): Promise<AdminDashboardData> {
  const reviewsRes = await getAdminReviews();
  const campaignsRes = await getAdminCampaigns();
  const reportsRes = await getAdminReports();
  const settingsRes = await getReviewSettings();
  return {
    reviews: reviewsRes.reviews,
    campaigns: campaignsRes.campaigns,
    reports: reportsRes.reports,
    settings: settingsRes.settings,
    stats: reviewsRes.stats,
  };
}

export async function getAdminReviews({
  data,
}: {
  data?: {
    page?: number;
    pageSize?: number;
    status?: ReviewStatus | "all";
    rating?: number;
    reviewerType?: ReviewType | "all";
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  };
} = {}): Promise<{
  reviews: AdminReview[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats: ReviewStats;
}> {
  let reviews = getStoredReviews();
  const allReviews = [...reviews];
  const stats = computeStats(allReviews.filter((r) => r.status === "approved"));

  if (data?.status && data.status !== "all") {
    reviews = reviews.filter((r) => r.status === data.status);
  }

  if (data?.rating && data.rating >= 1 && data.rating <= 5) {
    reviews = reviews.filter((r) => Math.round(r.rating) === data.rating);
  }

  if (data?.reviewerType && data.reviewerType !== "all") {
    reviews = reviews.filter((r) => r.reviewer_type === data.reviewerType);
  }

  if (data?.search && data.search.trim()) {
    const q = data.search.trim().toLowerCase();
    reviews = reviews.filter(
      (r) =>
        r.customer_name.toLowerCase().includes(q) ||
        r.review_text.toLowerCase().includes(q) ||
        (r.customer_email && r.customer_email.toLowerCase().includes(q)),
    );
  }

  const page = data?.page || 1;
  const pageSize = data?.pageSize || 20;
  const total = reviews.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const paginated = reviews.slice(start, start + pageSize);

  return {
    reviews: paginated,
    total,
    page,
    pageSize,
    totalPages,
    stats,
  };
}

export async function getReviewStats(): Promise<ReviewStats> {
  const reviews = getStoredReviews();
  return computeStats(reviews.filter((r) => r.status === "approved"));
}

export async function updateReviewStatus({
  data,
}: {
  data: {
    reviewId: string;
    status: ReviewStatus;
    reason?: string;
  };
}): Promise<{ success: boolean }> {
  const reviews = getStoredReviews();
  const index = reviews.findIndex((r) => r.id === data.reviewId);
  if (index !== -1) {
    reviews[index].status = data.status;
    if (data.reason !== undefined) reviews[index].moderation_reason = data.reason;
    reviews[index].updated_at = new Date().toISOString();
    saveStoredReviews(reviews);
  }
  return { success: true };
}

export async function editReviewContent({
  data,
}: {
  data: {
    reviewId: string;
    customerName: string;
    serviceName?: string;
    reviewerType?: ReviewType;
    roleOrTitle?: string;
    rating: number;
    reviewText: string;
    customerLocation?: string;
  };
}): Promise<{ success: boolean }> {
  const reviews = getStoredReviews();
  const index = reviews.findIndex((r) => r.id === data.reviewId);
  if (index !== -1) {
    reviews[index].customer_name = sanitizeText(data.customerName, 80);
    reviews[index].service_name = sanitizeText(data.serviceName, 100) || null;
    reviews[index].reviewer_type = normalizeReviewerType(data.reviewerType);
    reviews[index].role_or_title = sanitizeText(data.roleOrTitle, 100) || null;
    reviews[index].rating = Math.min(5, Math.max(1, Number(data.rating) || 5));
    reviews[index].review_text = sanitizeText(data.reviewText, 2000);
    reviews[index].customer_location = sanitizeText(data.customerLocation, 100) || null;
    reviews[index].updated_at = new Date().toISOString();
    saveStoredReviews(reviews);
  }
  return { success: true };
}

export const updateReviewContent = editReviewContent;
export const deleteReview = deleteReviewAdmin;

export async function toggleReviewVerified({
  data,
}: {
  data: { reviewId: string; isVerified: boolean };
}): Promise<{ success: boolean }> {
  const reviews = getStoredReviews();
  const index = reviews.findIndex((r) => r.id === data.reviewId);
  if (index !== -1) {
    reviews[index].is_verified = data.isVerified;
    reviews[index].updated_at = new Date().toISOString();
    saveStoredReviews(reviews);
  }
  return { success: true };
}

export async function toggleReviewFeatured({
  data,
}: {
  data: { reviewId: string; isFeatured: boolean };
}): Promise<{ success: boolean }> {
  const reviews = getStoredReviews();
  const index = reviews.findIndex((r) => r.id === data.reviewId);
  if (index !== -1) {
    reviews[index].is_featured = data.isFeatured;
    reviews[index].updated_at = new Date().toISOString();
    saveStoredReviews(reviews);
  }
  return { success: true };
}

export async function deleteReviewAdmin({
  data,
}: {
  data: { reviewId: string };
}): Promise<{ success: boolean }> {
  let reviews = getStoredReviews();
  reviews = reviews.filter((r) => r.id !== data.reviewId);
  saveStoredReviews(reviews);
  return { success: true };
}

export async function getAdminCampaigns(): Promise<{ campaigns: ReviewCampaign[] }> {
  return { campaigns: getStoredCampaigns() };
}

export async function createCampaign({
  data,
}: {
  data: {
    campaignName: string;
    serviceName?: string;
    location?: string;
    expiresAt?: string;
  };
}): Promise<{ success: boolean; campaign: ReviewCampaign }> {
  const name = sanitizeText(data.campaignName, 100);
  const slug = slugify(name);
  const campaign: ReviewCampaign = {
    id: `camp-${Date.now().toString(36)}`,
    campaign_name: name,
    slug,
    service_name: sanitizeText(data.serviceName, 100) || null,
    location: sanitizeText(data.location, 100) || null,
    is_active: true,
    expires_at: data.expiresAt || null,
    visits: 0,
    scans: 0,
    submissions: 0,
    created_by: "admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const campaigns = getStoredCampaigns();
  campaigns.unshift(campaign);
  saveStoredCampaigns(campaigns);

  return { success: true, campaign };
}

export async function updateCampaign({
  data,
}: {
  data: {
    campaignId: string;
    campaignName?: string;
    serviceName?: string;
    location?: string;
    isActive?: boolean;
    expiresAt?: string;
  };
}): Promise<{ success: boolean }> {
  const campaigns = getStoredCampaigns();
  const index = campaigns.findIndex((c) => c.id === data.campaignId);
  if (index !== -1) {
    if (data.campaignName) campaigns[index].campaign_name = sanitizeText(data.campaignName, 100);
    if (data.serviceName !== undefined) campaigns[index].service_name = sanitizeText(data.serviceName, 100) || null;
    if (data.location !== undefined) campaigns[index].location = sanitizeText(data.location, 100) || null;
    if (data.isActive !== undefined) campaigns[index].is_active = data.isActive;
    if (data.expiresAt !== undefined) campaigns[index].expires_at = data.expiresAt || null;
    campaigns[index].updated_at = new Date().toISOString();
    saveStoredCampaigns(campaigns);
  }
  return { success: true };
}

export async function deleteCampaign({
  data,
}: {
  data: { campaignId: string };
}): Promise<{ success: boolean }> {
  let campaigns = getStoredCampaigns();
  campaigns = campaigns.filter((c) => c.id !== data.campaignId);
  saveStoredCampaigns(campaigns);
  return { success: true };
}

export async function getAdminReports(): Promise<{ reports: ReviewReport[] }> {
  return {
    reports: [
      {
        id: "rep-001",
        review_id: "rev-004",
        reporter_name: "Visitor",
        reporter_email: "visitor@example.com",
        reason: "Spam",
        message: "Testing moderation queue functionality.",
        status: "open",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        resolved_at: null,
        resolved_by: null,
      },
    ],
  };
}

export async function resolveReport({
  data,
}: {
  data: { reportId: string; status: "resolved" | "dismissed" };
}): Promise<{ success: boolean }> {
  return { success: true };
}

export async function getReviewSettings(): Promise<{ settings: ReviewSettings }> {
  return {
    settings: {
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
    },
  };
}

export async function updateReviewSettings({
  data,
}: {
  data: Partial<ReviewSettings>;
}): Promise<{ success: boolean }> {
  return { success: true };
}
