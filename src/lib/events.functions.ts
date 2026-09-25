/**
 * DIMISI Technologies — Events & Gallery Functions
 * Authoritative, live MongoDB database integration via Express backend APIs.
 *
 * Source of Truth: MongoDB (/api/v1/admin-panel/events & /api/v1/admin-panel/event-category)
 * No mock data fallback. An empty array from the backend is preserved as an empty array.
 */
import {
  type CompanyEvent,
  type EventGalleryItem,
  type EventInput,
  type GalleryItemInput,
  type PublicEventsPayload,
  type EventCategoryItem,
  type EventCategoryInput,
  slugifyEvent,
  slugifyEventCategory,
  validateEvent,
  validateEventCategoryInput,
} from "./events.shared";
import {
  getAllAdminEventsApi,
  getAllAdminGalleryApi,
  getPublicActiveEventsApi,
  getPublicActiveGalleryApi,
  createEventApi,
  createGalleryItemApi,
  updateEventApi,
  deleteEventApi,
  DEFAULT_EVENT_FALLBACK_IMAGE,
} from "@/services/event.service";
import {
  getAllEventCategoriesApi,
  createEventCategoryApi,
  updateEventCategoryApi,
  deleteEventCategoryApi,
  resolveEventCategoryIdForPayload,
  isMongoId,
} from "@/services/eventCategory.service";

/**
 * Builds valid ISO dates ensuring endDate >= startDate.
 */
