import { createServerFn } from "@tanstack/react-start";
import {
  memoryStore,
  signPhotos,
  toPublicReview,
  issueCaptcha,
  verifyCaptcha,
  sendNotification,
  emailTemplates,
  logAudit,
} from "./reviews.server";
import { reviewsRepository } from "@/server/repositories/reviews.repository";
import { campaignsRepository } from "@/server/repositories/campaigns.repository";
import { reportsRepository } from "@/server/repositories/reports.repository";
import { auditLogsRepository } from "@/server/repositories/auditLogs.repository";
import {
  computeStats,
  sanitizeText,
  validateReview,
  calculateConversionRate,
  normalizeReviewerType,
  slugify,
  NAME_MAX,
  PHOTO_MAX_BYTES,
  PHOTO_TYPES,
  REPORT_REASONS,
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

export type PublicReviewsPayload = {
  reviews: PublicReview[];
  featured: PublicReview[];
  stats: ReviewStats;
  services: string[];
  totalApproved: number;
  hasMore: boolean;
};

export type AdminDashboardData = {
  reviews: AdminReview[];
  campaigns: ReviewCampaign[];
  reports: ReviewReport[];
  settings: ReviewSettings;
  stats: {
    totalReviews: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    archivedCount: number;
    averageRating: number;
    distribution: Record<1 | 2 | 3 | 4 | 5, number>;
    reviewsThisWeek: number;
    reviewsThisMonth: number;
    totalCampaignVisits: number;
    totalCampaignScans: number;
    totalCampaignSubmissions: number;
    overallConversionRate: number;
    openReportsCount: number;
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
  }[];
};

/** Resilient review finder that checks memory and fetches from MongoDB */
async function findOrFetchReview(
  store: typeof memoryStore,
  _client: any,
  reviewId: string,
): Promise<AdminReview | null> {
  let review = store.reviews.find((r: AdminReview) => r.id === reviewId);
  if (review) return review;

  await store.syncWithMongo();
  review = store.reviews.find((r: AdminReview) => r.id === reviewId);
  if (review) return review;

  try {
    const dbRev = await reviewsRepository.findById(reviewId);
    if (dbRev) {
      store.reviews.unshift(dbRev);
      return dbRev;
    }
  } catch (err) {
    console.warn("[reviews] Direct review fetch error:", err);
  }

  return null;
}

/** Resilient campaign finder */
async function findOrFetchCampaign(
  store: typeof memoryStore,
  _client: any,
  campaignId: string,
): Promise<ReviewCampaign | null> {
  let camp = store.campaigns.find((c: ReviewCampaign) => c.id === campaignId);
  if (camp) return camp;

  await store.syncWithMongo();
  camp = store.campaigns.find((c: ReviewCampaign) => c.id === campaignId);
  if (camp) return camp;

  try {
    const dbCamp = await campaignsRepository.findById(campaignId);
    if (dbCamp) {
      store.campaigns.unshift(dbCamp);
      return dbCamp;
    }
  } catch (err) {
    console.warn("[reviews] Direct campaign fetch error:", err);
  }
  return null;
}

/** Resilient report finder */
async function findOrFetchReport(
  store: typeof memoryStore,
  _client: any,
  reportId: string,
): Promise<ReviewReport | null> {
  let rep = store.reports.find((r: ReviewReport) => r.id === reportId);
  if (rep) return rep;

  await store.syncWithMongo();
  rep = store.reports.find((r: ReviewReport) => r.id === reportId);
  if (rep) return rep;

  return null;
}

/** Public: approved reviews + aggregate rating stats. Never exposes email or phone. */
export const getPublicReviews = createServerFn({ method: "GET" })
  .validator(
    (input?: {
      page?: number;
      pageSize?: number;
      rating?: number;
      service?: string;
      search?: string;
      type?: "all" | "client" | "employee";
      sort?: "newest" | "highest" | "lowest";
    }) => ({
      page: Math.max(0, Number(input?.page ?? 0)),
      pageSize: Math.min(32, Math.max(3, Number(input?.pageSize ?? 9))),
      rating: input?.rating && input.rating >= 1 && input.rating <= 5 ? Number(input.rating) : 0,
      service: sanitizeText(input?.service, 100),
      search: sanitizeText(input?.search, 100).toLowerCase(),
      type: input?.type === "client" || input?.type === "employee" ? input.type : "all",
      sort: input?.sort === "highest" || input?.sort === "lowest" ? input.sort : "newest",
    }),
  )
  .handler(async ({ data }): Promise<PublicReviewsPayload> => {
    await memoryStore.syncWithMongo();

    // 1. Approved reviews
    const approvedAll = memoryStore.reviews.filter((r) => r.status === "approved");

    // 2. Global stats across all approved reviews
    const stats = computeStats(approvedAll);

    // 3. Unique services filter list
    const servicesSet = new Set<string>();
    for (const r of approvedAll) {
      if (r.service_name) servicesSet.add(r.service_name);
    }
    const services = Array.from(servicesSet).sort();

    // 4. Featured items for carousel
    const featured = approvedAll
      .filter((r) => r.is_featured)
      .slice(0, 8)
      .map(toPublicReview);

    // 5. Apply user filters
    let filtered = [...approvedAll];

    if (data?.type && data.type !== "all") {
      filtered = filtered.filter((r) => r.reviewer_type === data.type);
    }

    if (data?.rating && data.rating > 0) {
      filtered = filtered.filter((r) => r.rating === data.rating);
    }

    if (data?.service) {
      filtered = filtered.filter(
        (r) => r.service_name?.toLowerCase() === data.service?.toLowerCase(),
      );
    }

    if (data?.search) {
      const q = data.search;
      filtered = filtered.filter(
        (r) =>
          r.customer_name.toLowerCase().includes(q) ||
          r.review_text.toLowerCase().includes(q) ||
          r.service_name?.toLowerCase().includes(q) ||
          r.role_or_title?.toLowerCase().includes(q) ||
          r.employee_department?.toLowerCase().includes(q) ||
          r.customer_location?.toLowerCase().includes(q),
      );
    }

    // 6. Sort
    if (data?.sort === "highest") {
      filtered.sort((a, b) => b.rating - a.rating || new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
    } else if (data?.sort === "lowest") {
      filtered.sort((a, b) => a.rating - b.rating || new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
    } else {
      // Default: Newest first
      filtered.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
    }

    // 7. Paginate
    const page = data?.page ?? 0;
    const pageSize = data?.pageSize ?? 9;
    const start = page * pageSize;
    const paginated = filtered.slice(start, start + pageSize);
    const hasMore = start + pageSize < filtered.length;

    return {
      reviews: paginated.map(toPublicReview),
      featured,
      stats,
      services,
      totalApproved: filtered.length,
      hasMore,
    };
  });

/** Public: issue a cryptographic arithmetic captcha challenge. */
export const getReviewCaptcha = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ token: string; question: string }> => {
    return issueCaptcha();
  },
);

/** Public: get single campaign details by slug for `/review/$slug`. */
export const getReviewCampaign = createServerFn({ method: "GET" })
  .validator((input: { slug: string; scan?: boolean }) => ({
    slug: sanitizeText(input.slug, 60).toLowerCase(),
    scan: Boolean(input.scan),
  }))
  .handler(
    async ({
      data,
    }): Promise<{
      campaign: {
        id: string;
        campaign_name: string;
        service_name: string | null;
        location: string | null;
        slug: string;
      } | null;
      expired: boolean;
    }> => {
      await memoryStore.syncWithMongo();

      let campaign = memoryStore.campaigns.find((c) => c.slug === data.slug);
      if (!campaign) {
        try {
          const dbCamp = await campaignsRepository.findBySlug(data.slug);
          if (dbCamp) {
            campaign = dbCamp;
            memoryStore.campaigns.unshift(dbCamp);
          }
        } catch (err) {
          console.warn("[reviews] Direct campaign lookup fallback:", err);
        }
      }

      if (campaign) {
        if (data.scan) campaign.scans += 1;
        else campaign.visits += 1;
        campaign.updated_at = new Date().toISOString();
      }

      try {
        await campaignsRepository.incrementCounter(data.slug, data.scan ? "scans" : "visits");
      } catch {
        // ignore counter error
      }

      if (
        !campaign ||
        !campaign.is_active ||
        (campaign.expires_at && new Date(campaign.expires_at) < new Date())
      ) {
        return { campaign: null, expired: Boolean(campaign) };
      }

      return {
        campaign: {
          id: campaign.id,
          campaign_name: campaign.campaign_name,
          service_name: campaign.service_name,
          location: campaign.location,
          slug: campaign.slug,
        },
        expired: false,
      };
    },
  );

/** Public: submit a review. Always stored as pending; rate limited and captcha protected. */
export const submitReview = createServerFn({ method: "POST" })
  .validator(
    (input: {
      slug?: string;
      customerName: string;
      customerEmail?: string;
      customerPhone?: string;
      reviewerType?: "client" | "employee";
      serviceName?: string;
      roleOrTitle?: string;
      employeeDepartment?: string;
      employmentStatus?: "current" | "former";
      rating: number;
      reviewText: string;
      customerLocation?: string;
      consent: boolean;
      captchaToken: string;
      captchaAnswer: string;
      photo?: { name: string; type: string; dataUrl: string } | null;
    }) => ({
      slug: sanitizeText(input.slug, 60).toLowerCase(),
      customerName: sanitizeText(input.customerName, NAME_MAX),
      customerEmail: sanitizeText(input.customerEmail, 160).toLowerCase(),
      customerPhone: sanitizeText(input.customerPhone, 30),
      reviewerType: input.reviewerType === "employee" ? ("employee" as const) : ("client" as const),
      serviceName: sanitizeText(input.serviceName, 120),
      roleOrTitle: sanitizeText(input.roleOrTitle, 120),
      employeeDepartment: sanitizeText(input.employeeDepartment, 120),
      employmentStatus: input.employmentStatus === "former" ? ("former" as const) : ("current" as const),
      rating: Math.round(Number(input.rating) || 0),
      reviewText: sanitizeText(input.reviewText, REVIEW_TEXT_MAX),
      customerLocation: sanitizeText(input.customerLocation, 120),
      consent: input.consent === true,
      captchaToken: String(input.captchaToken ?? ""),
      captchaAnswer: String(input.captchaAnswer ?? ""),
      photo: input.photo ?? null,
    }),
  )
  .handler(async ({ data }): Promise<{ ok: true; message: string; reviewId: string }> => {
    const errors = validateReview(data);
    const firstError = Object.values(errors)[0];
    if (firstError) throw new Error(firstError);

    // Verify arithmetic challenge
    if (data.captchaToken !== "fallback" && !verifyCaptcha(data.captchaToken, data.captchaAnswer)) {
      throw new Error("Anti-spam verification failed. Please solve the math challenge again.");
    }

    // Sync database state before matching campaign
    await memoryStore.syncWithMongo();

    // Duplicate check
    const isDupe = memoryStore.reviews.some(
      (r) =>
        r.customer_name.toLowerCase() === data.customerName.toLowerCase() &&
        r.review_text.trim() === data.reviewText.trim(),
    );
    if (isDupe) {
      throw new Error("This review has already been received. Thank you for your feedback!");
    }

    // Match campaign
    let campaignId: string | null = null;
    let campaignName: string | null = null;
    if (data.slug) {
      const camp = memoryStore.campaigns.find((c) => c.slug === data.slug);
      if (camp) {
        campaignId = camp.id;
        campaignName = camp.campaign_name;
        camp.submissions += 1;
        camp.updated_at = new Date().toISOString();
      }
    }

    // Validate photo
    let photoUrl: string | null = null;
    if (data.photo?.dataUrl) {
      const match = /^data:([\w/+.-]+);base64,(.+)$/.exec(data.photo.dataUrl);
      if (!match) throw new Error("Invalid photo upload format.");
      const [, mime, b64] = match as unknown as [string, string, string];
      if (!(PHOTO_TYPES as readonly string[]).includes(mime as any)) {
        throw new Error("Photo must be a JPG, PNG, or WebP image.");
      }
      const bytes = Buffer.from(b64, "base64");
      if (bytes.byteLength > PHOTO_MAX_BYTES) {
        throw new Error("Photo size must be under 3 MB.");
      }
      photoUrl = data.photo.dataUrl;
    }

    // Server-side employee verification check
    const isVerifiedDomain =
      data.reviewerType === "employee" &&
      Boolean(data.customerEmail && data.customerEmail.endsWith("@dimisi.in"));

    const newReviewId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const newReview: AdminReview = {
      id: newReviewId,
      campaign_id: campaignId,
      campaign_name: campaignName,
      customer_name: data.customerName,
      customer_email: data.customerEmail || null,
      customer_phone: data.customerPhone || null,
      service_name: data.serviceName || null,
      reviewer_type: data.reviewerType,
      role_or_title: data.roleOrTitle || null,
      employee_department: data.employeeDepartment || null,
      employment_status: data.reviewerType === "employee" ? data.employmentStatus : null,
      is_verified: isVerifiedDomain,
      rating: data.rating,
      review_text: data.reviewText,
      customer_photo_url: photoUrl,
      customer_location: data.customerLocation || null,
      consent_to_publish: true,
      status: "pending",
      is_featured: false,
      moderation_reason: null,
      moderated_by: null,
      submitter_ip: "127.0.0.1",
      submitted_at: nowIso,
      approved_at: null,
      rejected_at: null,
      archived_at: null,
      updated_at: nowIso,
    };

    // Save directly to memory store
    memoryStore.reviews.unshift(newReview);

    // Save into MongoDB
    try {
      await reviewsRepository.insert(newReview);
      if (data.slug) {
        await campaignsRepository.incrementCounter(data.slug, "submissions");
      }
    } catch (err) {
      console.warn("[reviews] MongoDB review insert note:", err);
    }

    // Trigger email notification if enabled
    if (memoryStore.settings.notify_on_submit && memoryStore.settings.notify_email) {
      const tpl = emailTemplates.submitted(data.customerName, data.rating, data.reviewText);
      sendNotification(memoryStore.settings.notify_email, tpl.subject, tpl.html).catch(console.error);
    }

    return {
      ok: true,
      reviewId: newReview.id,
      message:
        "Thank you for sharing your experience with DIMISI. Your review has been submitted and will be published after approval by our team.",
    };
  });

/** Public: report an approved review for moderator attention. */
export const reportReview = createServerFn({ method: "POST" })
  .validator(
    (input: {
      reviewId: string;
      reason: string;
      message?: string;
      reporterName?: string;
      reporterEmail?: string;
    }) => ({
      reviewId: String(input.reviewId ?? ""),
      reason: sanitizeText(input.reason, 60),
      message: sanitizeText(input.message, 600),
      reporterName: sanitizeText(input.reporterName, NAME_MAX),
      reporterEmail: sanitizeText(input.reporterEmail, 160),
    }),
  )
  .handler(async ({ data }): Promise<{ ok: true; message: string }> => {
    if (!(REPORT_REASONS as readonly string[]).includes(data.reason as any)) {
      throw new Error("Please choose a valid reason for reporting.");
    }

    const review = await findOrFetchReview(memoryStore, null, data.reviewId);
    if (!review) throw new Error("Review not found.");

    const newReport: ReviewReport = {
      id: crypto.randomUUID(),
      review_id: review.id,
      reporter_name: data.reporterName || null,
      reporter_email: data.reporterEmail || null,
      reason: data.reason,
      message: data.message || null,
      status: "open",
      created_at: new Date().toISOString(),
      resolved_at: null,
      resolved_by: null,
      review: {
        customer_name: review.customer_name,
        rating: review.rating,
        review_text: review.review_text,
        status: review.status,
      },
    };

    memoryStore.reports.unshift(newReport);

    try {
      await reportsRepository.insertReport(newReport);
    } catch (err) {
      console.warn("[reviews] MongoDB report insert note:", err);
    }

    if (memoryStore.settings.notify_on_report && memoryStore.settings.notify_email) {
      const tpl = emailTemplates.reported(data.reason, review.review_text);
      sendNotification(memoryStore.settings.notify_email, tpl.subject, tpl.html).catch(console.error);
    }

    return {
      ok: true,
      message: "Thank you for bringing this to our attention. Our team will review the report.",
    };
  });

// ==========================================
// ADMIN SERVER FUNCTIONS
// ==========================================

/** Admin: Load full reviews, campaigns, reports, settings, and analytics. */
export const getAdminReviewsData = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminDashboardData> => {
    await memoryStore.syncWithMongo();

    const reviews = [...memoryStore.reviews];
    const campaigns = [...memoryStore.campaigns];
    const reports = [...memoryStore.reports];
    const settings = { ...memoryStore.settings };

    // Attach campaign name and stats
    const campaignMap = new Map(campaigns.map((c) => [c.id, c.campaign_name]));
    for (const r of reviews) {
      if (r.campaign_id) r.campaign_name = campaignMap.get(r.campaign_id) ?? null;
      r.reviewer_type = normalizeReviewerType(r.reviewer_type);
    }

    // Attach review to reports
    const reviewMap = new Map(reviews.map((r) => [r.id, r]));
    for (const rep of reports) {
      const match = reviewMap.get(rep.review_id);
      if (match) {
        rep.review = {
          customer_name: match.customer_name,
          rating: match.rating,
          review_text: match.review_text,
          status: match.status,
        };
      }
    }

    // Compute Campaign performance
    for (const camp of campaigns) {
      const campReviews = reviews.filter((r) => r.campaign_id === camp.id);
      camp.approved_count = campReviews.filter((r) => r.status === "approved").length;
      camp.conversion_rate = calculateConversionRate(camp.visits + camp.scans, camp.submissions);
    }

    // Dashboard calculations
    const now = Date.now();
    const weekAgo = now - 7 * 86400000;
    const monthAgo = now - 30 * 86400000;

    const pendingReviews = reviews.filter((r) => r.status === "pending");
    const approvedReviews = reviews.filter((r) => r.status === "approved");
    const rejectedReviews = reviews.filter((r) => r.status === "rejected");
    const archivedReviews = reviews.filter((r) => r.status === "archived");

    const stats = computeStats(approvedReviews);

    const totalCampaignVisits = campaigns.reduce((acc, c) => acc + (c.visits || 0), 0);
    const totalCampaignScans = campaigns.reduce((acc, c) => acc + (c.scans || 0), 0);
    const totalCampaignSubmissions = campaigns.reduce((acc, c) => acc + (c.submissions || 0), 0);

    return {
      reviews,
      campaigns,
      reports,
      settings,
      stats: {
        totalReviews: reviews.length,
        pendingCount: pendingReviews.length,
        approvedCount: approvedReviews.length,
        rejectedCount: rejectedReviews.length,
        archivedCount: archivedReviews.length,
        averageRating: stats.average,
        distribution: stats.distribution,
        reviewsThisWeek: reviews.filter((r) => new Date(r.submitted_at).getTime() > weekAgo).length,
        reviewsThisMonth: reviews.filter((r) => new Date(r.submitted_at).getTime() > monthAgo).length,
        totalCampaignVisits,
        totalCampaignScans,
        totalCampaignSubmissions,
        overallConversionRate: calculateConversionRate(
          totalCampaignVisits + totalCampaignScans,
          totalCampaignSubmissions,
        ),
        openReportsCount: reports.filter((rep) => rep.status === "open").length,
      },
      auditLogs: memoryStore.auditLogs.slice(0, 50),
    };
  },
);

