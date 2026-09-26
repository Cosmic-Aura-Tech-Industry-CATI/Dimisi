/**
 * DIMISI Admin — Campaigns & QR Express API Service
 * Handles Marketing & Review Campaign listing, creation, activation toggle, and deletion
 * against the Express backend API (/api/v1/admin-panel/campaigns/*).
 */
import { apiRequest, ApiError, clearApiCache } from "./apiClient";
import type { ReviewCampaign } from "@/lib/reviews.shared";
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

/**
 * Checks if a given string is a valid 24-character hex MongoDB ObjectId.
 */
export function isMongoId(id?: string | null): boolean {
  if (!id || typeof id !== "string") return false;
  return /^[0-9a-fA-F]{24}$/.test(id.trim());
}

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
 * 3. TOGGLE ACTIVATE CAMPAIGN
 * Endpoint: PATCH /api/v1/admin-panel/campaigns/:id/toggle-activate
 */
export async function toggleAdminCampaignApi(id: string): Promise<ReviewCampaign> {
  if (!id) throw new Error("Campaign ID is required.");

  try {
    const res = await apiRequest<BackendCampaignSingleResponse>(
      `/api/v1/admin-panel/campaigns/${encodeURIComponent(id)}/toggle-activate`,
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
    console.error(`Failed to toggle campaign ${id}:`, err);
    throw err;
  }
}

/**
 * 4. DELETE CAMPAIGN
 * Endpoint: DELETE /api/v1/admin-panel/campaigns/:id/delete
 */
export async function deleteAdminCampaignApi(id: string): Promise<boolean> {
  if (!id) throw new Error("Campaign ID is required.");

  try {
    const res = await apiRequest<{ status: string; message?: string }>(
      `/api/v1/admin-panel/campaigns/${encodeURIComponent(id)}/delete`,
      {
        method: "DELETE",
        timeoutMs: 30000,
      },
    );

    clearApiCache("/api/v1/admin-panel/campaigns");

    return res?.status === "success";
  } catch (err) {
    console.error(`Failed to delete campaign ${id}:`, err);
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