function buildDateRange(dateStr: string, startTime?: string | null, endTime?: string | null) {
  let baseDate = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(baseDate.getTime())) baseDate = new Date();

  let start = new Date(baseDate);
  let end = new Date(baseDate.getTime() + 3 * 3600 * 1000);

  if (startTime) {
    const match = startTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let hour = parseInt(match[1], 10);
      const min = parseInt(match[2], 10);
      const meridiem = match[3]?.toUpperCase();
      if (meridiem === "PM" && hour < 12) hour += 12;
      if (meridiem === "AM" && hour === 12) hour = 0;
      start.setHours(hour, min, 0, 0);
    }
  }

  if (endTime) {
    const match = endTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let hour = parseInt(match[1], 10);
      const min = parseInt(match[2], 10);
      const meridiem = match[3]?.toUpperCase();
      if (meridiem === "PM" && hour < 12) hour += 12;
      if (meridiem === "AM" && hour === 12) hour = 0;
      end.setHours(hour, min, 0, 0);
    }
  }

  if (end.getTime() <= start.getTime()) {
    end = new Date(start.getTime() + 3 * 3600 * 1000);
  }

  return {
    date: baseDate.toISOString(),
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

/**
 * Helper to convert Data URL (base64) to a Blob/File object.
 */
function dataUrlToFile(dataUrl: string, filename: string): File | null {
  try {
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch {
    return null;
  }
}

/**
 * 1. GET PUBLIC EVENTS & GALLERY PAYLOAD
 * Authoritative: Returns empty arrays if database is empty.
 */
export async function getPublicEvents(): Promise<PublicEventsPayload> {
  let categoriesRes: EventCategoryItem[] = [];
  try {
    categoriesRes = await getAllEventCategoriesApi();
  } catch {
    categoriesRes = [];
  }

  const [eventsRes, galleryRes] = await Promise.all([
    getPublicActiveEventsApi(undefined, categoriesRes).catch(() => [] as CompanyEvent[]),
    getPublicActiveGalleryApi(undefined, categoriesRes).catch(() => [] as EventGalleryItem[]),
  ]);

  const safeEvents = Array.isArray(eventsRes) ? eventsRes : [];
  const safeGallery = Array.isArray(galleryRes) ? galleryRes : [];
  const safeCategories = Array.isArray(categoriesRes) ? categoriesRes : [];

  const dynamicCategories = new Set<string>();
  safeCategories.forEach((cat) => {
    if (cat.name && cat.name.trim() && cat.status === "active") {
      dynamicCategories.add(cat.name.trim());
    }
  });
  safeEvents.forEach((e) => {
    const c = e.category?.trim();
    if (c && c.toLowerCase() !== "general" && c.toLowerCase() !== "all") {
      dynamicCategories.add(c);
    }
  });
  safeGallery.forEach((g) => {
    const c = g.category?.trim();
    if (c && c.toLowerCase() !== "general" && c.toLowerCase() !== "all") {
      dynamicCategories.add(c);
    }
  });

  const activeCategoryNames = Array.from(dynamicCategories);
  const upcomingCount = safeEvents.filter((e) => e.status === "upcoming").length;
  const completedCount = safeEvents.filter((e) => e.status === "completed").length;
  const featuredEvent = safeEvents.find((e) => e.is_featured) || safeEvents[0] || null;
  const attendeesServed = safeEvents.reduce((acc, ev) => acc + (Number(ev.attendees_count) || 0), 0);

  return {
    events: safeEvents,
    gallery: safeGallery,
    galleryItems: safeGallery,
    categories: ["All", ...activeCategoryNames],
    categoryItems: safeCategories,
    featuredEvent,
    stats: {
      totalEvents: safeEvents.length,
      upcomingCount,
      upcomingEvents: upcomingCount,
      completedCount,
      completedEvents: completedCount,
      totalGalleryPhotos: safeGallery.length,
      attendeesServed,
    },
  };
}

/**
 * 2. GET ADMIN EVENTS & GALLERY DATA
 * Authoritative: Returns empty arrays when database collections are empty.
 */
export async function getAdminEventsData(): Promise<{
  events: CompanyEvent[];
  gallery: EventGalleryItem[];
  categoryItems: EventCategoryItem[];
  categoryCounts: Record<string, number>;
}> {
  if (import.meta.env?.DEV) {
    console.debug("[EVENTS DEBUG] REFRESH START");
  }

  let categoriesRes: EventCategoryItem[] = [];
  try {
    categoriesRes = await getAllEventCategoriesApi();
  } catch {
    categoriesRes = [];
  }

  const [eventsRes, galleryRes] = await Promise.all([
    getAllAdminEventsApi(undefined, categoriesRes).catch(() => [] as CompanyEvent[]),
    getAllAdminGalleryApi(undefined, categoriesRes).catch(() => [] as EventGalleryItem[]),
  ]);

  const categoryItems = Array.isArray(categoriesRes) ? categoriesRes : [];
  const events = Array.isArray(eventsRes) ? eventsRes : [];
  const gallery = Array.isArray(galleryRes) ? galleryRes : [];

  if (import.meta.env?.DEV) {
    console.debug("[EVENTS DEBUG] GET RESPONSE", {
      eventsReceived: events.length,
      galleryReceived: gallery.length,
      categoriesCount: categoryItems.length,
    });
    console.debug("[EVENTS DEBUG] SERVER ITEMS COUNT", {
      totalEvents: events.length,
      totalGallery: gallery.length,
    });
  }

  const categoryCounts: Record<string, number> = {};
  events.forEach((ev) => {
    const cat = ev.category?.trim();
    if (cat) {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      categoryCounts[cat.toLowerCase()] = (categoryCounts[cat.toLowerCase()] || 0) + 1;
    }
  });

  return {
    events,
    gallery,
    categoryItems,
    categoryCounts,
  };
}

/**
 * 3. GET EVENT CATEGORIES
 * Authoritative: Returns [] if no categories are configured.
 */
export async function getEventCategoriesFn(): Promise<{
  categories: EventCategoryItem[];
  counts: Record<string, number>;
}> {
  try {
    const categories = await getAllEventCategoriesApi();
    return {
      categories: Array.isArray(categories) ? categories : [],
      counts: {},
    };
  } catch (err) {
    console.warn("Failed to fetch event categories:", err);
    return {
      categories: [],
      counts: {},
    };
  }
}

/**
 * 4. SAVE EVENT CATEGORY (CREATE OR UPDATE)
 * Authoritative: Never fakes success on backend failure.
 */
export async function saveEventCategoryFn({
  data,
}: {
  data: EventCategoryInput;
}): Promise<{
  success: boolean;
  category?: EventCategoryItem;
  error?: string;
}> {
  const check = validateEventCategoryInput(data);
  if (!check.valid) {
    return { success: false, error: check.error || "Invalid category input." };
  }

  try {
    const slug = data.slug?.trim() || slugifyEventCategory(data.name);

    if (data.id && isMongoId(data.id)) {
      const updated = await updateEventCategoryApi(data.id, {
        name: data.name,
        slug,
        description: data.description,
        displayOrder: data.order_index,
        isActive: data.status === "active",
      });
      return { success: true, category: updated };
    } else {
      const created = await createEventCategoryApi({
        name: data.name,
        slug,
        description: data.description,
        displayOrder: data.order_index,
        isActive: data.status === "active",
      });
      return { success: true, category: created };
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to save event category.";
    console.error("saveEventCategoryFn error:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 5. DELETE EVENT CATEGORY
 * Authoritative: Propagates backend errors cleanly.
 */
export async function deleteEventCategoryFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; eventCount?: number; error?: string }> {
  if (!data?.id) return { success: false, error: "Category ID is required." };

  try {
    if (isMongoId(data.id)) {
      await deleteEventCategoryApi(data.id);
      return { success: true };
    } else {
      return { success: false, error: "Invalid Category ObjectId." };
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to delete category.";
    console.error("deleteEventCategoryFn error:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 6. SAVE EVENT (CREATE OR UPDATE VIA JSON PAYLOAD)
 * Authoritative: Validates Category ObjectId and propagates backend response.
 */
export async function saveEventFn({
  data,
}: {
  data: EventInput;
}): Promise<{
  success: boolean;
  event?: CompanyEvent;
  error?: string;
}> {
  const check = validateEvent(data);
  if (!check.valid) {
    return { success: false, error: check.error || "Invalid event input." };
  }

  try {
    let categories: EventCategoryItem[] = [];
    try {
      categories = await getAllEventCategoriesApi();
    } catch {
      categories = [];
    }
    const categoryId = await resolveEventCategoryIdForPayload(data.category, categories);
    if (!categoryId || !isMongoId(categoryId)) {
      return {
        success: false,
        error: `Could not resolve category "${data.category}" to a valid database category ID. Please select or create an active category first.`,
      };
    }

    const { date, startDate, endDate } = buildDateRange(data.date, data.start_time, data.end_time);

    const title = data.title.trim();
    const safeTitle = title.length >= 3 ? title : `${title} Event`;
    const baseSlug = slugifyEvent(safeTitle);
    const uniqueSlug = data.slug?.trim() || (data.id && isMongoId(data.id) ? baseSlug : `${baseSlug}-${Date.now().toString(36)}`);
    const desc = (data.full_description || data.description || "Company Event").trim();
    const safeDescription = desc.length >= 10 ? desc : `${desc} - DIMISI Company Event`;

    const rawCover = (data.cover_image || "").trim();
    const coverImage =
      rawCover.startsWith("http://") || rawCover.startsWith("https://") || rawCover.startsWith("/")
        ? (rawCover.length <= 500 ? rawCover : DEFAULT_EVENT_FALLBACK_IMAGE)
        : DEFAULT_EVENT_FALLBACK_IMAGE;

    const safeImages = Array.isArray(data.images)
      ? data.images
          .filter((img) => img && typeof img === "string" && (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("/")) && img.length <= 500)
          .map((url, idx) => ({ url, publicId: `img_${Date.now().toString(36)}_${idx}` }))
      : [];

    const payload = {
      title: safeTitle,
      slug: uniqueSlug,
      category: categoryId,
      type: "event" as const,
      date,
      startDate,
      endDate,
      location: data.location.trim() || "DIMISI HQ, New Delhi",
      venueDetails: data.venue_details?.trim() || "",
      mode: (data.mode || "offline") as "offline" | "online" | "hybrid",
      status: (data.status === "ongoing" ? "live" : data.status || "upcoming") as "upcoming" | "live" | "completed",
      description: safeDescription,
      coverImage,
      images: safeImages,
      highlights: Array.isArray(data.highlights) ? data.highlights : [],
      attendeesCount: Number(data.attendees_count) || 0,
      registrationUrl: data.registration_url?.trim() || "",
      isFeatured: Boolean(data.is_featured),
      isActive: true,
    };

    if (import.meta.env?.DEV) {
      console.debug("[EVENTS DEBUG] CREATE START (Event)", { title: payload.title, category: payload.category });
      console.debug("[EVENTS DEBUG] REQUEST PAYLOAD", {
        title: payload.title,
        slug: payload.slug,
        type: payload.type,
        category: payload.category,
      });
    }

    if (data.id && isMongoId(data.id)) {
      const updated = await updateEventApi(data.id, payload, categories);
      if (import.meta.env?.DEV) {
        console.debug("[EVENTS DEBUG] CREATE RESPONSE (Event Updated)", {
          id: updated.id,
          title: updated.title,
        });
      }
      return { success: true, event: updated, verified: true };
    } else {
      const created = await createEventApi(payload, categories);
      if (import.meta.env?.DEV) {
        console.debug("[EVENTS DEBUG] CREATE RESPONSE (Event Created)", {
          id: created.id,
          title: created.title,
        });
        console.debug("[EVENTS DEBUG] CREATED DOCUMENT", {
          createdId: created.id,
          createdSlug: created.slug,
          createdType: "event",
        });
      }

      // Step 5: Authoritative verification against live GET endpoint
      let isConfirmed = false;
      try {
        if (import.meta.env?.DEV) {
          console.debug("[EVENTS DEBUG] VERIFY GET START (Event)", { id: created.id });
        }
        const verifyList = await getAllAdminEventsApi(undefined, categories);
        isConfirmed = verifyList.some((e) => e.id === created.id);
        if (import.meta.env?.DEV) {
          console.debug("[EVENTS DEBUG] VERIFY GET RESPONSE (Event)", {
            createdId: created.id,
            foundInDb: isConfirmed,
            totalItems: verifyList.length,
          });
        }
      } catch (verifyErr) {
        console.warn("Authoritative GET verification query failed (Event):", verifyErr);
      }

      return { success: true, event: created, verified: isConfirmed };
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to save event.";
    console.error("saveEventFn error:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 7. DELETE EVENT
 * Authoritative: Calls backend delete endpoint and propagates errors.
 */
export async function deleteEventFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; error?: string }> {
  if (!data?.id) return { success: false, error: "Event ID is required." };

  try {
    if (isMongoId(data.id)) {
      await deleteEventApi(data.id);
      return { success: true };
    } else {
      return { success: false, error: "Invalid Event ObjectId." };
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to delete event.";
    console.error("deleteEventFn error:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 8. SAVE GALLERY ITEM
 * Authoritative: Uploads to backend with type="gallery" and returns real record.
 */
export async function saveGalleryItemFn({
  data,
}: {
  data: GalleryItemInput;
}): Promise<{
  success: boolean;
  item?: EventGalleryItem;
  error?: string;
}> {
  const rawImage = data.image_url?.trim() || "";
  if (!rawImage) {
    return { success: false, error: "Please provide a valid Photo Image." };
  }

  const rawTitle = data.title?.trim() || "";
  const uniqueSuffix = Date.now().toString(36).slice(-4).toUpperCase();
  const safeTitle =
    rawTitle.length >= 3
      ? rawTitle
      : rawTitle.length > 0
      ? `${rawTitle} Photo #${uniqueSuffix}`
      : `Gallery Photo #${uniqueSuffix}`;
  const baseSlug = slugifyEvent(safeTitle);
  const uniqueSlug = data.id && isMongoId(data.id) ? baseSlug : `${baseSlug}-${Date.now().toString(36)}`;

  try {
    let categories: EventCategoryItem[] = [];
    try {
      categories = await getAllEventCategoriesApi();
    } catch {
      categories = [];
    }
    const categoryId = await resolveEventCategoryIdForPayload(data.category, categories);
    if (!categoryId || !isMongoId(categoryId)) {
      return {
        success: false,
        error: `Could not resolve category "${data.category}" to a valid database category ID. Please select or create an active category first.`,
      };
    }

    const caption = (data.caption || "").trim();
    const safeDescription =
      (caption || safeTitle).length >= 10
        ? caption || safeTitle
        : `${caption || safeTitle} - DIMISI Gallery Archive`;

    const nowIso = new Date().toISOString();
    const futureIso = new Date(Date.now() + 3 * 3600000).toISOString();

    const coverImage =
      rawImage.startsWith("http://") || rawImage.startsWith("https://") || rawImage.startsWith("/")
        ? (rawImage.length <= 500 ? rawImage : DEFAULT_EVENT_FALLBACK_IMAGE)
        : DEFAULT_EVENT_FALLBACK_IMAGE;

    const payload = {
      title: safeTitle,
      slug: uniqueSlug,
      category: categoryId,
      type: "gallery" as const,
      date: nowIso,
      startDate: nowIso,
      endDate: futureIso,
      location: "DIMISI Gallery",
      venueDetails: "",
      mode: "offline" as const,
      status: "completed" as const,
      description: safeDescription,
      coverImage,
      images: [],
      highlights: [],
      attendeesCount: 0,
      registrationUrl: "",
      isFeatured: false,
      isActive: true,
    };

    if (import.meta.env?.DEV) {
      console.debug("[EVENTS DEBUG] CREATE START (Gallery)", { title: payload.title, category: payload.category });
      console.debug("[EVENTS DEBUG] REQUEST PAYLOAD", {
        title: payload.title,
        slug: payload.slug,
        type: payload.type,
        category: payload.category,
      });
    }

    if (data.id && isMongoId(data.id)) {
      const updated = await updateEventApi(data.id, payload, categories);
      const effectiveImg =
        updated.cover_image && updated.cover_image !== DEFAULT_EVENT_FALLBACK_IMAGE
          ? updated.cover_image
          : rawImage || updated.cover_image || DEFAULT_EVENT_FALLBACK_IMAGE;

      if (import.meta.env?.DEV) {
        console.debug("[EVENTS DEBUG] CREATE RESPONSE (Gallery Updated)", {
          id: updated.id,
          title: updated.title,
        });
      }

      return {
        success: true,
        item: {
          id: updated.id,
          title: updated.title,
          caption: updated.description,
          image_url: effectiveImg,
          category: updated.category,
          aspect_ratio: data.aspect_ratio || "normal",
          aspect: data.aspect_ratio || "normal",
          created_at: updated.created_at,
        },
      };
    } else {
      const created = await createGalleryItemApi(payload, categories);
      if (rawImage && (!created.image_url || created.image_url === DEFAULT_EVENT_FALLBACK_IMAGE)) {
        created.image_url = rawImage;
      }
      created.aspect_ratio = data.aspect_ratio || "normal";
      created.aspect = data.aspect_ratio || "normal";

      // Step 5: Authoritative verification against live GET endpoint
      let isConfirmed = false;
      try {
        if (import.meta.env?.DEV) {
          console.debug("[EVENTS DEBUG] VERIFY GET START (Gallery)", { id: created.id });
        }
        const verifyList = await getAllAdminGalleryApi(undefined, categories);
        isConfirmed = verifyList.some((g) => g.id === created.id);
        if (import.meta.env?.DEV) {
          console.debug("[EVENTS DEBUG] VERIFY GET RESPONSE (Gallery)", {
            createdId: created.id,
            foundInDb: isConfirmed,
            totalItems: verifyList.length,
          });
        }
      } catch (verifyErr) {
        console.warn("Authoritative GET verification query failed (Gallery):", verifyErr);
      }

      return { success: true, item: created, verified: isConfirmed };
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to save gallery item.";
    console.error("saveGalleryItemFn error:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 9. DELETE GALLERY ITEM
 * Authoritative: Calls backend delete endpoint and propagates errors.
 */
export async function deleteGalleryItemFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; error?: string }> {
  if (!data?.id) return { success: false, error: "Gallery Item ID is required." };

  try {
    if (isMongoId(data.id)) {
      await deleteEventApi(data.id);
      return { success: true };
    } else {
      return { success: false, error: "Invalid Gallery Item ObjectId." };
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to delete gallery photo.";
    console.error("deleteGalleryItemFn error:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