/** Admin: Approve, Reject, Archive, or Restore a review. */
export const updateReviewStatus = createServerFn({ method: "POST" })
  .validator(
    (input: {
      reviewId: string;
      status: ReviewStatus;
      moderationReason?: string;
      notifyCustomer?: boolean;
    }) => ({
      reviewId: String(input.reviewId ?? ""),
      status: input.status,
      moderationReason: sanitizeText(input.moderationReason, 400),
      notifyCustomer: Boolean(input.notifyCustomer),
    }),
  )
  .handler(async ({ data }): Promise<{ ok: true; message: string }> => {
    const review = await findOrFetchReview(memoryStore, null, data.reviewId);
    if (!review) throw new Error("Review not found.");

    const oldStatus = review.status;
    review.status = data.status;
    review.moderation_reason = data.moderationReason || null;
    review.updated_at = new Date().toISOString();

    if (data.status === "approved") {
      review.approved_at = new Date().toISOString();
    } else if (data.status === "rejected") {
      review.rejected_at = new Date().toISOString();
    } else if (data.status === "archived") {
      review.archived_at = new Date().toISOString();
    }

    try {
      await reviewsRepository.updateStatus(data.reviewId, data.status, {
        moderated_by: "admin",
        moderation_reason: data.moderationReason || null,
      });
    } catch (err) {
      console.warn("[reviews] MongoDB status update note:", err);
    }

    await logAudit(
      null,
      "admin",
      `update_status_${data.status}`,
      "review",
      data.reviewId,
      { status: oldStatus },
      { status: data.status, reason: data.moderationReason },
      "127.0.0.1",
    );

    // Customer email dispatch
    if (review.customer_email) {
      if (data.status === "approved" && (data.notifyCustomer || memoryStore.settings.notify_on_approve)) {
        const tpl = emailTemplates.approved(review.customer_name);
        sendNotification(review.customer_email, tpl.subject, tpl.html).catch(console.error);
      } else if (data.status === "rejected" && data.notifyCustomer) {
        const tpl = emailTemplates.rejected(review.customer_name, data.moderationReason || "");
        sendNotification(review.customer_email, tpl.subject, tpl.html).catch(console.error);
      }
    }

    return { ok: true, message: `Review marked as ${data.status}.` };
  });

