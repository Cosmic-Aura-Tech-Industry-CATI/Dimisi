/**
 * DIMISI Admin & Public — Event & Photo Gallery Express API Service
 * Handles Event and Gallery listing, creation, updates, and deletion
 * against the Express backend API (/api/v1/admin-panel/events/*).
 */
import { apiRequest, ApiError, clearApiCache } from "./apiClient";
import type { CompanyEvent, EventGalleryItem, EventCategoryItem, EventStatus } from "@/lib/events.shared";
import {
  getAllEventCategoriesApi,
  resolveEventCategoryName,
  resolveEventCategoryIdForPayload,
  isMongoId,
  getStoredCategoryIds,
  rememberCategoryIds,
} from "./eventCategory.service";

export interface BackendEventDoc {
  _id: string;
  title: string;
  slug: string;
  type: "event" | "gallery";
  category: string | { _id: string; name: string; slug?: string } | undefined;
  date: string;
  startDate: string;
  endDate: string;
  location: string;
  venueDetails?: string;
  mode: "online" | "offline" | "hybrid";
  status: "upcoming" | "live" | "completed";
  description: string;
  coverImage?: string;
  coverImagePublicId?: string;
  images?: Array<{ url: string; publicId: string }>;
  attendeesCount?: number;
  registrationUrl?: string;
  highlights?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  uploadStatus?: string;
  failReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendEventListResponse {
  status: string;
  events: BackendEventDoc[];
}

export interface BackendEventSingleResponse {
  status: string;
  message?: string;
  data: {
    event: BackendEventDoc;
  };
}

export const DEFAULT_EVENT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80";

function formatTimeString(isoString?: string): string {
  if (!isoString) return "06:00 PM IST";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "06:00 PM IST";
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }) + " IST";
  } catch {
    return "06:00 PM IST";
  }
}

/**
 * Normalizes backend IEvent document into frontend CompanyEvent model.
 */
