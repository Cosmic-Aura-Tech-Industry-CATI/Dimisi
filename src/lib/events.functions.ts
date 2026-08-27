import { createServerFn } from "@tanstack/react-start";
import {
  type CompanyEvent,
  type EventGalleryItem,
  type EventInput,
  type GalleryItemInput,
  type PublicEventsPayload,
  validateEvent,
} from "./events.shared";

/** Public: Fetch all events and gallery items for the frontend Events & Gallery page. */
export const getPublicEvents = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicEventsPayload> => {
    const { eventsStore } = await import("./events.server");
    return eventsStore.getPublicPayload();
  },
);

/** Admin: Fetch all events and gallery items for admin management. */
export const getAdminEventsData = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ events: CompanyEvent[]; gallery: EventGalleryItem[] }> => {
    const { eventsStore } = await import("./events.server");
    return {
      events: eventsStore.events,
      gallery: eventsStore.gallery,
    };
  },
);

/** Admin: Create or update a company event with multiple images and status. */
export const saveEventFn = createServerFn({ method: "POST" })
  .validator((input: EventInput) => input)
  .handler(
    async ({
      data,
    }): Promise<{
      success: boolean;
      event?: CompanyEvent | undefined;
      error?: string | undefined;
    }> => {
      const check = validateEvent(data);
      if (!check.valid) {
        return { success: false, error: check.error || "Invalid event input." };
      }

      const { eventsStore } = await import("./events.server");
      const saved = eventsStore.saveEvent(data);
      return { success: true, event: saved };
    },
  );

/** Admin: Delete an event by ID. */
export const deleteEventFn = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(
    async ({ data }): Promise<{ success: boolean; error?: string | undefined }> => {
      if (!data.id) return { success: false, error: "Event ID is required." };
      const { eventsStore } = await import("./events.server");
      const ok = eventsStore.deleteEvent(data.id);
      return { success: ok };
    },
  );

/** Admin: Create or update a gallery photo. */
export const saveGalleryItemFn = createServerFn({ method: "POST" })
  .validator((input: GalleryItemInput) => input)
  .handler(
    async ({
      data,
    }): Promise<{
      success: boolean;
      item?: EventGalleryItem | undefined;
      error?: string | undefined;
    }> => {
      if (!data.title || !data.image_url) {
        return { success: false, error: "Title and Image URL are required." };
      }
      const { eventsStore } = await import("./events.server");
      const saved = eventsStore.saveGalleryItem(data);
      return { success: true, item: saved };
    },
  );

/** Admin: Delete a gallery photo. */
export const deleteGalleryItemFn = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(
    async ({ data }): Promise<{ success: boolean; error?: string | undefined }> => {
      if (!data.id) return { success: false, error: "Gallery Item ID is required." };
      const { eventsStore } = await import("./events.server");
      const ok = eventsStore.deleteGalleryItem(data.id);
      return { success: ok };
    },
  );
