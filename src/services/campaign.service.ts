/**
 * DIMISI Admin — Campaigns & QR Express API Service
 * Handles Marketing & Review Campaign listing, creation, activation toggle, and deletion
 * against the Express backend API (/api/v1/admin-panel/campaigns/*).
 */
import { apiRequest, ApiError, clearApiCache, API_BASE_URL } from "./apiClient";
import type { ReviewCampaign } from "@/lib/reviews.shared";
import { extractMongoId, isMongoId } from "@/lib/reviews.shared";
import { getVisitorServicesApi } from "./service.service";

export interface BackendCampaignDoc {
  _id: string;
  name: string;
  slug: string;
  serviceId?: string | { _id: string; title: string };
  serviceName?: string;
  location: string;
  expiresAt?: string;
  visits?: number;
  scans?: number;
  reviewCount?: number;
  isActive?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  isExpired?: boolean;
  isLive?: boolean;
  conversionRate?: number;
}

export interface BackendCampaignListResponse {
  status: string;
  results: number;
  data: {
    campaigns: BackendCampaignDoc[];
  };
}

export interface BackendCampaignSingleResponse {
  status: string;
  message?: string;
  data: {
    campaign: BackendCampaignDoc;
  };
}

export interface CreateCampaignPayload {
  name: string;
  slug?: string | undefined;
  location: string;
  serviceId?: string | undefined;
  serviceName?: string | undefined;
  expiresAt?: string | undefined;
  isActive?: boolean | undefined;
}

/**
 * Generates a URL-friendly clean campaign slug compliant with backend regex /^[a-z0-9]+(?:-[a-z0-9]+)*$/
 */
export function generateCampaignSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return base || `campaign-${Date.now().toString(36)}`;
}

export { isMongoId };

/**
 * Normalizes backend ICampaign document into frontend ReviewCampaign model.
 */
export function normalizeBackendCampaign(
  doc: BackendCampaignDoc | null | undefined,
): ReviewCampaign {
  if (!doc) {
    return {
      id: "camp-" + Date.now().toString(36),
      campaign_name: "Untitled Campaign",
      slug: "untitled-campaign",
      service_name: null,
      location: "DIMISI HQ, New Delhi",
      is_active: true,
      expires_at: null,
      visits: 0,
      scans: 0,
      submissions: 0,
      conversion_rate: 0,
      created_by: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const visits = typeof doc.visits === "number" ? doc.visits : 0;
  const submissions = typeof doc.reviewCount === "number" ? doc.reviewCount : 0;
  const scans = typeof doc.scans === "number" ? doc.scans : 0;

  let computedConv = 0;
  if (typeof doc.conversionRate === "number") {
    computedConv = doc.conversionRate;
  } else if (visits > 0) {
    computedConv = Math.round((submissions / visits) * 10000) / 100;
  }

  let serviceName = doc.serviceName || null;
  if (!serviceName && typeof doc.serviceId === "object" && doc.serviceId !== null && "title" in doc.serviceId) {
    serviceName = doc.serviceId.title;
  }

  return {
    id: String(doc._id),
    campaign_name: doc.name || "Untitled Campaign",
    slug: doc.slug,
    service_name: serviceName,
    location: doc.location || "DIMISI HQ, New Delhi",
    is_active: doc.isActive !== false,
    expires_at: doc.expiresAt || null,
    visits,
    scans,
    submissions,
    conversion_rate: computedConv,
    created_by: typeof doc.createdBy === "string" ? doc.createdBy : "admin",
    created_at: doc.createdAt || new Date().toISOString(),
    updated_at: doc.updatedAt || new Date().toISOString(),
  };
}

/**
 * 1. GET ALL CAMPAIGNS (ADMIN)
 * Endpoint: GET /api/v1/admin-panel/campaigns/all
 */
export async function getAllAdminCampaignsApi(): Promise<ReviewCampaign[]> {
  try {
    const res = await apiRequest<BackendCampaignListResponse>(
      "/api/v1/admin-panel/campaigns/all",
      {
        method: "GET",
        cacheTtlMs: 5000,
        timeoutMs: 30000,
      },
    );

    const rawList = Array.isArray(res?.data?.campaigns)
      ? res.data.campaigns
      : Array.isArray((res as any)?.campaigns)
      ? (res as any).campaigns
      : Array.isArray(res)
      ? res
      : [];

    return rawList.map(normalizeBackendCampaign);
  } catch (err) {
    console.warn("Failed to fetch campaigns from Express backend:", err);
    throw err;
  }
}

/**
 * 2. CREATE CAMPAIGN
 * Endpoint: POST /api/v1/admin-panel/campaigns/create
 */
export async function createAdminCampaignApi(
  payload: CreateCampaignPayload,
): Promise<ReviewCampaign> {
  const name = payload.name.trim();
  const slug = payload.slug?.trim() ? generateCampaignSlug(payload.slug) : generateCampaignSlug(name);
  const location = payload.location?.trim() || "DIMISI HQ, New Delhi";

  const backendBody: Record<string, any> = {
    name,
    slug,
    location,
    isActive: payload.isActive !== false,
  };

  if (payload.serviceId && isMongoId(payload.serviceId)) {
    backendBody.serviceId = payload.serviceId;
  }
  if (payload.serviceName && payload.serviceName.trim()) {
    backendBody.serviceName = payload.serviceName.trim();
  }
  if (payload.expiresAt) {
    try {
      const expDate = new Date(payload.expiresAt);
      if (!isNaN(expDate.getTime()) && expDate.getTime() > Date.now()) {
        backendBody.expiresAt = expDate.toISOString();
      }
    } catch {}
  }

  try {
    const res = await apiRequest<BackendCampaignSingleResponse>(
      "/api/v1/admin-panel/campaigns/create",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendBody),
        timeoutMs: 30000,
      },
    );

    clearApiCache("/api/v1/admin-panel/campaigns");

    if (res?.data?.campaign) {
      return normalizeBackendCampaign(res.data.campaign);
    }
    throw new Error(res?.message || "Failed to create campaign.");
  } catch (err) {
    console.error("Failed to create campaign:", err);
    throw err;
  }
}