export function normalizeBackendEvent(
  doc: BackendEventDoc | null | undefined,
  categories?: EventCategoryItem[],
): CompanyEvent {
  if (!doc) {
    return {
      id: "ev-" + Date.now().toString(36),
      title: "Untitled Event",
      slug: "untitled-event",
      date: new Date().toISOString().slice(0, 10),
      start_time: "06:00 PM IST",
      end_time: "09:00 PM IST",
      location: "DIMISI HQ, New Delhi",
      venue_details: "Innovation Arena",
      mode: "offline",
      status: "upcoming",
      category: "General",
      description: "Company event description.",
      full_description: "Company event description.",
      cover_image: DEFAULT_EVENT_FALLBACK_IMAGE,
      gallery_images: [],
      highlights: [],
      attendees_count: 0,
      registration_url: "",
      is_featured: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const resolvedCategory = resolveEventCategoryName(doc.category, categories);
  const rawCover = doc.coverImage?.trim() || "";
  const coverImage = rawCover.length > 0 ? rawCover : DEFAULT_EVENT_FALLBACK_IMAGE;

  const dateStr = doc.date ? new Date(doc.date).toISOString().slice(0, 10) : "";
  const startTime = formatTimeString(doc.startDate);
  const endTime = formatTimeString(doc.endDate);

  const cleanSlug =
    doc.slug ||
    doc.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
    "event";

  let status: EventStatus = "upcoming";
  if (doc.status === "live") status = "ongoing";
  else if (doc.status === "completed") status = "completed";
  else status = "upcoming";

  return {
    id: String(doc._id),
    title: doc.title || "Untitled Event",
    slug: cleanSlug,
    date: dateStr,
    start_time: startTime,
    end_time: endTime,
    location: doc.location || "Online",
    venue_details: doc.venueDetails || "",
    mode: doc.mode || "offline",
    status,
    category: resolvedCategory,
    description: doc.description || "",
    full_description: doc.description || "",
    cover_image: coverImage,
    gallery_images: Array.isArray(doc.images) ? doc.images.map((img) => img.url).filter(Boolean) : [],
    highlights: Array.isArray(doc.highlights) ? doc.highlights : [],
    attendees_count: typeof doc.attendeesCount === "number" ? doc.attendeesCount : 0,
    registration_url: doc.registrationUrl || "",
    is_featured: Boolean(doc.isFeatured),
    is_active: doc.isActive !== false,
    created_at: doc.createdAt || new Date().toISOString(),
    updated_at: doc.updatedAt || new Date().toISOString(),
  };
}

/**
 * Normalizes backend IEvent document into frontend EventGalleryItem model.
 */
export function normalizeBackendGalleryItem(
  doc: BackendEventDoc | null | undefined,
  categories?: EventCategoryItem[],
): EventGalleryItem {
  if (!doc) {
    return {
      id: "gal-" + Date.now().toString(36),
      title: "Gallery Photo",
      image_url: DEFAULT_EVENT_FALLBACK_IMAGE,
      caption: "",
      category: "General",
      aspect_ratio: "normal",
      aspect: "normal",
      created_at: new Date().toISOString(),
    };
  }

  const resolvedCategory = resolveEventCategoryName(doc.category, categories);
  const rawCover = doc.coverImage?.trim() || (doc.images?.[0]?.url) || "";
  const imageUrl = rawCover.length > 0 ? rawCover : DEFAULT_EVENT_FALLBACK_IMAGE;

  return {
    id: String(doc._id),
    title: doc.title || "Gallery Photo",
    image_url: imageUrl,
    caption: doc.description || "",
    category: resolvedCategory,
    aspect_ratio: "normal",
    aspect: "normal",
    created_at: doc.createdAt || new Date().toISOString(),
  };
}

/**
 * Helper to fetch events/gallery docs across valid category ObjectIds.
 * Avoids passing { category: undefined } to backend which Mongoose evaluates as category: null.
 */
async function fetchAdminEventsForCategories(
  categoryIds: string[],
  type: "event" | "gallery",
): Promise<BackendEventDoc[]> {
  const docMap = new Map<string, BackendEventDoc>();
  const validIds = Array.from(new Set(categoryIds.filter(isMongoId)));

  if (validIds.length > 0) {
    const promises = validIds.map((catId) =>
      apiRequest<BackendEventListResponse>(
        `/api/v1/admin-panel/events?category=${encodeURIComponent(catId)}&type=${type}`,
        { method: "GET", cacheTtlMs: 0, timeoutMs: 30000 },
      )
        .then((res) => {
          const list = Array.isArray(res?.events)
            ? res.events
            : Array.isArray((res as any)?.data?.events)
            ? (res as any).data.events
            : [];
          return list;
        })
        .catch(() => [] as BackendEventDoc[]),
    );
    const results = await Promise.all(promises);
    for (const list of results) {
      for (const doc of list) {
        if (doc && doc._id && doc.type === type) {
          docMap.set(String(doc._id), doc);
        }
      }
    }
  }

  // Also query direct fallback if map is empty
  if (docMap.size === 0) {
    try {
      const res = await apiRequest<BackendEventListResponse>(
        `/api/v1/admin-panel/events?type=${type}`,
        { method: "GET", cacheTtlMs: 0, timeoutMs: 30000 },
      );
      const list = Array.isArray(res?.events)
        ? res.events
        : Array.isArray((res as any)?.data?.events)
        ? (res as any).data.events
        : [];
      for (const doc of list) {
        if (doc && doc._id && doc.type === type) {
          docMap.set(String(doc._id), doc);
        }
      }
    } catch {}
  }

  return Array.from(docMap.values());
}

async function fetchPublicEventsForCategories(
  categoryIds: string[],
  type: "event" | "gallery",
): Promise<BackendEventDoc[]> {
  const docMap = new Map<string, BackendEventDoc>();
  const validIds = Array.from(new Set(categoryIds.filter(isMongoId)));

  if (validIds.length > 0) {
    const promises = validIds.map((catId) =>
      apiRequest<BackendEventListResponse>(
        `/api/v1/admin-panel/events/active?category=${encodeURIComponent(catId)}&type=${type}`,
        { method: "GET", cacheTtlMs: 15000, timeoutMs: 30000 },
      )
        .then((res) => {
          const list = Array.isArray(res?.events)
            ? res.events
            : Array.isArray((res as any)?.data?.events)
            ? (res as any).data.events
            : [];
          return list;
        })
        .catch(() => [] as BackendEventDoc[]),
    );
    const results = await Promise.all(promises);
    for (const list of results) {
      for (const doc of list) {
        if (doc && doc._id && doc.type === type) {
          docMap.set(String(doc._id), doc);
        }
      }
    }
  }

  if (docMap.size === 0) {
    try {
      const res = await apiRequest<BackendEventListResponse>(
        `/api/v1/admin-panel/events/active?type=${type}`,
        { method: "GET", cacheTtlMs: 15000, timeoutMs: 30000 },
      );
      const list = Array.isArray(res?.events)
        ? res.events
        : Array.isArray((res as any)?.data?.events)
        ? (res as any).data.events
        : [];
      for (const doc of list) {
        if (doc && doc._id && doc.type === type) {
          docMap.set(String(doc._id), doc);
        }
      }
    } catch {}
  }

  return Array.from(docMap.values());
}

/**
 * 1. GET PUBLIC ACTIVE EVENTS (FOR PUBLIC WEBSITE)
 * Endpoint: GET /api/v1/admin-panel/events/active?category=:id&type=event
 */
export async function getPublicActiveEventsApi(
  categoryId?: string,
  categories?: EventCategoryItem[],
): Promise<CompanyEvent[]> {
  try {
    let allCats = categories;
    if (!allCats || allCats.length === 0) {
      try {
        allCats = await getAllEventCategoriesApi();
      } catch {
        allCats = [];
      }
    }

    if (categoryId && categoryId.toLowerCase() !== "all") {
      const resolvedId = await resolveEventCategoryIdForPayload(categoryId, allCats);
      if (isMongoId(resolvedId)) {
        const rawDocs = await fetchPublicEventsForCategories([resolvedId], "event");
        return rawDocs.map((doc) => normalizeBackendEvent(doc, allCats));
      }
    }

    const catIds = [
      ...(allCats || []).map((c) => c.id),
      ...getStoredCategoryIds(),
    ];
    const rawDocs = await fetchPublicEventsForCategories(catIds, "event");
    return rawDocs.map((doc) => normalizeBackendEvent(doc, allCats));
  } catch {
    return [];
  }
}

/**
 * 2. GET PUBLIC ACTIVE GALLERY (FOR PUBLIC WEBSITE)
 * Endpoint: GET /api/v1/admin-panel/events/active?category=:id&type=gallery
 */
export async function getPublicActiveGalleryApi(
  categoryId?: string,
  categories?: EventCategoryItem[],
): Promise<EventGalleryItem[]> {
  try {
    let allCats = categories;
    if (!allCats || allCats.length === 0) {
      try {
        allCats = await getAllEventCategoriesApi();
      } catch {
        allCats = [];
      }
    }

    if (categoryId && categoryId.toLowerCase() !== "all") {
      const resolvedId = await resolveEventCategoryIdForPayload(categoryId, allCats);
      if (isMongoId(resolvedId)) {
        const rawDocs = await fetchPublicEventsForCategories([resolvedId], "gallery");
        return rawDocs.map((doc) => normalizeBackendGalleryItem(doc, allCats));
      }
    }

    const catIds = [
      ...(allCats || []).map((c) => c.id),
      ...getStoredCategoryIds(),
    ];
    const rawDocs = await fetchPublicEventsForCategories(catIds, "gallery");
    return rawDocs.map((doc) => normalizeBackendGalleryItem(doc, allCats));
  } catch {
    return [];
  }
}

/**
 * 3. GET ALL ADMIN EVENTS (ADMIN VIEW)
 * Endpoint: GET /api/v1/admin-panel/events?category=:id&type=event
 */
export async function getAllAdminEventsApi(
  categoryId?: string,
  categories?: EventCategoryItem[],
): Promise<CompanyEvent[]> {
  try {
    let allCats = categories;
    if (!allCats || allCats.length === 0) {
      try {
        allCats = await getAllEventCategoriesApi();
      } catch {
        allCats = [];
      }
    }

    if (categoryId && categoryId.toLowerCase() !== "all") {
      const resolvedId = await resolveEventCategoryIdForPayload(categoryId, allCats);
      if (isMongoId(resolvedId)) {
        const rawDocs = await fetchAdminEventsForCategories([resolvedId], "event");
        return rawDocs.map((doc) => normalizeBackendEvent(doc, allCats));
      }
    }

    const catIds = [
      ...(allCats || []).map((c) => c.id),
      ...getStoredCategoryIds(),
    ];
    const rawDocs = await fetchAdminEventsForCategories(catIds, "event");
    return rawDocs.map((doc) => normalizeBackendEvent(doc, allCats));
  } catch (err) {
    console.warn("Failed to fetch admin events from Express backend:", err);
    throw err;
  }
}

/**
 * 4. GET ALL ADMIN GALLERY PHOTOS (ADMIN VIEW)
 * Endpoint: GET /api/v1/admin-panel/events?category=:id&type=gallery
 */
export async function getAllAdminGalleryApi(
  categoryId?: string,
  categories?: EventCategoryItem[],
): Promise<EventGalleryItem[]> {
  try {
    let allCats = categories;
    if (!allCats || allCats.length === 0) {
      try {
        allCats = await getAllEventCategoriesApi();
      } catch {
        allCats = [];
      }
    }

    if (categoryId && categoryId.toLowerCase() !== "all") {
      const resolvedId = await resolveEventCategoryIdForPayload(categoryId, allCats);
      if (isMongoId(resolvedId)) {
        const rawDocs = await fetchAdminEventsForCategories([resolvedId], "gallery");
        return rawDocs.map((doc) => normalizeBackendGalleryItem(doc, allCats));
      }
    }

    const catIds = [
      ...(allCats || []).map((c) => c.id),
      ...getStoredCategoryIds(),
    ];
    const rawDocs = await fetchAdminEventsForCategories(catIds, "gallery");
    return rawDocs.map((doc) => normalizeBackendGalleryItem(doc, allCats));
  } catch (err) {
    console.warn("Failed to fetch admin gallery from Express backend:", err);
    throw err;
  }
}

/**
 * 5. GET EVENT BY ID
 * Endpoint: GET /api/v1/admin-panel/events/:id
 */
export async function getEventByIdApi(
  id: string,
  categories?: EventCategoryItem[],
): Promise<CompanyEvent> {
  if (!id) throw new Error("Event ID is required.");

  try {
    const res = await apiRequest<BackendEventSingleResponse>(
      `/api/v1/admin-panel/events/${encodeURIComponent(id)}`,
      {
        method: "GET",
        cacheTtlMs: 10000,
        timeoutMs: 30000,
      },
    );

    if (res?.data?.event) {
      return normalizeBackendEvent(res.data.event, categories);
    }
    throw new Error(res?.message || "Event not found.");
  } catch (err) {
    console.error(`Failed to fetch event ${id}:`, err);
    throw err;
  }
}

/**
 * 6. CREATE EVENT (JSON OR MULTIPART)
 * Endpoint: POST /api/v1/admin-panel/events/create
 */
export async function createEventApi(
  payload: FormData | Record<string, any>,
  categories?: EventCategoryItem[],
): Promise<CompanyEvent> {
  const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;

  try {
    const res = await apiRequest<BackendEventSingleResponse>(
      "/api/v1/admin-panel/events/create",
      {
        method: "POST",
        headers: isFormData ? undefined : { "Content-Type": "application/json" },
        body: isFormData ? payload : JSON.stringify(payload),
        timeoutMs: 30000,
      },
    );

    clearApiCache("/api/v1/admin-panel/events");
    clearApiCache("/api/v1/admin-panel/event-category");

    if (res?.data?.event) {
      let createdDoc = res.data.event;
      if (!isFormData && typeof payload === "object" && payload !== null) {
        const rawCover = payload.coverImage || payload.cover_image;
        const validCover =
          rawCover && typeof rawCover === "string" && (rawCover.startsWith("http://") || rawCover.startsWith("https://") || rawCover.startsWith("/")) && rawCover.length <= 500
            ? rawCover
            : DEFAULT_EVENT_FALLBACK_IMAGE;
        const imagesList = Array.isArray(payload.images)
          ? payload.images
              .map((img: any, idx: number) => {
                if (typeof img === "string" && img.trim()) {
                  const url = img.trim();
                  if ((url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) && url.length <= 500) {
                    return { url, publicId: `img_${Date.now().toString(36)}_${idx}` };
                  }
                } else if (img && typeof img === "object" && typeof img.url === "string" && img.url.trim()) {
                  const url = img.url.trim();
                  if ((url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) && url.length <= 500) {
                    return {
                      url,
                      publicId: img.publicId?.trim() || `img_${Date.now().toString(36)}_${idx}`,
                    };
                  }
                }
                return null;
              })
              .filter(Boolean)
          : [];
        if (!createdDoc.coverImage || createdDoc.coverImage.trim() === "") {
          try {
            const patchRes = await apiRequest<BackendEventSingleResponse>(
              `/api/v1/admin-panel/events/${encodeURIComponent(createdDoc._id)}/update`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  existingCoverImage: validCover,
                  existingImages: imagesList,
                }),
                timeoutMs: 30000,
              },
            );
            if (patchRes?.data?.event) {
              createdDoc = patchRes.data.event;
            } else {
              createdDoc.coverImage = validCover;
            }
          } catch (patchErr) {
            console.warn("Could not patch cover image on newly created event:", patchErr);
            createdDoc.coverImage = validCover;
          }
        }
      }
      return normalizeBackendEvent(createdDoc, categories);
    }
    throw new Error(res?.message || "Failed to create event.");
  } catch (err) {
    console.error("Failed to create event:", err);
    throw err;
  }
}

