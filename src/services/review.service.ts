/**
 * DIMISI Admin — Reviews & Testimonials Express API Service
 * Handles Public & Admin Reviews, Moderation Queue, and KPIs
 * against the Express backend API (/api/v1/admin-panel/reviews/*).
 */
import { apiRequest, ApiError, clearApiCache } from "./apiClient";
import type {
  AdminReview,
  PublicReview,
  ReviewReport,
  ReviewStats,
  ReviewStatus,
  ReviewType,
} from "@/lib/reviews.shared";
import { computeStats } from "@/lib/reviews.shared";

export interface BackendReviewDoc {
  _id: string;
  serviceName: string;
  reviewerType: "client" | "employee";
  fullName: string;
  email: string;
  company?: string;
  designation?: string;
  rating: number;
  reviewText: string;
  profileImageUrl?: string;
  consentToPublish: boolean;
  profileImagePublicId?: string;
  status: "pending" | "approved" | "rejected";
  verificationStatus: "verified" | "unverified";
  isActive: boolean;
  isReported?: boolean;
  report?: {
    reason: string;
    note?: string;
    reporterName?: string;
    reporterEmail?: string;
    reportedAt?: string;
  } | null;
  campaignId?: string | { _id: string; name?: string; slug?: string } | null;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendReviewListResponse {
  status: string;
  results?: number;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  data: {
    reviews: BackendReviewDoc[];
    total?: number;
    page?: number;
    totalPages?: number;
    stats?: any;
  } | BackendReviewDoc[];
}

export interface BackendReviewSingleResponse {
  status: string;
  message?: string;
  data: {
    review: BackendReviewDoc;
  };
}

export interface BackendReviewKpiResponse {
  status: string;
  data: {
    totalReviews?: number;
    pendingReviews?: number;
    approvedReviews?: number;
    rejectedReviews?: number;
    reportedReviews?: number;
    averageRating?: number;
    ratingBreakdown?: Record<string, number>;
  };
}

export interface SubmitReviewPayload {
  serviceName: string;
  reviewerType: "client" | "employee";
  fullName: string;
  email: string;
  company?: string | undefined;
  designation?: string | undefined;
  rating: number;
  reviewText: string;
  profileImageUrl?: string | undefined;
  consentToPublish: boolean;
  campaignId?: string | undefined;
}

export interface ReportReviewPayload {
  reason: string;
  note?: string | undefined;
  reporterName?: string | undefined;
  reporterEmail?: string | undefined;
  reportedAt?: string | undefined;
}

/**
 * Normalizes backend IReview document into frontend AdminReview model.
 */
export function normalizeBackendReview(doc: BackendReviewDoc): AdminReview {
  let campaignId: string | null = null;
  let campaignName: string | null = null;

  if (doc.campaignId) {
    if (typeof doc.campaignId === "object" && doc.campaignId !== null) {
      campaignId = String(doc.campaignId._id || "");
      campaignName = doc.campaignId.name || null;
    } else {
      campaignId = String(doc.campaignId);
    }
  }

  const isApproved = doc.status === "approved";
  const isRejected = doc.status === "rejected";

  return {
    id: String(doc._id),
    campaign_id: campaignId,
    campaign_name: campaignName,
    customer_name: doc.fullName || "Anonymous Reviewer",
    customer_email: doc.email || null,
    customer_phone: null,
    service_name: doc.serviceName || null,
    reviewer_type: doc.reviewerType === "employee" ? "employee" : "client",
    role_or_title: doc.designation || null,
    employee_department: doc.company || null,
    employment_status: doc.reviewerType === "employee" ? "current" : null,
    is_verified: doc.verificationStatus === "verified",
    rating: typeof doc.rating === "number" ? doc.rating : 5,
    review_text: doc.reviewText || "",
    customer_photo_url: doc.profileImageUrl || null,
    photo_url: doc.profileImageUrl || null,
    customer_location: null,
    consent_to_publish: Boolean(doc.consentToPublish),
    status: (doc.status as ReviewStatus) || "pending",
    is_featured: false,
    moderation_reason: doc.isReported ? `Reported: ${doc.report?.reason || "Flagged"}` : null,
    moderated_by: "system",
    submitter_ip: "127.0.0.1",
    submitted_at: doc.createdAt || new Date().toISOString(),
    approved_at: isApproved ? doc.updatedAt || doc.createdAt || null : null,
    rejected_at: isRejected ? doc.updatedAt || null : null,
    archived_at: doc.isActive === false ? doc.updatedAt || null : null,
    updated_at: doc.updatedAt || doc.createdAt || new Date().toISOString(),
  };
}

/**
 * Normalizes backend IReview document into frontend PublicReview model.
 */
export function normalizeBackendPublicReview(doc: BackendReviewDoc): PublicReview {
  return {
    id: String(doc._id),
    customer_name: doc.fullName || "Anonymous Reviewer",
    service_name: doc.serviceName || null,
    reviewer_type: doc.reviewerType === "employee" ? "employee" : "client",
    role_or_title: doc.designation || null,
    employee_department: doc.company || null,
    employment_status: doc.reviewerType === "employee" ? "current" : null,
    is_verified: doc.verificationStatus === "verified",
    rating: typeof doc.rating === "number" ? doc.rating : 5,
    review_text: doc.reviewText || "",
    photo_url: doc.profileImageUrl || null,
    customer_photo_url: doc.profileImageUrl || null,
    customer_location: null,
    is_featured: false,
    published_at: doc.createdAt || null,
    submitted_at: doc.createdAt || null,
  };
}

/**
 * Normalizes reported review into ReviewReport model.
 */
export function normalizeBackendReport(doc: BackendReviewDoc): ReviewReport | null {
  if (!doc.isReported && !doc.report) return null;

  return {
    id: `rep-${doc._id}`,
    review_id: String(doc._id),
    reporter_name: doc.report?.reporterName || "Community Member",
    reporter_email: doc.report?.reporterEmail || null,
    reason: doc.report?.reason || "Inappropriate Content",
    message: doc.report?.note || null,
    status: doc.isActive ? "resolved" : "open",
    created_at: doc.report?.reportedAt || doc.updatedAt || doc.createdAt || new Date().toISOString(),
    resolved_at: doc.isActive ? doc.updatedAt || null : null,
    resolved_by: null,
    review: {
      customer_name: doc.fullName,
      rating: doc.rating,
      review_text: doc.reviewText,
      status: (doc.status as ReviewStatus) || "pending",
    },
  };
}

/**
 * 1. GET PUBLIC ACTIVE REVIEWS
 * Endpoint: GET /api/v1/admin-panel/reviews/public/all
 */
export async function getPublicReviewsApi(options: {
  page?: number;
  limit?: number;
  serviceName?: string;
  rating?: number;
  type?: "client" | "employee";
} = {}): Promise<{
  reviews: PublicReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  if (options.serviceName && options.serviceName !== "all") params.set("serviceName", options.serviceName);
  if (options.rating) params.set("rating", String(options.rating));
  if (options.type) params.set("type", options.type);

  const query = params.toString() ? `?${params.toString()}` : "";

  try {
    const res = await apiRequest<BackendReviewListResponse>(
      `/api/v1/admin-panel/reviews/public/all${query}`,
      { method: "GET" },
    );

    let rawList: BackendReviewDoc[] = [];
    let total = 0;
    let page = options.page || 1;
    let limit = options.limit || 10;
    let totalPages = 1;

    if (res?.data && typeof res.data === "object") {
      if (Array.isArray(res.data)) {
        rawList = res.data;
        total = res.total || rawList.length;
      } else if (Array.isArray(res.data.reviews)) {
        rawList = res.data.reviews;
        total = res.data.total || res.total || rawList.length;
        page = res.data.page || page;
        totalPages = res.data.totalPages || 1;
      }
    } else if (Array.isArray((res as any)?.reviews)) {
      rawList = (res as any).reviews;
      total = (res as any).total || rawList.length;
    }

    return {
      reviews: rawList.map(normalizeBackendPublicReview),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (err) {
    console.warn("Failed to fetch public reviews from API:", err);
    throw err;
  }
}

/**
 * 2. SUBMIT PUBLIC REVIEW
 * Endpoint: POST /api/v1/admin-panel/reviews/:campainId/create
 */
export async function submitPublicReviewApi(payload: SubmitReviewPayload): Promise<AdminReview> {
  const campaignId = payload.campaignId?.trim();
  const endpoint = campaignId
    ? `/api/v1/admin-panel/reviews/${encodeURIComponent(campaignId)}/create`
    : "/api/v1/admin-panel/reviews/create";

  const res = await apiRequest<BackendReviewSingleResponse>(
    endpoint,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  clearApiCache("/api/v1/admin-panel/reviews");

  if (res?.data?.review) {
    return normalizeBackendReview(res.data.review);
  }
  throw new Error(res?.message || "Failed to submit review.");
}

/**
 * 3. REPORT REVIEW
 * Endpoint: PATCH /api/v1/admin-panel/reviews/:id/report
 */
export async function reportReviewApi(id: string, payload: ReportReviewPayload): Promise<boolean> {
  if (!id) throw new Error("Review ID is required.");

  const res = await apiRequest<{ status: string; message?: string }>(
    `/api/v1/admin-panel/reviews/${encodeURIComponent(id)}/report`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reason: payload.reason,
        note: payload.note || undefined,
        reporterName: payload.reporterName || undefined,
        reporterEmail: payload.reporterEmail || undefined,
        reportedAt: payload.reportedAt || new Date().toISOString(),
      }),
    },
  );

  clearApiCache("/api/v1/admin-panel/reviews");
  return res?.status === "success" || true;
}

/**
 * 4. GET ALL ADMIN REVIEWS
 * Endpoint: GET /api/v1/admin-panel/reviews/all
 */
export async function getAllAdminReviewsApi(filters: {
  status?: string | undefined;
  reviewerType?: string | undefined;
  verificationStatus?: string | undefined;
  rating?: number | undefined;
  serviceId?: string | undefined;
  isReported?: boolean | undefined;
  page?: number | undefined;
  limit?: number | undefined;
  sortBy?: string | undefined;
  sortOrder?: string | undefined;
  search?: string | undefined;
} = {}): Promise<{
  reviews: AdminReview[];
  reports: ReviewReport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.reviewerType && filters.reviewerType !== "all") params.set("reviewerType", filters.reviewerType);
  if (filters.verificationStatus && filters.verificationStatus !== "all") params.set("verificationStatus", filters.verificationStatus);
  if (filters.rating) params.set("rating", String(filters.rating));
  if (filters.serviceId) params.set("serviceId", filters.serviceId);
  if (filters.isReported !== undefined) params.set("isReported", String(filters.isReported));
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
  if (filters.search) params.set("search", filters.search);

