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
  validateEvent,
} from "./events.shared";

export async function getPublicEvents(): Promise<PublicEventsPayload> {
  return eventsStore.getPublicPayload();
}

export async function getAdminEventsData(): Promise<{ events: CompanyEvent[]; gallery: EventGalleryItem[] }> {
  return {
    events: eventsStore.events,
    gallery: eventsStore.gallery,
  };
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
