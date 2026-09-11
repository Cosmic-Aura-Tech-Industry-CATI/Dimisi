/**
 * DIMISI Technologies — Client-Side Events & Gallery Functions
 * Pure client-side implementation backed by in-memory and local data.
 */
import { eventsStore } from "./events.data";
import {
  type CompanyEvent,
  type EventGalleryItem,
  type EventInput,
  type GalleryItemInput,
  type PublicEventsPayload,
  type EventCategoryItem,
  type EventCategoryInput,
  validateEvent,
  validateEventCategoryInput,
} from "./events.shared";

export async function getPublicEvents(): Promise<PublicEventsPayload> {
  return eventsStore.getPublicPayload();
}

export async function getAdminEventsData(): Promise<{
  events: CompanyEvent[];
  gallery: EventGalleryItem[];
  categoryItems: EventCategoryItem[];
  categoryCounts: Record<string, number>;
}> {
  return {
    events: eventsStore.events,
    gallery: eventsStore.gallery,
    categoryItems: eventsStore.getCategoryItems(),
    categoryCounts: eventsStore.getCategoryEventCounts(),
  };
}

export async function getEventCategoriesFn(): Promise<{
  categories: EventCategoryItem[];
  counts: Record<string, number>;
}> {
  return {
    categories: eventsStore.getCategoryItems(),
    counts: eventsStore.getCategoryEventCounts(),
  };
}

export async function saveEventCategoryFn({
  data,
}: {
  data: EventCategoryInput;
}): Promise<{
  success: boolean;
  category?: EventCategoryItem | undefined;
  error?: string | undefined;
}> {
  const check = validateEventCategoryInput(data);
  if (!check.valid) {
    return { success: false, error: check.error || "Invalid category input." };
  }
  try {
    const saved = eventsStore.saveCategory(data);
    return { success: true, category: saved };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to save category." };
  }
}

export async function deleteEventCategoryFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; eventCount?: number | undefined; error?: string | undefined }> {
  if (!data?.id) return { success: false, error: "Category ID is required." };
  const res = eventsStore.deleteCategory(data.id);
  return { success: res.success, eventCount: res.eventCount };
}

export async function saveEventFn({
  data,
}: {
  data: EventInput;
}): Promise<{
  success: boolean;
  event?: CompanyEvent | undefined;
  error?: string | undefined;
}> {
  const check = validateEvent(data);
  if (!check.valid) {
    return { success: false, error: check.error || "Invalid event input." };
  }

  const saved = eventsStore.saveEvent(data);
  return { success: true, event: saved };
}

export async function deleteEventFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; error?: string | undefined }> {
  if (!data?.id) return { success: false, error: "Event ID is required." };
  const ok = eventsStore.deleteEvent(data.id);
  return { success: ok };
}

export async function saveGalleryItemFn({
  data,
}: {
  data: GalleryItemInput;
}): Promise<{
  success: boolean;
  item?: EventGalleryItem | undefined;
  error?: string | undefined;
}> {
  if (!data.title || !data.image_url) {
    return { success: false, error: "Title and Image URL are required." };
  }
  const saved = eventsStore.saveGalleryItem(data);
  return { success: true, item: saved };
}

export async function deleteGalleryItemFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; error?: string | undefined }> {
  if (!data?.id) return { success: false, error: "Gallery Item ID is required." };
  const ok = eventsStore.deleteGalleryItem(data.id);
  return { success: ok };
}