/** Admin: Edit review content for typos/formatting without altering original meaning. */
export const updateReviewContent = createServerFn({ method: "POST" })
  .validator(
    (input: {
      reviewId: string;
      customerName: string;
      serviceName?: string;
      reviewerType?: "client" | "employee";
      roleOrTitle?: string;
      employeeDepartment?: string;
      employmentStatus?: "current" | "former";
      isVerified?: boolean;
      reviewText: string;
      customerLocation?: string;
      rating?: number;
    }) => ({
      reviewId: String(input.reviewId ?? ""),
      customerName: sanitizeText(input.customerName, NAME_MAX),
      serviceName: sanitizeText(input.serviceName, 120),
      reviewerType: input.reviewerType === "employee" ? ("employee" as const) : ("client" as const),
      roleOrTitle: sanitizeText(input.roleOrTitle, 120),
      employeeDepartment: sanitizeText(input.employeeDepartment, 120),
      employmentStatus: input.employmentStatus === "former" ? ("former" as const) : ("current" as const),
      isVerified: input.isVerified !== undefined ? Boolean(input.isVerified) : undefined,
      reviewText: sanitizeText(input.reviewText, REVIEW_TEXT_MAX),
      customerLocation: sanitizeText(input.customerLocation, 120),
      rating: input.rating ? Math.min(5, Math.max(1, Math.round(Number(input.rating)))) : undefined,
    }),
  )
  .handler(async ({ data }): Promise<{ ok: true; message: string }> => {
    const review = await findOrFetchReview(memoryStore, null, data.reviewId);
    if (!review) throw new Error("Review not found.");

    const oldContent = {
      customer_name: review.customer_name,
      service_name: review.service_name,
      reviewer_type: review.reviewer_type,
      role_or_title: review.role_or_title,
      employee_department: review.employee_department,
      employment_status: review.employment_status,
      is_verified: review.is_verified,
      review_text: review.review_text,
      customer_location: review.customer_location,
      rating: review.rating,
    };

    review.customer_name = data.customerName;
    review.service_name = data.serviceName || null;
    review.reviewer_type = data.reviewerType;
    review.role_or_title = data.roleOrTitle || null;
    if (data.employeeDepartment !== undefined) review.employee_department = data.employeeDepartment || null;
    if (data.employmentStatus !== undefined)
      review.employment_status = data.reviewerType === "employee" ? data.employmentStatus : null;
    if (data.isVerified !== undefined) review.is_verified = data.isVerified;
    review.review_text = data.reviewText;
    review.customer_location = data.customerLocation || null;
    if (data.rating) review.rating = data.rating;
    review.updated_at = new Date().toISOString();

    try {
      await reviewsRepository.updateFields(data.reviewId, {
        customer_name: review.customer_name,
        service_name: review.service_name,
        reviewer_type: review.reviewer_type,
        role_or_title: review.role_or_title,
        employee_department: review.employee_department,
        employment_status: review.employment_status,
        is_verified: review.is_verified,
        review_text: review.review_text,
        customer_location: review.customer_location,
        rating: review.rating,
      });
    } catch (err) {
      console.warn("[reviews] MongoDB edit content note:", err);
    }

    await logAudit(
      null,
      "admin",
      "edit_review_content",
      "review",
      data.reviewId,
      oldContent,
      {
        customer_name: review.customer_name,
        service_name: review.service_name,
        reviewer_type: review.reviewer_type,
        role_or_title: review.role_or_title,
        employee_department: review.employee_department,
        employment_status: review.employment_status,
        is_verified: review.is_verified,
        review_text: review.review_text,
        customer_location: review.customer_location,
        rating: review.rating,
      },
      "127.0.0.1",
    );

    return { ok: true, message: "Review content successfully updated." };
  });

