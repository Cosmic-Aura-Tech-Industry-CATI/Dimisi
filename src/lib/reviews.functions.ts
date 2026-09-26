/**
 * DIMISI Technologies — Reviews & Moderation Manager
 * Connects to live Express backend API endpoints (/api/v1/admin-panel/reviews/* and /api/v1/admin-panel/campaigns/*).
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
import {
  getAllAdminCampaignsApi,
  getPublicCampaignBySlugApi,
  createAdminCampaignApi,
  toggleAdminCampaignApi,
  deleteAdminCampaignApi,
} from "@/services/campaign.service";
import {
  getPublicReviewsApi,
  submitPublicReviewApi,
  reportReviewApi,
  getAllAdminReviewsApi,
  getReviewKpisApi,
  updateReviewStatusApi,
  deleteReviewApi,
  keepReviewApi,
  toggleReviewActiveApi,
  toggleReviewVerifyApi,
  normalizeBackendPublicReview,
} from "@/services/review.service";

const CAMPAIGNS_STORAGE_KEY = "dimisi_campaigns_v1";
const SETTINGS_STORAGE_KEY = "dimisi_settings_v1";

const DEFAULT_SETTINGS: ReviewSettings = {
  id: true,
  notify_on_submit: true,
  notify_on_approve: true,
  notify_on_reject: false,
  notify_on_report: true,
  notify_campaign_summary: true,
  notify_email: "contact@dimisi.in",
  updated_at: new Date().toISOString(),
};

function getStoredCampaigns(): ReviewCampaign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
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
    photo_url: row.customer_photo_url ?? row.photo_url ?? null,
    customer_photo_url: row.customer_photo_url ?? row.photo_url ?? null,
    customer_location: row.customer_location,
    is_featured: row.is_featured,
    published_at: row.submitted_at ?? null,
    submitted_at: row.submitted_at,
  };
}

/**
 * 1. GET PUBLIC REVIEWS
 * Fetches approved active reviews from live MongoDB.
 */