  const query = params.toString() ? `?${params.toString()}` : "";

  const res = await apiRequest<BackendReviewListResponse>(
    `/api/v1/admin-panel/reviews/all${query}`,
    { method: "GET" },
  );

  let rawList: BackendReviewDoc[] = [];
  let total = 0;
  let page = filters.page || 1;
  let limit = filters.limit || 20;
  let totalPages = 1;

  if (res?.data && typeof res.data === "object") {
    if (Array.isArray(res.data)) {
      rawList = res.data;
      total = res.total || rawList.length;
    } else if (Array.isArray(res.data.reviews)) {
      rawList = res.data.reviews;
      total = res.data.total || res.total || rawList.length;
      page = res.data.page || page;
      totalPages = res.data.totalPages || 1;
    }
  } else if (Array.isArray((res as any)?.reviews)) {
    rawList = (res as any).reviews;
    total = (res as any).total || rawList.length;
  }

  const reviews = rawList.map(normalizeBackendReview);
  const reports = rawList
    .map(normalizeBackendReport)
    .filter((r): r is ReviewReport => r !== null);

  return {
    reviews,
    reports,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * 5. GET REVIEW KPIS
 * Endpoint: GET /api/v1/admin-panel/reviews/kips
 */
export async function getReviewKpisApi(): Promise<ReviewStats> {
  try {
    const res = await apiRequest<BackendReviewKpiResponse>(
      "/api/v1/admin-panel/reviews/kips",
      { method: "GET" },
    );

    const kpiData = res?.data || {};
    const total = typeof kpiData.totalReviews === "number" ? kpiData.totalReviews : 0;
    const avg = typeof kpiData.averageRating === "number" ? kpiData.averageRating : 5.0;
    const pendingCount = typeof kpiData.pendingReviews === "number" ? kpiData.pendingReviews : 0;
    const approvedCount = typeof kpiData.approvedReviews === "number" ? kpiData.approvedReviews : total;
    const rejectedCount = typeof kpiData.rejectedReviews === "number" ? kpiData.rejectedReviews : 0;
    const openReportsCount = typeof kpiData.reportedReviews === "number" ? kpiData.reportedReviews : 0;

    const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: kpiData.ratingBreakdown?.["1"] || 0,
      2: kpiData.ratingBreakdown?.["2"] || 0,
      3: kpiData.ratingBreakdown?.["3"] || 0,
      4: kpiData.ratingBreakdown?.["4"] || 0,
      5: kpiData.ratingBreakdown?.["5"] || 0,
    };

    return {
      total,
      totalReviews: total,
      average: avg,
      averageRating: avg,
      distribution,
      clientTotal: total,
      clientAverage: avg,
      employeeTotal: 0,
      employeeAverage: avg,
      pendingCount,
      approvedCount,
      rejectedCount,
      archivedCount: 0,
      reviewsThisMonth: total,
      overallConversionRate: 0,
      openReportsCount,
    };
  } catch (err) {
    console.warn("Failed to fetch review KPIs from API:", err);
    return computeStats([]);
  }
}

/**
 * 6. UPDATE REVIEW STATUS (APPROVE / REJECT)
 * Endpoint: PATCH /api/v1/admin-panel/reviews/:id/update
 */
export async function updateReviewStatusApi(
  id: string,
  status: "approved" | "rejected",
): Promise<AdminReview> {
  if (!id) throw new Error("Review ID is required.");

  const res = await apiRequest<BackendReviewSingleResponse>(
    `/api/v1/admin-panel/reviews/${encodeURIComponent(id)}/update`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );

  clearApiCache("/api/v1/admin-panel/reviews");

  if (res?.data?.review) {
    return normalizeBackendReview(res.data.review);
  }
  throw new Error(res?.message || "Failed to update review status.");
}

/**
 * 7. SOFT DELETE REVIEW
 * Endpoint: PATCH /api/v1/admin-panel/reviews/:id/delete
 */
export async function deleteReviewApi(id: string): Promise<boolean> {
  if (!id) throw new Error("Review ID is required.");

  const res = await apiRequest<{ status: string; message?: string }>(
    `/api/v1/admin-panel/reviews/${encodeURIComponent(id)}/delete`,
    {
      method: "PATCH",
    },
  );

  clearApiCache("/api/v1/admin-panel/reviews");
  return res?.status === "success" || true;
}

/**
 * 8. KEEP REVIEW (DISMISS REPORT)
 * Endpoint: PATCH /api/v1/admin-panel/reviews/:id/keep
 */
export async function keepReviewApi(id: string): Promise<AdminReview> {
  if (!id) throw new Error("Review ID is required.");

  const res = await apiRequest<BackendReviewSingleResponse>(
    `/api/v1/admin-panel/reviews/${encodeURIComponent(id)}/keep`,
    {
      method: "PATCH",
    },
  );

  clearApiCache("/api/v1/admin-panel/reviews");

  if (res?.data?.review) {
    return normalizeBackendReview(res.data.review);
  }
  throw new Error(res?.message || "Failed to keep review.");
}

/**
 * 9. TOGGLE REVIEW ACTIVATION
 * Endpoint: PATCH /api/v1/admin-panel/reviews/:id/toggle-active
 */
export async function toggleReviewActiveApi(id: string): Promise<AdminReview> {
  if (!id) throw new Error("Review ID is required.");

  const res = await apiRequest<BackendReviewSingleResponse>(
    `/api/v1/admin-panel/reviews/${encodeURIComponent(id)}/toggle-active`,
    {
      method: "PATCH",
    },
  );

  clearApiCache("/api/v1/admin-panel/reviews");

  if (res?.data?.review) {
    return normalizeBackendReview(res.data.review);
  }
  throw new Error(res?.message || "Failed to toggle review activation.");
}

/**
 * 10. TOGGLE REVIEW VERIFICATION
 * Endpoint: PATCH /api/v1/admin-panel/reviews/:id/toggle-verify
 */
export async function toggleReviewVerifyApi(id: string): Promise<AdminReview> {
  if (!id) throw new Error("Review ID is required.");

  const res = await apiRequest<BackendReviewSingleResponse>(
    `/api/v1/admin-panel/reviews/${encodeURIComponent(id)}/toggle-verify`,
    {
      method: "PATCH",
    },
  );

  clearApiCache("/api/v1/admin-panel/reviews");

  if (res?.data?.review) {
    return normalizeBackendReview(res.data.review);
  }
  throw new Error(res?.message || "Failed to toggle review verification.");
}