/**
 * 7. CREATE GALLERY ITEM (JSON OR MULTIPART)
 * Endpoint: POST /api/v1/admin-panel/events/create with type="gallery"
 */
export async function createGalleryItemApi(
  payload: FormData | Record<string, any>,
  categories?: EventCategoryItem[],
): Promise<EventGalleryItem> {
  const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;

  try {
    const res = await apiRequest<BackendEventSingleResponse>(
      "/api/v1/admin-panel/events/create",
      {
        method: "POST",
        headers: isFormData ? undefined : { "Content-Type": "application/json" },
        body: isFormData ? payload : JSON.stringify(payload),
        timeoutMs: 30000,
      },
    );

    clearApiCache("/api/v1/admin-panel/events");
    clearApiCache("/api/v1/admin-panel/event-category");

    if (res?.data?.event) {
      let createdDoc = res.data.event;
      if (!isFormData && typeof payload === "object" && payload !== null) {
        const rawCover = payload.coverImage || payload.cover_image || payload.image_url;
        const validCover =
          rawCover && typeof rawCover === "string" && (rawCover.startsWith("http://") || rawCover.startsWith("https://") || rawCover.startsWith("/")) && rawCover.length <= 500
            ? rawCover
            : DEFAULT_EVENT_FALLBACK_IMAGE;
        const imagesList = Array.isArray(payload.images)
          ? payload.images
              .map((img: any, idx: number) => {
                if (typeof img === "string" && img.trim()) {
                  const url = img.trim();
                  if ((url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) && url.length <= 500) {
                    return { url, publicId: `img_${Date.now().toString(36)}_${idx}` };
                  }
                } else if (img && typeof img === "object" && typeof img.url === "string" && img.url.trim()) {
                  const url = img.url.trim();
                  if ((url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) && url.length <= 500) {
                    return {
                      url,
                      publicId: img.publicId?.trim() || `img_${Date.now().toString(36)}_${idx}`,
                    };
                  }
                }
                return null;
              })
              .filter(Boolean)
          : [];
        if (!createdDoc.coverImage || createdDoc.coverImage.trim() === "") {
          try {
            const patchRes = await apiRequest<BackendEventSingleResponse>(
              `/api/v1/admin-panel/events/${encodeURIComponent(createdDoc._id)}/update`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  existingCoverImage: validCover,
                  existingImages: imagesList,
                }),
                timeoutMs: 30000,
              },
            );
            if (patchRes?.data?.event) {
              createdDoc = patchRes.data.event;
            } else {
              createdDoc.coverImage = validCover;
            }
          } catch (patchErr) {
            console.warn("Could not patch cover image on newly created gallery item:", patchErr);
            createdDoc.coverImage = validCover;
          }
        }
      }
      return normalizeBackendGalleryItem(createdDoc, categories);
    }
    throw new Error(res?.message || "Failed to create gallery item.");
  } catch (err) {
    console.error("Failed to create gallery item:", err);
    throw err;
  }
}

