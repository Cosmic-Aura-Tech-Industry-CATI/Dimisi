import { createServerFn } from "@tanstack/react-start";
import {
  computeStats,
  sanitizeText,
  validateReview,
  calculateConversionRate,
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
      pageSize: Math.min(24, Math.max(3, Number(input?.pageSize ?? 9))),
      rating: input?.rating && input.rating >= 1 && input.rating <= 5 ? Number(input.rating) : 0,
      service: sanitizeText(input?.service, 100),
      search: sanitizeText(input?.search, 100).toLowerCase(),
      type: input?.type === "client" || input?.type === "employee" ? input.type : "all",
      sort: input?.sort === "highest" || input?.sort === "lowest" ? input.sort : "newest",
    }),
  )
  .handler(async ({ data }): Promise<PublicReviewsPayload> => {
    const { memoryStore, signPhotos, toPublicReview } = await import("./reviews.server");
    let { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let allApproved: AdminReview[] = [];

    try {
      if (supabaseAdmin) {
        const { data: rows, error } = await supabaseAdmin
          .from("reviews")
          .select("id, campaign_id, customer_name, customer_email, customer_phone, service_name, rating, review_text, customer_photo_url, customer_location, consent_to_publish, status, is_featured, moderation_reason, moderated_by, submitter_ip, submitted_at, approved_at, rejected_at, archived_at, updated_at")
          .eq("status", "approved")
          .order("is_featured", { ascending: false })
          .order("approved_at", { ascending: false, nullsFirst: false });

        if (!error && rows && rows.length > 0) {
          allApproved = rows as unknown as AdminReview[];
        }
      }
    } catch {
      // fallback to memoryStore
    }

    if (allApproved.length === 0) {
      allApproved = memoryStore.reviews.filter((r) => r.status === "approved");
    }

    // Compute stats from ALL approved reviews
    const stats = computeStats(allApproved);
    const services = Array.from(new Set(allApproved.map((r) => r.service_name).filter((s): s is string => !!s)));

    // Featured list
    const featuredRows = allApproved.filter((r) => r.is_featured).slice(0, 4);

    // Apply filtering
    let filtered = [...allApproved];
    if (data.type && data.type !== "all") {
      filtered = filtered.filter((r) => (r.reviewer_type || "client") === data.type);
    }
    if (data.rating > 0) {
      filtered = filtered.filter((r) => Math.round(r.rating) === data.rating);
    }
    if (data.service) {
      filtered = filtered.filter((r) => r.service_name === data.service);
    }
    if (data.search) {
      filtered = filtered.filter(
        (r) =>
          r.customer_name.toLowerCase().includes(data.search) ||
          r.review_text.toLowerCase().includes(data.search) ||
          (r.role_or_title && r.role_or_title.toLowerCase().includes(data.search)) ||
          (r.customer_location && r.customer_location.toLowerCase().includes(data.search)),
      );
    }

    // Sorting
    if (data.sort === "highest") {
      filtered.sort((a, b) => b.rating - a.rating || new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
    } else if (data.sort === "lowest") {
      filtered.sort((a, b) => a.rating - b.rating || new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
    } else {
      // newest
      filtered.sort((a, b) => new Date(b.approved_at || b.submitted_at).getTime() - new Date(a.approved_at || a.submitted_at).getTime());
    }

    const start = data.page * data.pageSize;
    const paginated = filtered.slice(start, start + data.pageSize);
    const hasMore = start + data.pageSize < filtered.length;

    const photos = await signPhotos(supabaseAdmin as never, [...paginated, ...featuredRows]);

    return {
      reviews: paginated.map((r) => toPublicReview(r, photos)),
      featured: featuredRows.map((r) => toPublicReview(r, photos)),
      stats,
      services,
      totalApproved: allApproved.length,
      hasMore,
    };
  });

/** Public: fresh anti-spam challenge for the review form. */
export const getReviewCaptcha = createServerFn({ method: "GET" }).handler(async () => {
  const { issueCaptcha } = await import("./reviews.server");
  return issueCaptcha();
});

/** Public: resolve a campaign slug and count the visit / QR scan. */
export const getReviewCampaign = createServerFn({ method: "GET" })
  .validator((input: { slug: string; scan?: boolean }) => ({
    slug: sanitizeText(input.slug, 60).toLowerCase(),
    scan: Boolean(input.scan),
  }))
  .handler(async ({ data }) => {
    const { memoryStore } = await import("./reviews.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (!data.slug) return { campaign: null, expired: false };

    let campaign: ReviewCampaign | null = null;

    try {
      if (supabaseAdmin) {
        const { data: rows } = await supabaseAdmin
          .from("review_campaigns")
          .select("*")
          .eq("slug", data.slug)
          .limit(1);

        if (rows && rows.length > 0) {
          campaign = rows[0] as ReviewCampaign;
          await supabaseAdmin.rpc("bump_campaign_counter", {
            _slug: data.slug,
            _kind: data.scan ? "scan" : "visit",
          });
        }
      }
    } catch {
      // fallback
    }

    if (!campaign) {
      const match = memoryStore.campaigns.find((c) => c.slug === data.slug);
      if (match) {
        campaign = match;
        if (data.scan) match.scans += 1;
        else match.visits += 1;
      }
    }

    if (!campaign || !campaign.is_active || (campaign.expires_at && new Date(campaign.expires_at) < new Date())) {
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
  });

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
  .handler(async ({ data }): Promise<{ ok: true; message: string }> => {
    const errors = validateReview(data);
    const firstError = Object.values(errors)[0];
    if (firstError) throw new Error(firstError);

    const { memoryStore, verifyCaptcha, clientIp, sendNotification, emailTemplates } = await import("./reviews.server");

    // Verify arithmetic challenge
    if (!verifyCaptcha(data.captchaToken, data.captchaAnswer)) {
      throw new Error("Anti-spam verification failed. Please solve the math challenge again.");
    }

    const ip = null;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Rate limit check: max 4 submissions per hour per IP
    const hourAgo = Date.now() - 60 * 60 * 1000;
    const recentFromIp = memoryStore.reviews.filter(
      (r) => r.submitter_ip === ip && new Date(r.submitted_at).getTime() > hourAgo,
    );
    if (recentFromIp.length >= 4) {
      throw new Error("Too many submissions from this connection. Please try again later.");
    }

    // Duplicate check
    const isDupe = memoryStore.reviews.some(
      (r) => r.customer_name.toLowerCase() === data.customerName.toLowerCase() && r.review_text === data.reviewText,
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
      photoUrl = data.photo.dataUrl; // stored securely
    }

    // Server determines initial verification (e.g. employee with @dimisi.in email domain)
    const isVerifiedDomain = data.reviewerType === "employee" && data.customerEmail && data.customerEmail.endsWith("@dimisi.in");

    const newReview: AdminReview = {
      id: crypto.randomUUID(),
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
      is_verified: isVerifiedDomain ? true : false,
      rating: data.rating,
      review_text: data.reviewText,
      customer_photo_url: photoUrl,
      customer_location: data.customerLocation || null,
      consent_to_publish: true,
      status: "pending",
      is_featured: false,
      moderation_reason: null,
      moderated_by: null,
      submitter_ip: ip,
      submitted_at: new Date().toISOString(),
      approved_at: null,
      rejected_at: null,
      archived_at: null,
      updated_at: new Date().toISOString(),
    };

    memoryStore.reviews.unshift(newReview);

    // Try Supabase insert
    try {
      if (supabaseAdmin) {
        await supabaseAdmin.from("reviews").insert({
          id: newReview.id,
          campaign_id: campaignId,
          customer_name: data.customerName,
          customer_email: data.customerEmail || null,
          customer_phone: data.customerPhone || null,
          service_name: data.serviceName || null,
          rating: data.rating,
          review_text: data.reviewText,
          customer_photo_url: photoUrl,
          customer_location: data.customerLocation || null,
          consent_to_publish: true,
          status: "pending",
          submitter_ip: ip,
        });
        if (data.slug) {
          await supabaseAdmin.rpc("bump_campaign_counter", { _slug: data.slug, _kind: "submission" });
        }
      }
    } catch (err) {
      console.warn("[reviews] Supabase insert fallback to memory", err);
    }

    // Trigger email notification if enabled
    if (memoryStore.settings.notify_on_submit && memoryStore.settings.notify_email) {
      const tpl = emailTemplates.submitted(data.customerName, data.rating, data.reviewText);
      await sendNotification(memoryStore.settings.notify_email, tpl.subject, tpl.html);
    }

    return {
      ok: true,
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
    const { memoryStore, sendNotification, emailTemplates } = await import("./reviews.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const review = memoryStore.reviews.find((r) => r.id === data.reviewId);
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
      if (supabaseAdmin) {
        await supabaseAdmin.from("review_reports").insert({
          id: newReport.id,
          review_id: review.id,
          reason: data.reason,
          message: data.message || null,
          reporter_name: data.reporterName || null,
          reporter_email: data.reporterEmail || null,
          status: "open",
        });
      }
    } catch (err) {
      console.warn("[reviews] Supabase report insert fallback", err);
    }

    if (memoryStore.settings.notify_on_report && memoryStore.settings.notify_email) {
      const tpl = emailTemplates.reported(data.reason, review.review_text);
      await sendNotification(memoryStore.settings.notify_email, tpl.subject, tpl.html);
    }

    return { ok: true, message: "Thank you for bringing this to our attention. Our team will review the report." };
  });

// ==========================================
// ADMIN SERVER FUNCTIONS
// ==========================================

/** Admin: Load full reviews, campaigns, reports, settings, and analytics. */
export const getAdminReviewsData = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminDashboardData> => {
    const { memoryStore } = await import("./reviews.server");
    let { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let reviews = [...memoryStore.reviews];
    let campaigns = [...memoryStore.campaigns];
    let reports = [...memoryStore.reports];
    let settings = { ...memoryStore.settings };

    try {
      if (supabaseAdmin) {
        const [{ data: rRows }, { data: cRows }, { data: repRows }, { data: setRow }] = await Promise.all([
          supabaseAdmin.from("reviews").select("*").order("submitted_at", { ascending: false }),
          supabaseAdmin.from("review_campaigns").select("*").order("created_at", { ascending: false }),
          supabaseAdmin.from("review_reports").select("*").order("created_at", { ascending: false }),
          supabaseAdmin.from("review_settings").select("*").maybeSingle(),
        ]);

        if (rRows && rRows.length > 0) reviews = rRows as AdminReview[];
        if (cRows && cRows.length > 0) campaigns = cRows as ReviewCampaign[];
        if (repRows && repRows.length > 0) reports = repRows as ReviewReport[];
        if (setRow) settings = setRow as ReviewSettings;
      }
    } catch {
      // fallback
    }

    // Attach campaign name and stats
    const campaignMap = new Map(campaigns.map((c) => [c.id, c.campaign_name]));
    for (const r of reviews) {
      if (r.campaign_id) r.campaign_name = campaignMap.get(r.campaign_id) ?? null;
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
        overallConversionRate: calculateConversionRate(totalCampaignVisits + totalCampaignScans, totalCampaignSubmissions),
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
    const { memoryStore, logAudit, sendNotification, emailTemplates, clientIp } = await import("./reviews.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ip = null;

    const review = memoryStore.reviews.find((r) => r.id === data.reviewId);
    if (!review) throw new Error("Review not found.");

    const oldStatus = review.status;
    review.status = data.status;
    review.moderation_reason = data.moderationReason || null;
    review.updated_at = new Date().toISOString();

    const updates: Partial<AdminReview> = {
      status: data.status,
      moderation_reason: data.moderationReason || null,
      updated_at: review.updated_at,
    };

    if (data.status === "approved") {
      review.approved_at = new Date().toISOString();
      updates.approved_at = review.approved_at;
    } else if (data.status === "rejected") {
      review.rejected_at = new Date().toISOString();
      updates.rejected_at = review.rejected_at;
    } else if (data.status === "archived") {
      review.archived_at = new Date().toISOString();
      updates.archived_at = review.archived_at;
    }

    try {
      if (supabaseAdmin) {
        await supabaseAdmin.from("reviews").update(updates as any).eq("id", data.reviewId);
      }
    } catch (err) {
      console.warn("[reviews] Supabase status update fallback", err);
    }

    await logAudit(
      supabaseAdmin,
      "admin",
      `update_status_${data.status}`,
      "review",
      data.reviewId,
      { status: oldStatus },
      { status: data.status, reason: data.moderationReason },
      ip,
    );

    // Customer email dispatch
    if (review.customer_email) {
      if (data.status === "approved" && (data.notifyCustomer || memoryStore.settings.notify_on_approve)) {
        const tpl = emailTemplates.approved(review.customer_name);
        await sendNotification(review.customer_email, tpl.subject, tpl.html);
      } else if (data.status === "rejected" && data.notifyCustomer) {
        const tpl = emailTemplates.rejected(review.customer_name, data.moderationReason || "");
        await sendNotification(review.customer_email, tpl.subject, tpl.html);
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
    const { memoryStore, logAudit, clientIp } = await import("./reviews.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ip = null;

    const review = memoryStore.reviews.find((r) => r.id === data.reviewId);
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
    if (data.employmentStatus !== undefined) review.employment_status = data.reviewerType === "employee" ? data.employmentStatus : null;
    if (data.isVerified !== undefined) review.is_verified = data.isVerified;
    review.review_text = data.reviewText;
    review.customer_location = data.customerLocation || null;
    if (data.rating) review.rating = data.rating;
    review.updated_at = new Date().toISOString();

    try {
      if (supabaseAdmin) {
        await supabaseAdmin
          .from("reviews")
          .update({
            customer_name: review.customer_name,
            service_name: review.service_name,
            review_text: review.review_text,
            customer_location: review.customer_location,
            rating: review.rating,
            updated_at: review.updated_at,
          })
          .eq("id", data.reviewId);
      }
    } catch (err) {
      console.warn("[reviews] Supabase edit content fallback", err);
    }

    await logAudit(
      supabaseAdmin,
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
      ip,
    );

    return { ok: true, message: "Review content successfully updated." };
  });

/** Admin: Toggle verified status (for verified client / verified employee). */
export const toggleReviewVerified = createServerFn({ method: "POST" })
  .validator((input: { reviewId: string; isVerified: boolean }) => ({
    reviewId: String(input.reviewId ?? ""),
    isVerified: Boolean(input.isVerified),
  }))
  .handler(async ({ data }): Promise<{ ok: true; message: string }> => {
    const { memoryStore, logAudit } = await import("./reviews.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ip = null;

    const review = memoryStore.reviews.find((r) => r.id === data.reviewId);
    if (!review) throw new Error("Review not found.");

    review.is_verified = data.isVerified;
    review.updated_at = new Date().toISOString();

    try {
      if (supabaseAdmin) {
        await supabaseAdmin
          .from("reviews")
          .update({ is_verified: data.isVerified, updated_at: review.updated_at })
          .eq("id", data.reviewId);
      }
    } catch (err) {
      console.warn("[reviews] Supabase toggle verified fallback", err);
    }

    await logAudit(
      supabaseAdmin,
      "admin",
      `toggle_verified_${data.isVerified ? "true" : "false"}`,
      "review",
      data.reviewId,
      { is_verified: !data.isVerified },
      { is_verified: data.isVerified },
      ip,
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
    const { memoryStore, logAudit, clientIp } = await import("./reviews.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ip = null;

    const review = memoryStore.reviews.find((r) => r.id === data.reviewId);
    if (!review) throw new Error("Review not found.");

    review.is_featured = data.isFeatured;
    review.updated_at = new Date().toISOString();

    try {
      if (supabaseAdmin) {
        await supabaseAdmin
          .from("reviews")
          .update({ is_featured: data.isFeatured, updated_at: review.updated_at })
          .eq("id", data.reviewId);
      }
    } catch (err) {
      console.warn("[reviews] Supabase toggle featured fallback", err);
    }

    await logAudit(
      supabaseAdmin,
      "admin",
      data.isFeatured ? "set_featured" : "remove_featured",
      "review",
      data.reviewId,
      { is_featured: !data.isFeatured },
      { is_featured: data.isFeatured },
      ip,
    );

    return { ok: true, message: data.isFeatured ? "Marked as Featured." : "Removed from Featured." };
  });

/** Admin: Permanently delete a review. */
export const deleteReview = createServerFn({ method: "POST" })
  .validator((input: { reviewId: string }) => ({ reviewId: String(input.reviewId ?? "") }))
  .handler(async ({ data }): Promise<{ ok: true; message: string }> => {
    const { memoryStore, logAudit, clientIp } = await import("./reviews.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ip = null;

    const idx = memoryStore.reviews.findIndex((r) => r.id === data.reviewId);
    const existing = idx >= 0 ? memoryStore.reviews[idx] : null;

    if (idx >= 0) memoryStore.reviews.splice(idx, 1);

    try {
      if (supabaseAdmin) {
        await supabaseAdmin.from("reviews").delete().eq("id", data.reviewId);
      }
    } catch (err) {
      console.warn("[reviews] Supabase delete review fallback", err);
    }

    await logAudit(
      supabaseAdmin,
      "admin",
      "delete_review",
      "review",
      data.reviewId,
      existing,
      null,
      ip,
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

    const { memoryStore, logAudit, clientIp } = await import("./reviews.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ip = null;

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
      if (supabaseAdmin) {
        await supabaseAdmin.from("review_campaigns").insert({
          id: newCampaign.id,
          campaign_name: newCampaign.campaign_name,
          slug: newCampaign.slug,
          service_name: newCampaign.service_name,
          location: newCampaign.location,
          is_active: true,
          expires_at: newCampaign.expires_at,
        });
      }
    } catch (err) {
      console.warn("[reviews] Supabase create campaign fallback", err);
    }

    await logAudit(
      supabaseAdmin,
      "admin",
      "create_campaign",
      "campaign",
      newCampaign.id,
      null,
      newCampaign,
      ip,
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
    const { memoryStore, logAudit, clientIp } = await import("./reviews.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ip = null;

    const campaign = memoryStore.campaigns.find((c) => c.id === data.id);
    if (!campaign) throw new Error("Campaign not found.");

    const old = { ...campaign };
    campaign.campaign_name = data.campaignName;
    campaign.service_name = data.serviceName || null;
    campaign.location = data.location || null;
    campaign.is_active = data.isActive;
    campaign.expires_at = data.expiresAt;
    campaign.updated_at = new Date().toISOString();

    try {
      if (supabaseAdmin) {
        await supabaseAdmin
          .from("review_campaigns")
          .update({
            campaign_name: campaign.campaign_name,
            service_name: campaign.service_name,
            location: campaign.location,
            is_active: campaign.is_active,
            expires_at: campaign.expires_at,
            updated_at: campaign.updated_at,
          })
          .eq("id", data.id);
      }
    } catch (err) {
      console.warn("[reviews] Supabase update campaign fallback", err);
    }

    await logAudit(
      supabaseAdmin,
      "admin",
      "update_campaign",
      "campaign",
      data.id,
      old,
      campaign,
      ip,
    );

    return { ok: true, message: "Campaign updated." };
  });

/** Admin: Delete campaign. */
export const deleteCampaign = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => ({ id: String(input.id ?? "") }))
  .handler(async ({ data }): Promise<{ ok: true; message: string }> => {
    const { memoryStore, logAudit, clientIp } = await import("./reviews.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ip = null;

    const idx = memoryStore.campaigns.findIndex((c) => c.id === data.id);
    const existing = idx >= 0 ? memoryStore.campaigns[idx] : null;

    if (idx >= 0) memoryStore.campaigns.splice(idx, 1);

    try {
      if (supabaseAdmin) {
        await supabaseAdmin.from("review_campaigns").delete().eq("id", data.id);
      }
    } catch (err) {
      console.warn("[reviews] Supabase delete campaign fallback", err);
    }

    await logAudit(
      supabaseAdmin,
      "admin",
      "delete_campaign",
      "campaign",
      data.id,
      existing,
      null,
      ip,
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
    const { memoryStore, logAudit, clientIp } = await import("./reviews.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ip = null;

    const report = memoryStore.reports.find((r) => r.id === data.reportId);
    if (!report) throw new Error("Report not found.");

    report.status = "resolved";
    report.resolved_at = new Date().toISOString();
    report.resolved_by = "admin";

    const review = memoryStore.reviews.find((r) => r.id === report.review_id);

    if (review) {
      if (data.action === "archive") {
        review.status = "archived";
        review.archived_at = new Date().toISOString();
        review.moderation_reason = `Archived following report: ${report.reason}. ${data.moderationNotes || ""}`.trim();
      } else if (data.action === "delete") {
        const revIdx = memoryStore.reviews.findIndex((r) => r.id === report.review_id);
        if (revIdx >= 0) memoryStore.reviews.splice(revIdx, 1);
      }
    }

    try {
      if (supabaseAdmin) {
        await supabaseAdmin
          .from("review_reports")
          .update({ status: "resolved", resolved_at: report.resolved_at, resolved_by: "admin" })
          .eq("id", data.reportId);

        if (review) {
          if (data.action === "archive") {
            await supabaseAdmin
              .from("reviews")
              .update({ status: "archived", archived_at: review.archived_at, moderation_reason: review.moderation_reason })
              .eq("id", review.id);
          } else if (data.action === "delete") {
            await supabaseAdmin.from("reviews").delete().eq("id", review.id);
          }
        }
      }
    } catch (err) {
      console.warn("[reviews] Supabase resolve report fallback", err);
    }

    await logAudit(
      supabaseAdmin,
      "admin",
      `resolve_report_${data.action}`,
      "report",
      data.reportId,
      { reportId: data.reportId, reviewId: report.review_id },
      { action: data.action, notes: data.moderationNotes },
      ip,
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
    const { memoryStore, logAudit, clientIp } = await import("./reviews.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ip = null;

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
      if (supabaseAdmin) {
        await supabaseAdmin
          .from("review_settings")
          .upsert({
            id: true,
            notify_on_submit: data.notifyOnSubmit,
            notify_on_approve: data.notifyOnApprove,
            notify_on_reject: data.notifyOnReject,
            notify_on_report: data.notifyOnReport,
            notify_campaign_summary: data.notifyCampaignSummary,
            notify_email: data.notifyEmail || null,
            updated_at: memoryStore.settings.updated_at,
          } as any, { onConflict: "id" });
      }
    } catch (err) {
      console.warn("[reviews] Supabase settings update fallback", err);
    }

    await logAudit(
      supabaseAdmin,
      "admin",
      "update_review_settings",
      "settings",
      "singleton",
      null,
      memoryStore.settings,
      ip,
    );

    return { ok: true, message: "Notification preferences saved successfully." };
  });