export async function getPublicReviews({
  data,
}: {
  data?: {
    page?: number;
    pageSize?: number;
    type?: ReviewType | "all";
    reviewerType?: ReviewType | "all";
    rating?: number;
    service?: string;
    search?: string;
    sort?: "newest" | "highest" | "lowest";
    sortBy?: "newest" | "highest" | "lowest";
  };
} = {}): Promise<{
  reviews: PublicReview[];
  featured: PublicReview[];
  stats: ReviewStats;
  services: string[];
  total: number;
  totalApproved: number;
  hasMore: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const page = data?.page !== undefined ? data.page + 1 : 1;
  const limit = data?.pageSize || 9;
  const targetType = data?.type || data?.reviewerType;
  const reviewerType = targetType && targetType !== "all" ? targetType : undefined;

  try {
    let rawReviews: PublicReview[] = [];
    let totalCount = 0;
    let totalPagesCount = 1;

    try {
      const res = await getPublicReviewsApi({
        page,
        limit: 100, // Fetch broader batch to enable accurate client-side search & filtering
        serviceName: data?.service && data.service !== "all" ? data.service : undefined,
        rating: data?.rating,
        type: reviewerType,
      });

      if (Array.isArray(res?.reviews) && res.reviews.length > 0) {
        rawReviews = res.reviews;
        totalCount = res.total;
        totalPagesCount = res.totalPages;
      }
    } catch (apiErr) {
      console.warn("[Reviews] Public API fetch warning:", apiErr);
    }

    // Fallback: If public endpoint returned 0 items (e.g. backend isActive query mismatch),
    // and an admin is logged in / viewing from panel, load approved reviews directly from MongoDB
    if (rawReviews.length === 0 && typeof window !== "undefined") {
      try {
        const adminRes = await getAllAdminReviewsApi({
          status: "approved",
          page: 1,
          limit: 100,
          serviceId: data?.service && data.service !== "all" ? data.service : undefined,
          rating: data?.rating,
          reviewerType: reviewerType,
        });

        if (Array.isArray(adminRes?.reviews) && adminRes.reviews.length > 0) {
          rawReviews = adminRes.reviews.map(toPublicReview);
          totalCount = adminRes.total;
          totalPagesCount = Math.ceil(totalCount / limit) || 1;
        }
      } catch {
        // Unauthenticated visitor or admin endpoint unavailable
      }
    }

    // Client-side Search filter
    let filtered = rawReviews;
    if (data?.search && data.search.trim()) {
      const q = data.search.trim().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.customer_name?.toLowerCase().includes(q) ||
          r.review_text?.toLowerCase().includes(q) ||
          r.service_name?.toLowerCase().includes(q) ||
          r.role_or_title?.toLowerCase().includes(q) ||
          r.employee_department?.toLowerCase().includes(q),
      );
    }

    // Client-side Rating filter
    if (data?.rating && data.rating > 0) {
      filtered = filtered.filter((r) => r.rating === data.rating);
    }

    // Client-side Service filter
    if (data?.service && data.service !== "all" && data.service.trim()) {
      const svc = data.service.trim().toLowerCase();
      filtered = filtered.filter((r) => r.service_name?.toLowerCase() === svc);
    }

    // Client-side Type filter
    if (reviewerType) {
      filtered = filtered.filter((r) => r.reviewer_type === reviewerType);
    }

    // Sorting
    const sortOrder = data?.sort || data?.sortBy || "newest";
    filtered = [...filtered].sort((a, b) => {
      if (sortOrder === "highest") return b.rating - a.rating;
      if (sortOrder === "lowest") return a.rating - b.rating;
      // newest
      const dateA = new Date(a.published_at || a.submitted_at || 0).getTime();
      const dateB = new Date(b.published_at || b.submitted_at || 0).getTime();
      return dateB - dateA;
    });

    const services = Array.from(
      new Set(rawReviews.map((r) => r.service_name).filter(Boolean) as string[]),
    ).sort();

    const featured = rawReviews.filter((r) => r.rating >= 5).slice(0, 3);
    const stats = computeStats(rawReviews as any[]);

    const startIndex = (page - 1) * limit;
    const paginatedReviews = filtered.slice(startIndex, startIndex + limit);

    return {
      reviews: paginatedReviews,
      featured,
      stats,
      services,
      total: filtered.length,
      totalApproved: rawReviews.length,
      hasMore: startIndex + limit < filtered.length,
      page: (data?.page || 0),
      pageSize: limit,
      totalPages: Math.ceil(filtered.length / limit) || 1,
    };
  } catch (err) {
    console.warn("Failed to fetch public reviews from API:", err);
    return {
      reviews: [],
      featured: [],
      stats: computeStats([]),
      services: [],
      total: 0,
      totalApproved: 0,
      hasMore: false,
      page: 0,
      pageSize: limit,
      totalPages: 1,
    };
  }
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
  try {
    const campaign = await getPublicCampaignBySlugApi(data.slug);
    return { campaign };
  } catch {
    const campaigns = getStoredCampaigns();
    const campaign = campaigns.find((c) => c.slug === data.slug && c.is_active) || null;
    return { campaign };
  }
}

/**
 * 2. SUBMIT PUBLIC REVIEW
 * Submits review to live backend API.
 */
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
    photo?: { dataUrl?: string } | null;
    customerLocation?: string;
    consent: boolean;
    campaignId?: string;
    slug?: string;
    captchaToken?: string;
    captchaAnswer?: string;
  };
}): Promise<{ success: boolean; reviewId: string }> {
  let resolvedCampaignId = data.campaignId;
  if (!resolvedCampaignId && data.slug) {
    try {
      const publicCamp = await getPublicCampaignBySlugApi(data.slug);
      if (publicCamp && publicCamp.id && !publicCamp.id.startsWith("camp-")) {
        resolvedCampaignId = publicCamp.id;
      }
    } catch {}
  }

  const effectivePhoto = data.customerPhoto || data.photo?.dataUrl || undefined;

  const created = await submitPublicReviewApi({
    serviceName: sanitizeText(data.serviceName, 100) || "General Services",
    reviewerType: data.reviewerType === "employee" ? "employee" : "client",
    fullName: sanitizeText(data.customerName, 80),
    email: sanitizeText(data.customerEmail, 160) || "anonymous@dimisi.tech",
    company: sanitizeText(data.employeeDepartment || data.customerLocation, 120) || undefined,
    designation: sanitizeText(data.roleOrTitle, 100) || undefined,
    rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
    reviewText: sanitizeText(data.reviewText, 2000),
    profileImageUrl: effectivePhoto,
    consentToPublish: true,
    campaignId: resolvedCampaignId || undefined,
  });

  return { success: true, reviewId: created.id };
}