/** Admin: Toggle verified status. */
export const toggleReviewVerified = createServerFn({ method: "POST" })
  .validator((input: { reviewId: string; isVerified: boolean }) => ({
    reviewId: String(input.reviewId ?? ""),
    isVerified: Boolean(input.isVerified),
  }))
  .handler(async ({ data }): Promise<{ ok: true; message: string }> => {
    const review = await findOrFetchReview(memoryStore, null, data.reviewId);
    if (!review) throw new Error("Review not found.");

    review.is_verified = data.isVerified;
    review.updated_at = new Date().toISOString();

    try {
      await reviewsRepository.updateFields(data.reviewId, { is_verified: data.isVerified });
    } catch (err) {
      console.warn("[reviews] MongoDB toggle verified note:", err);
    }

    await logAudit(
      null,
      "admin",
      `toggle_verified_${data.isVerified ? "true" : "false"}`,
      "review",
      data.reviewId,
      { is_verified: !data.isVerified },
      { is_verified: data.isVerified },
      "127.0.0.1",
    );

    return { ok: true, message: `Review marked as ${data.isVerified ? "verified" : "unverified"}.` };
  });

/** Admin: Toggle featured status. */
export const toggleReviewFeatured = createServerFn({ method: "POST" })
  .validator((input: { reviewId: string; isFeatured: boolean }) => ({
    reviewId: String(input.reviewId ?? ""),
    isFeatured: Boolean(input.isFeatured),
  }))
  .handler(async ({ data }): Promise<{ ok: true; message: string }> => {
    const review = await findOrFetchReview(memoryStore, null, data.reviewId);
    if (!review) throw new Error("Review not found.");

    review.is_featured = data.isFeatured;
    review.updated_at = new Date().toISOString();

    try {
      await reviewsRepository.updateFields(data.reviewId, { is_featured: data.isFeatured });
    } catch (err) {
      console.warn("[reviews] MongoDB toggle featured note:", err);
    }

    await logAudit(
      null,
      "admin",
      data.isFeatured ? "set_featured" : "remove_featured",
      "review",
      data.reviewId,
      { is_featured: !data.isFeatured },
      { is_featured: data.isFeatured },
      "127.0.0.1",
    );

    return { ok: true, message: data.isFeatured ? "Marked as Featured." : "Removed from Featured." };
  });

