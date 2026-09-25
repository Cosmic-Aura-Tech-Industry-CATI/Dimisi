/**
 * DIMISI Admin — Event Category Express API Service
 * Handles Event Category listing, creation, updates, and deletion
 * against the Express backend API (/api/v1/admin-panel/event-category/*).
 */
import { apiRequest, ApiError, clearApiCache } from "./apiClient";
import { slugifyEventCategory, type EventCategoryItem } from "@/lib/events.shared";

export interface BackendEventCategoryDoc {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
  totalEventCount?: number;
  activeEventCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendEventCategoryListResponse {
  status: string;
  results: number;
  data: {
    eventCategories: BackendEventCategoryDoc[];
  };
}

export interface BackendEventCategorySingleResponse {
  status: string;
  message?: string;
  data: {
    eventCategory: BackendEventCategoryDoc;
  };
}

export interface CreateEventCategoryPayload {
  name: string;
  slug?: string | undefined;
  description?: string | undefined;
  displayOrder: number;
  isActive?: boolean | undefined;
  status?: "active" | "inactive" | undefined;
}

export interface UpdateEventCategoryPayload {
  name?: string | undefined;
  slug?: string | undefined;
  description?: string | undefined;
  displayOrder?: number | undefined;
  isActive?: boolean | undefined;
  status?: "active" | "inactive" | undefined;
}

/**
 * Checks if a given string is a valid 24-character hex MongoDB ObjectId.
 */
export function isMongoId(id?: string | null): boolean {
  if (!id || typeof id !== "string") return false;
  return /^[0-9a-fA-F]{24}$/.test(id.trim());
}

/**
 * Normalizes backend IEventCategory document into the clean frontend EventCategoryItem model.
 */
export function normalizeBackendEventCategory(
  doc: BackendEventCategoryDoc | null | undefined,
): EventCategoryItem {
  if (!doc) {
    return {
      id: "cat-" + Date.now().toString(36),
      name: "General",
      slug: "general",
      description: "",
      status: "active",
      order_index: 1,
      created_at: new Date().toISOString(),
    };
  }

  const cleanSlug =
    doc.slug ||
    doc.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
    "category";

  return {
    id: String(doc._id),
    name: doc.name || "General",
    slug: cleanSlug,
    description: doc.description || "",
    status: doc.isActive !== false ? "active" : "inactive",
    order_index: typeof doc.displayOrder === "number" ? doc.displayOrder : 1,
    created_at: doc.createdAt || new Date().toISOString(),
  };
}

/**
 * Resolves category name from a raw category (which may be a string, ObjectId, or object).
 */
export function resolveEventCategoryName(
  rawCat: string | { _id: string; name: string; slug?: string } | undefined | null,
  categories?: EventCategoryItem[],
): string {
  if (!rawCat) return "General";
  if (typeof rawCat === "object" && rawCat !== null && "name" in rawCat && rawCat.name) {
    return rawCat.name;
  }
  if (typeof rawCat === "string") {
    if (categories && categories.length > 0) {
      const match = categories.find(
        (c) => c.id === rawCat || c.name.toLowerCase() === rawCat.toLowerCase() || c.slug === rawCat,
      );
      if (match) return match.name;
    }
    return rawCat;
  }
  return "General";
}

const KNOWN_CAT_STORAGE_KEY = "dimisi_known_event_category_ids";
const DEFAULT_KNOWN_CATEGORY_ID = "6ab50e490e870a31e26b15dc";

export function getStoredCategoryIds(): string[] {
  if (typeof window === "undefined") return [DEFAULT_KNOWN_CATEGORY_ID];
  try {
    const raw = localStorage.getItem(KNOWN_CAT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const valid = parsed.filter(isMongoId);
        if (valid.length > 0) return valid;
      }
    }
  } catch {}
  return [DEFAULT_KNOWN_CATEGORY_ID];
}

export function rememberCategoryIds(ids: string[]): void {
  if (typeof window === "undefined" || !Array.isArray(ids) || ids.length === 0) return;
  try {
    const existing = new Set(getStoredCategoryIds());
    ids.filter(isMongoId).forEach((id) => existing.add(id));
    localStorage.setItem(KNOWN_CAT_STORAGE_KEY, JSON.stringify(Array.from(existing)));
  } catch {}
}

/**
 * Resolves category MongoDB ObjectId string from a category name, slug, or ID.
 */
export async function resolveEventCategoryIdForPayload(
  catNameOrId?: string,
  categories?: EventCategoryItem[],
): Promise<string> {
  const trimmed = (catNameOrId || "").trim();
  if (isMongoId(trimmed)) {
    rememberCategoryIds([trimmed]);
    return trimmed;
  }

  let list = categories;
  if (!list || list.length === 0) {
    try {
      list = await getAllEventCategoriesApi();
    } catch {
      list = [];
    }
  }

  if (trimmed && trimmed.toLowerCase() !== "all") {
    const found = list?.find(
      (c) =>
        c.id === trimmed ||
        c.name.toLowerCase() === trimmed.toLowerCase() ||
        c.slug.toLowerCase() === trimmed.toLowerCase(),
    );
    if (found && isMongoId(found.id)) {
      rememberCategoryIds([found.id]);
      return found.id;
    }
  }

  const firstValid = list?.find((c) => isMongoId(c.id));
  if (firstValid) {
    rememberCategoryIds([firstValid.id]);
    return firstValid.id;
  }

  const stored = getStoredCategoryIds();
  if (stored.length > 0 && isMongoId(stored[0])) {
    return stored[0];
  }

  // If no category exists in the database, automatically provision a default category
  try {
    const created = await createEventCategoryApi({
      name: "General Events",
      slug: `general-events-${Date.now().toString(36)}`,
      description: "Default category for company events and gallery archives",
      displayOrder: (list?.length || 0) + 1,
      isActive: true,
      status: "active",
    });
    if (created && isMongoId(created.id)) {
      rememberCategoryIds([created.id]);
      return created.id;
    }
  } catch (err) {
    console.warn("Could not auto-provision default event category:", err);
  }

  return DEFAULT_KNOWN_CATEGORY_ID;
}