/**
 * 3. REPORT REVIEW
 */
export async function reportReview({
  data,
}: {
  data: {
    reviewId: string;
    reporterName?: string | undefined;
    reporterEmail?: string | undefined;
    reason: string;
    message?: string | undefined;
  };
}): Promise<{ success: boolean; message?: string }> {
  await reportReviewApi(data.reviewId, {
    reason: data.reason,
    note: data.message,
    reporterName: data.reporterName,
    reporterEmail: data.reporterEmail,
  });
  return { success: true, message: "Report submitted successfully." };
}

/**
 * 3b. RESOLVE REPORT (KEEP OR DELETE)
 */
export async function resolveReport({
  data,
}: {
  data: {
    reportId: string;
    status: "resolved" | "dismissed";
    actionTaken?: string | undefined;
    actionNote?: string | undefined;
  };
}): Promise<{ success: boolean }> {
  if (!data.reportId) return { success: false };
  if (data.status === "dismissed") {
    await keepReviewApi(data.reportId);
  } else {
    await deleteReviewApi(data.reportId);
  }
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
  const [reviewsRes, campaignsRes, statsRes, settingsRes] = await Promise.allSettled([
    getAdminReviews(),
    getAdminCampaigns(),
    getReviewKpisApi(),
    getReviewSettings(),
  ]);

  const reviewsData = reviewsRes.status === "fulfilled" ? reviewsRes.value : { reviews: [], total: 0, stats: computeStats([]) };
  const campaignsData = campaignsRes.status === "fulfilled" ? campaignsRes.value : { campaigns: [] };
  const reportsData = await getAdminReports();
  const settingsData = settingsRes.status === "fulfilled" ? settingsRes.value : { settings: DEFAULT_SETTINGS };
  const stats = statsRes.status === "fulfilled" ? statsRes.value : reviewsData.stats;

  return {
    reviews: reviewsData.reviews,
    campaigns: campaignsData.campaigns,
    reports: reportsData.reports,
    settings: settingsData.settings,
    stats,
  };
}

export async function getAdminReviews({
  data,
}: {
  data?: {
    page?: number | undefined;
    pageSize?: number | undefined;
    status?: ReviewStatus | "all" | undefined;
    rating?: number | undefined;
    reviewerType?: ReviewType | "all" | undefined;
    search?: string | undefined;
    sortBy?: string | undefined;
    sortOrder?: string | undefined;
  } | undefined;
} = {}): Promise<{
  reviews: AdminReview[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats: ReviewStats;
}> {
  const res = await getAllAdminReviewsApi({
    status: data?.status && data.status !== "all" ? data.status : undefined,
    reviewerType: data?.reviewerType && data.reviewerType !== "all" ? data.reviewerType : undefined,
    rating: data?.rating,
    page: data?.page || 1,
    limit: data?.pageSize || 20,
    search: data?.search,
    sortBy: data?.sortBy,
    sortOrder: data?.sortOrder,
  });

  const stats = await getReviewKpisApi();

  return {
    reviews: res.reviews,
    total: res.total,
    page: res.page,
    pageSize: res.limit,
    totalPages: res.totalPages,
    stats,
  };
}

export async function getAdminReports(): Promise<{ reports: ReviewReport[] }> {
  try {
    const res = await getAllAdminReviewsApi({ isReported: true });
    return { reports: res.reports };
  } catch (err) {
    console.warn("Failed to fetch admin reports from API:", err);
    return { reports: [] };
  }
}

export async function getReviewStats(): Promise<ReviewStats> {
  return await getReviewKpisApi();
}

export async function updateReviewStatus({
  data,
}: {
  data: {
    reviewId: string;
    status: ReviewStatus;
    reason?: string | undefined;
    moderationReason?: string | undefined;
    notifyCustomer?: boolean | undefined;
  };
}): Promise<{ success: boolean }> {
  if (!data.reviewId) return { success: false };
  await updateReviewStatusApi(
    data.reviewId,
    data.status === "approved" ? "approved" : "rejected",
  );
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
    employeeDepartment?: string;
    employmentStatus?: "current" | "former";
    isVerified?: boolean;
    rating: number;
    reviewText: string;
    customerLocation?: string;
  };
}): Promise<{ success: boolean }> {
  return { success: true };
}