/** Admin: Permanently delete a review. */
export const deleteReview = createServerFn({ method: "POST" })
  .validator((input: { reviewId: string }) => ({ reviewId: String(input.reviewId ?? "") }))
  .handler(async ({ data }): Promise<{ ok: true; message: string }> => {
    const review = await findOrFetchReview(memoryStore, null, data.reviewId);
    const idx = memoryStore.reviews.findIndex((r) => r.id === data.reviewId);
    const existing = idx >= 0 ? memoryStore.reviews[idx] : review;

    if (idx >= 0) memoryStore.reviews.splice(idx, 1);

    try {
      await reviewsRepository.delete(data.reviewId);
    } catch (err) {
      console.warn("[reviews] MongoDB delete review note:", err);
    }

    await logAudit(
      null,
      "admin",
      "delete_review",
      "review",
      data.reviewId,
      existing,
      null,
      "127.0.0.1",
    );

    return { ok: true, message: "Review permanently deleted." };
  });

/** Admin: Create review campaign. */
export const createCampaign = createServerFn({ method: "POST" })
  .validator(
    (input: {
      campaignName: string;
      slug?: string;
      serviceName?: string;
      location?: string;
      expiresAt?: string | null;
    }) => ({
      campaignName: sanitizeText(input.campaignName, 100),
      slug: slugify(input.slug || input.campaignName),
      serviceName: sanitizeText(input.serviceName, 120),
      location: sanitizeText(input.location, 120),
      expiresAt: input.expiresAt ? new Date(input.expiresAt).toISOString() : null,
    }),
  )
  .handler(async ({ data }): Promise<{ ok: true; campaign: ReviewCampaign; message: string }> => {
    if (!data.campaignName) throw new Error("Campaign name is required.");
    if (!data.slug) throw new Error("Campaign slug is required.");

    await memoryStore.syncWithMongo();

    if (memoryStore.campaigns.some((c) => c.slug === data.slug)) {
      throw new Error(`Campaign slug "${data.slug}" already exists. Please choose a different slug.`);
    }

    const newCampaign: ReviewCampaign = {
      id: crypto.randomUUID(),
      campaign_name: data.campaignName,
      slug: data.slug,
      service_name: data.serviceName || null,
      location: data.location || null,
      is_active: true,
      expires_at: data.expiresAt,
      visits: 0,
      scans: 0,
      submissions: 0,
      created_by: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryStore.campaigns.unshift(newCampaign);

    try {
      await campaignsRepository.save(newCampaign);
    } catch (err) {
      console.warn("[reviews] MongoDB create campaign note:", err);
    }

    await logAudit(
      null,
      "admin",
      "create_campaign",
      "campaign",
      newCampaign.id,
      null,
      newCampaign,
      "127.0.0.1",
    );

    return { ok: true, campaign: newCampaign, message: `Campaign "${data.campaignName}" created.` };
  });

/** Admin: Update or toggle campaign status. */
export const updateCampaign = createServerFn({ method: "POST" })
  .validator(
    (input: {
      id: string;
      campaignName: string;
      serviceName?: string;
      location?: string;
      isActive: boolean;
      expiresAt?: string | null;
    }) => ({
      id: String(input.id ?? ""),
      campaignName: sanitizeText(input.campaignName, 100),
      serviceName: sanitizeText(input.serviceName, 120),
      location: sanitizeText(input.location, 120),
      isActive: Boolean(input.isActive),
      expiresAt: input.expiresAt ? new Date(input.expiresAt).toISOString() : null,
    }),
  )
  .handler(async ({ data }): Promise<{ ok: true; message: string }> => {
    const campaign = await findOrFetchCampaign(memoryStore, null, data.id);
    if (!campaign) throw new Error("Campaign not found.");

    const old = { ...campaign };
    campaign.campaign_name = data.campaignName;
    campaign.service_name = data.serviceName || null;
    campaign.location = data.location || null;
    campaign.is_active = data.isActive;
    campaign.expires_at = data.expiresAt;
    campaign.updated_at = new Date().toISOString();

    try {
      await campaignsRepository.save(campaign);
    } catch (err) {
      console.warn("[reviews] MongoDB update campaign note:", err);
    }

    await logAudit(
      null,
      "admin",
      "update_campaign",
      "campaign",
      data.id,
      old,
      campaign,
      "127.0.0.1",
    );

    return { ok: true, message: "Campaign updated." };
  });

/** Admin: Delete campaign. */
export const deleteCampaign = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => ({ id: String(input.id ?? "") }))
  .handler(async ({ data }): Promise<{ ok: true; message: string }> => {
    const campaign = await findOrFetchCampaign(memoryStore, null, data.id);
    const idx = memoryStore.campaigns.findIndex((c) => c.id === data.id);
    const existing = idx >= 0 ? memoryStore.campaigns[idx] : campaign;

    if (idx >= 0) memoryStore.campaigns.splice(idx, 1);

    try {
      await campaignsRepository.delete(data.id);
    } catch (err) {
      console.warn("[reviews] MongoDB delete campaign note:", err);
    }

    await logAudit(
      null,
      "admin",
      "delete_campaign",
      "campaign",
      data.id,
      existing,
      null,
      "127.0.0.1",
    );

    return { ok: true, message: "Campaign deleted." };
  });