/**
 * Generates official backend URL to download high-resolution vector (SVG) or bitmap (PNG) QR code.
 * Endpoint: GET /api/v1/admin-panel/campaigns/:id/qr.:ext
 */
export function getCampaignQrDownloadUrl(
  campaignId: string,
  format: "png" | "svg" = "png",
  size: number = 2048,
): string {
  const cleanId = extractMongoId(campaignId);
  const safeExt = format.toLowerCase() === "svg" ? "svg" : "png";
  const safeSize = Math.min(Math.max(size, 128), 4096);
  return `${API_BASE_URL}/api/v1/admin-panel/campaigns/${encodeURIComponent(cleanId)}/qr.${safeExt}?size=${safeSize}`;
}

/**
 * Resolves a default active campaign ObjectId from database or cached state.
 * Prevents 400 error when submitting reviews from generic /review URL without a campaign param.
 */
export async function resolveDefaultCampaignId(): Promise<string | null> {
  // 1. Try to fetch from backend campaigns if accessible
  try {
    const campaigns = await getAllAdminCampaignsApi();
    if (Array.isArray(campaigns)) {
      const active = campaigns.find((c) => c.is_active && isMongoId(c.id));
      if (active) return active.id;
      const anyMongo = campaigns.find((c) => isMongoId(c.id));
      if (anyMongo) return anyMongo.id;
    }
  } catch {}

  // 2. Check localStorage cached campaigns
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("dimisi_campaigns_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const active = parsed.find((c: any) => c.is_active !== false && isMongoId(c.id));
          if (active) return active.id;
          const anyMongo = parsed.find((c: any) => isMongoId(c.id));
          if (anyMongo) return anyMongo.id;
        }
      }
    } catch {}
  }
  return null;
}

/**
 * 3. TOGGLE ACTIVATE CAMPAIGN
 * Endpoint: PATCH /api/v1/admin-panel/campaigns/:id/toggle-activate
 */
export async function toggleAdminCampaignApi(id: string): Promise<ReviewCampaign> {
  const cleanId = extractMongoId(id);
  if (!cleanId) throw new Error("Campaign ID is required.");

  try {
    const res = await apiRequest<BackendCampaignSingleResponse>(
      `/api/v1/admin-panel/campaigns/${encodeURIComponent(cleanId)}/toggle-activate`,
      {
        method: "PATCH",
        timeoutMs: 30000,
      },
    );

    clearApiCache("/api/v1/admin-panel/campaigns");

    if (res?.data?.campaign) {
      return normalizeBackendCampaign(res.data.campaign);
    }
    throw new Error(res?.message || "Failed to toggle campaign activation.");
  } catch (err) {
    console.error(`Failed to toggle campaign ${cleanId}:`, err);
    throw err;
  }
}

/**
 * 4. DELETE CAMPAIGN
 * Endpoint: DELETE /api/v1/admin-panel/campaigns/:id/delete
 */
export async function deleteAdminCampaignApi(id: string): Promise<boolean> {
  const cleanId = extractMongoId(id);
  if (!cleanId) throw new Error("Campaign ID is required.");

  try {
    const res = await apiRequest<{ status: string; message?: string }>(
      `/api/v1/admin-panel/campaigns/${encodeURIComponent(cleanId)}/delete`,
      {
        method: "DELETE",
        timeoutMs: 30000,
      },
    );

    clearApiCache("/api/v1/admin-panel/campaigns");

    return res?.status === "success";
  } catch (err) {
    console.error(`Failed to delete campaign ${cleanId}:`, err);
    throw err;
  }
}

/**
 * 5. GET PUBLIC CAMPAIGN BY SLUG
 * Unauthenticated: Resolves campaign information for public visitors from campaign slug.
 * Does NOT call protected admin endpoints (never triggers 401 Unauthorized).
 */
export async function getPublicCampaignBySlugApi(slug: string): Promise<ReviewCampaign | null> {
  if (!slug || !slug.trim()) return null;
  const cleanSlug = slug.trim();

  // If the slug itself is an active MongoDB ObjectId, or we have cached campaigns, check for matching campaign
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("dimisi_campaigns_v1");
      if (raw) {
        const cached = JSON.parse(raw);
        if (Array.isArray(cached)) {
          const match = cached.find((c: any) => c.slug === cleanSlug || c.id === cleanSlug);
          if (match && isMongoId(match.id)) {
            return match;
          }
        }
      }
    } catch {}
  }

  let matchedServiceName: string | null = null;
  try {
    const services = await getVisitorServicesApi();
    if (Array.isArray(services)) {
      const match = services.find(
        (s) =>
          s.slug.toLowerCase() === cleanSlug.toLowerCase() ||
          s.id === cleanSlug ||
          s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === cleanSlug.toLowerCase(),
      );
      if (match) {
        matchedServiceName = match.title;
      }
    }
  } catch {
    // Non-fatal: fallback to formatting title directly from slug
  }

  const humanTitle = cleanSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    id: isMongoId(cleanSlug) ? cleanSlug : "camp-" + cleanSlug,
    campaign_name: matchedServiceName || humanTitle || "Client Experience Review",
    slug: cleanSlug,
    service_name: matchedServiceName,
    location: "DIMISI HQ, New Delhi",
    is_active: true,
    expires_at: null,
    visits: 1,
    scans: 0,
    submissions: 0,
    conversion_rate: 0,
    created_by: "system",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