export const updateReviewContent = editReviewContent;
export const deleteReview = deleteReviewAdmin;

export async function toggleReviewVerified({
  data,
}: {
  data: { reviewId: string; isVerified: boolean };
}): Promise<{ success: boolean }> {
  if (!data.reviewId) return { success: false };
  await toggleReviewVerifyApi(data.reviewId);
  return { success: true };
}

export async function toggleReviewFeatured({
  data,
}: {
  data: { reviewId: string; isFeatured: boolean };
}): Promise<{ success: boolean }> {
  if (!data.reviewId) return { success: false };
  await toggleReviewActiveApi(data.reviewId);
  return { success: true };
}

export async function deleteReviewAdmin({
  data,
}: {
  data: { reviewId: string };
}): Promise<{ success: boolean }> {
  if (!data.reviewId) return { success: false };
  await deleteReviewApi(data.reviewId);
  return { success: true };
}

export async function keepReviewAdmin({
  data,
}: {
  data: { reviewId: string };
}): Promise<{ success: boolean }> {
  if (!data.reviewId) return { success: false };
  await keepReviewApi(data.reviewId);
  return { success: true };
}

export async function getAdminCampaigns(): Promise<{ campaigns: ReviewCampaign[] }> {
  try {
    const campaigns = await getAllAdminCampaignsApi();
    if (Array.isArray(campaigns)) {
      saveStoredCampaigns(campaigns);
      return { campaigns };
    }
    return { campaigns: [] };
  } catch (err) {
    console.warn("Failed to fetch campaigns from backend API, falling back to cached list:", err);
    return { campaigns: getStoredCampaigns() };
  }
}

export async function createCampaign({
  data,
}: {
  data: {
    campaignName: string;
    slug?: string;
    serviceId?: string;
    serviceName?: string;
    location?: string;
    expiresAt?: string;
  };
}): Promise<{ success: boolean; campaign: ReviewCampaign }> {
  const name = sanitizeText(data.campaignName, 120);
  const location = sanitizeText(data.location, 200) || "DIMISI HQ, New Delhi";
  const slug = data.slug?.trim() ? slugify(data.slug) : slugify(name);

  const created = await createAdminCampaignApi({
    name,
    slug,
    location,
    serviceId: data.serviceId || undefined,
    serviceName: data.serviceName ? sanitizeText(data.serviceName, 150) : undefined,
    expiresAt: data.expiresAt || undefined,
    isActive: true,
  });

  const campaigns = getStoredCampaigns();
  campaigns.unshift(created);
  saveStoredCampaigns(campaigns);

  return { success: true, campaign: created };
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
}): Promise<{ success: boolean; campaign?: ReviewCampaign }> {
  const updated = await toggleAdminCampaignApi(data.campaignId);
  return { success: true, campaign: updated };
}

export async function deleteCampaign({
  data,
}: {
  data: { campaignId: string };
}): Promise<{ success: boolean }> {
  await deleteAdminCampaignApi(data.campaignId);
  let campaigns = getStoredCampaigns();
  campaigns = campaigns.filter((c) => c.id !== data.campaignId);
  saveStoredCampaigns(campaigns);
  return { success: true };
}

export async function getReviewSettings(): Promise<{ settings: ReviewSettings }> {
  if (typeof window === "undefined") return { settings: DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) return { settings: JSON.parse(raw) };
  } catch {}
  return { settings: DEFAULT_SETTINGS };
}

export async function updateReviewSettings({
  data,
}: {
  data: Partial<ReviewSettings>;
}): Promise<{ success: boolean; settings: ReviewSettings }> {
  const current = (await getReviewSettings()).settings;
  const merged: ReviewSettings = {
    ...current,
    ...data,
    updated_at: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
    } catch {}
  }
  return { success: true, settings: merged };
}