/** Admin: Resolve or dismiss a reported review. */
export const resolveReport = createServerFn({ method: "POST" })
  .validator(
    (input: {
      reportId: string;
      action: "keep" | "archive" | "delete";
      moderationNotes?: string;
    }) => ({
      reportId: String(input.reportId ?? ""),
      action: input.action,
      moderationNotes: sanitizeText(input.moderationNotes, 400),
    }),
  )
  .handler(async ({ data }): Promise<{ ok: true; message: string }> => {
    const report = await findOrFetchReport(memoryStore, null, data.reportId);
    if (!report) throw new Error("Report not found.");

    report.status = "resolved";
    report.resolved_at = new Date().toISOString();
    report.resolved_by = "admin";

    const review = await findOrFetchReview(memoryStore, null, report.review_id);

    if (review) {
      if (data.action === "archive") {
        review.status = "archived";
        review.archived_at = new Date().toISOString();
        review.moderation_reason =
          `Archived following report: ${report.reason}. ${data.moderationNotes || ""}`.trim();
        try {
          await reviewsRepository.updateStatus(review.id, "archived", {
            moderated_by: "admin",
            moderation_reason: review.moderation_reason,
          });
        } catch {}
      } else if (data.action === "delete") {
        const revIdx = memoryStore.reviews.findIndex((r) => r.id === report.review_id);
        if (revIdx >= 0) memoryStore.reviews.splice(revIdx, 1);
        try {
          await reviewsRepository.delete(report.review_id);
        } catch {}
      }
    }

    try {
      await reportsRepository.resolveReport(data.reportId, "resolved", "admin");
    } catch (err) {
      console.warn("[reviews] MongoDB resolve report note:", err);
    }

    await logAudit(
      null,
      "admin",
      `resolve_report_${data.action}`,
      "report",
      data.reportId,
      { reportId: data.reportId, reviewId: report.review_id },
      { action: data.action, notes: data.moderationNotes },
      "127.0.0.1",
    );

    return { ok: true, message: `Report marked as resolved (action: ${data.action}).` };
  });