/**
 * 1. GET ALL EVENT CATEGORIES (ADMIN)
 * Endpoint: GET /api/v1/admin-panel/event-category
 */
export async function getAllEventCategoriesApi(): Promise<EventCategoryItem[]> {
  try {
    const res = await apiRequest<BackendEventCategoryListResponse>(
      "/api/v1/admin-panel/event-category",
      {
        method: "GET",
        cacheTtlMs: 15000,
        timeoutMs: 30000,
      },
    );

    const rawList = Array.isArray(res?.data?.eventCategories)
      ? res.data.eventCategories
      : Array.isArray((res as any)?.eventCategories)
      ? (res as any).eventCategories
      : Array.isArray(res)
      ? res
      : [];

    const normalized = rawList.map(normalizeBackendEventCategory);
    rememberCategoryIds(normalized.map((c) => c.id));
    return normalized;
  } catch (err) {
    console.warn("Failed to fetch event categories from Express backend:", err);
    throw err;
  }
}

/**
 * 2. CREATE EVENT CATEGORY
 * Endpoint: POST /api/v1/admin-panel/event-category/create
 */
export async function createEventCategoryApi(
  payload: CreateEventCategoryPayload,
): Promise<EventCategoryItem> {
  const name = payload.name.trim();
  const slug = payload.slug?.trim() || slugifyEventCategory(name);

  const backendBody = {
    name,
    slug,
    description: payload.description?.trim() || undefined,
    displayOrder: Number(payload.displayOrder) || 1,
    isActive:
      payload.isActive !== undefined
        ? payload.isActive
        : payload.status !== undefined
          ? payload.status === "active"
          : true,
  };

  try {
    const res = await apiRequest<BackendEventCategorySingleResponse>(
      "/api/v1/admin-panel/event-category/create",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendBody),
      },
    );

    clearApiCache("/api/v1/admin-panel/event-category");
    clearApiCache("/api/v1/admin-panel/events");

    if (res?.data?.eventCategory) {
      return normalizeBackendEventCategory(res.data.eventCategory);
    }
    throw new Error(res?.message || "Failed to create event category.");
  } catch (err) {
    console.error("Failed to create event category:", err);
    throw err;
  }
}

/**
 * 3. UPDATE EVENT CATEGORY
 * Endpoint: PATCH /api/v1/admin-panel/event-category/:id/update
 */
export async function updateEventCategoryApi(
  id: string,
  payload: UpdateEventCategoryPayload,
): Promise<EventCategoryItem> {
  if (!id) throw new Error("Category ID is required for update.");

  const backendBody: Record<string, any> = {};
  if (payload.name !== undefined) {
    const trimmedName = payload.name.trim();
    backendBody.name = trimmedName;
    if (payload.slug !== undefined) {
      backendBody.slug = payload.slug.trim();
    } else if (trimmedName) {
      backendBody.slug = slugifyEventCategory(trimmedName);
    }
  } else if (payload.slug !== undefined) {
    backendBody.slug = payload.slug.trim();
  }
  if (payload.description !== undefined) backendBody.description = payload.description.trim();
  if (payload.displayOrder !== undefined) backendBody.displayOrder = Number(payload.displayOrder);
  if (payload.isActive !== undefined) {
    backendBody.isActive = payload.isActive;
  } else if (payload.status !== undefined) {
    backendBody.isActive = payload.status === "active";
  }

  try {
    const res = await apiRequest<BackendEventCategorySingleResponse>(
      `/api/v1/admin-panel/event-category/${encodeURIComponent(id)}/update`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendBody),
      },
    );

    clearApiCache("/api/v1/admin-panel/event-category");
    clearApiCache("/api/v1/admin-panel/events");

    if (res?.data?.eventCategory) {
      return normalizeBackendEventCategory(res.data.eventCategory);
    }
    throw new Error(res?.message || "Failed to update event category.");
  } catch (err) {
    console.error(`Failed to update event category ${id}:`, err);
    throw err;
  }
}

/**
 * 4. DELETE EVENT CATEGORY
 * Endpoint: DELETE /api/v1/admin-panel/event-category/:id/delete
 */
export async function deleteEventCategoryApi(id: string): Promise<boolean> {
  if (!id) throw new Error("Category ID is required for delete.");

  try {
    const res = await apiRequest<{ status: string; message?: string }>(
      `/api/v1/admin-panel/event-category/${encodeURIComponent(id)}/delete`,
      {
        method: "DELETE",
      },
    );

    clearApiCache("/api/v1/admin-panel/event-category");
    clearApiCache("/api/v1/admin-panel/events");

    return res?.status === "success";
  } catch (err) {
    console.error(`Failed to delete event category ${id}:`, err);
    throw err;
  }
}