/**
 * 8. UPDATE EVENT (JSON OR MULTIPART)
 * Endpoint: PATCH /api/v1/admin-panel/events/:id/update
 */
export async function updateEventApi(
  id: string,
  payload: FormData | Record<string, any>,
  categories?: EventCategoryItem[],
): Promise<CompanyEvent> {
  if (!id) throw new Error("Event ID is required for update.");
  const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;

  let updatePayload = payload;
  if (!isFormData && typeof payload === "object" && payload !== null) {
    const rawExistingImages = payload.existingImages ?? payload.images;
    const sanitizedImages = Array.isArray(rawExistingImages)
      ? rawExistingImages
          .map((img: any, idx: number) => {
            if (typeof img === "string" && img.trim()) {
              const url = img.trim();
              if ((url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) && url.length <= 500) {
                return { url, publicId: `img_${Date.now().toString(36)}_${idx}` };
              }
            } else if (img && typeof img === "object" && typeof img.url === "string" && img.url.trim()) {
              const url = img.url.trim();
              if ((url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) && url.length <= 500) {
                return {
                  url,
                  publicId: img.publicId?.trim() || `img_${Date.now().toString(36)}_${idx}`,
                };
              }
            }
            return null;
          })
          .filter(Boolean)
      : undefined;

    const rawCover = payload.existingCoverImage ?? payload.coverImage ?? payload.cover_image;
    const sanitizedCover =
      rawCover && typeof rawCover === "string" && (rawCover.startsWith("http://") || rawCover.startsWith("https://") || rawCover.startsWith("/")) && rawCover.length <= 500
        ? rawCover
        : undefined;

    updatePayload = {
      ...payload,
      ...(sanitizedCover ? { existingCoverImage: sanitizedCover, coverImage: sanitizedCover } : {}),
      ...(sanitizedImages !== undefined ? { existingImages: sanitizedImages, images: sanitizedImages } : {}),
    };
  }

  try {
    const res = await apiRequest<BackendEventSingleResponse>(
      `/api/v1/admin-panel/events/${encodeURIComponent(id)}/update`,
      {
        method: "PATCH",
        headers: isFormData ? undefined : { "Content-Type": "application/json" },
        body: isFormData ? updatePayload : JSON.stringify(updatePayload),
        timeoutMs: 30000,
      },
    );

    clearApiCache("/api/v1/admin-panel/events");
    clearApiCache("/api/v1/admin-panel/event-category");

    if (res?.data?.event) {
      return normalizeBackendEvent(res.data.event, categories);
    }
    throw new Error(res?.message || "Failed to update event.");
  } catch (err) {
    console.error(`Failed to update event ${id}:`, err);
    throw err;
  }
}

/**
 * 9. DELETE EVENT OR GALLERY ITEM
 * Endpoint: DELETE /api/v1/admin-panel/events/:id/delete
 */
export async function deleteEventApi(id: string): Promise<boolean> {
  if (!id) throw new Error("Event ID is required for deletion.");

  try {
    const res = await apiRequest<{ status: string; message?: string }>(
      `/api/v1/admin-panel/events/${encodeURIComponent(id)}/delete`,
      {
        method: "DELETE",
      },
    );

    clearApiCache("/api/v1/admin-panel/events");
    clearApiCache("/api/v1/admin-panel/event-category");

    return res?.status === "success";
  } catch (err) {
    console.error(`Failed to delete event ${id}:`, err);
    throw err;
  }
}