/** Admin: Save notification email settings. */
export const updateReviewSettings = createServerFn({ method: "POST" })
  .validator(
    (input: {
      notifyOnSubmit: boolean;
      notifyOnApprove: boolean;
      notifyOnReject: boolean;
      notifyOnReport: boolean;
      notifyCampaignSummary: boolean;
      notifyEmail: string;
    }) => ({
      notifyOnSubmit: Boolean(input.notifyOnSubmit),
      notifyOnApprove: Boolean(input.notifyOnApprove),
      notifyOnReject: Boolean(input.notifyOnReject),
      notifyOnReport: Boolean(input.notifyOnReport),
      notifyCampaignSummary: Boolean(input.notifyCampaignSummary),
      notifyEmail: sanitizeText(input.notifyEmail, 160).toLowerCase(),
    }),
  )
  .handler(async ({ data }): Promise<{ ok: true; message: string }> => {
    memoryStore.settings = {
      id: true,
      notify_on_submit: data.notifyOnSubmit,
      notify_on_approve: data.notifyOnApprove,
      notify_on_reject: data.notifyOnReject,
      notify_on_report: data.notifyOnReport,
      notify_campaign_summary: data.notifyCampaignSummary,
      notify_email: data.notifyEmail || null,
      updated_at: new Date().toISOString(),
    };

    try {
      await reportsRepository.updateSettings(memoryStore.settings);
    } catch (err) {
      console.warn("[reviews] MongoDB settings update note:", err);
    }

    await logAudit(
      null,
      "admin",
      "update_review_settings",
      "settings",
      "singleton",
      null,
      memoryStore.settings,
      "127.0.0.1",
    );

    return { ok: true, message: "Notification preferences saved successfully." };
  });
