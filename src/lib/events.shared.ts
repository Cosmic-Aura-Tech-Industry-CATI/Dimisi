/** Shared, client-safe types and helpers for DIMISI Events & Gallery. */

export type EventStatus = "upcoming" | "ongoing" | "completed";

export const EVENT_STATUSES: { id: EventStatus; label: string; color: string }[] = [
  { id: "upcoming", label: "Upcoming", color: "var(--dm-amber, #ffb300)" },
  { id: "ongoing", label: "Live Now", color: "#10b981" },
  { id: "completed", label: "Concluded", color: "rgba(255, 255, 255, 0.5)" },
];

export const EVENT_CATEGORIES = [
  "All",
  "Product Launch",
  "Tech Summit",
  "Hackathon",
  "Team Retreat",
  "Open Source & AI",
  "Workshop",
  "Community & Campus",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export interface CompanyEvent {
  id: string;
  title: string;
  slug: string;
  date: string;
  start_time?: string | null | undefined;
  end_time?: string | null | undefined;
  location: string;
  venue_details?: string | null | undefined;
  mode?: "offline" | "online" | "hybrid" | undefined;
  status: EventStatus;
  category: string;
  description: string;
  full_description: string;
  cover_image: string;
  images: string[];
  is_featured: boolean;
  attendees_count?: number | null | undefined;
  registration_url?: string | null | undefined;
  highlights?: string[] | undefined;
  created_at: string;
  updated_at: string;
}

export interface EventGalleryItem {
  id: string;
  event_id?: string | null | undefined;
  event_title?: string | null | undefined;
  title: string;
  caption: string;
  image_url: string;
  category: string;
  aspect_ratio?: "normal" | "tall" | "wide" | undefined;
  hue?: number | undefined;
  created_at: string;
}

export interface EventInput {
  id?: string | null | undefined;
  title: string;
  slug?: string | null | undefined;
  date: string;
  start_time?: string | null | undefined;
  end_time?: string | null | undefined;
  location: string;
  venue_details?: string | null | undefined;
  mode?: "offline" | "online" | "hybrid" | undefined;
  status: EventStatus;
  category: string;
  description: string;
  full_description: string;
  cover_image: string;
  images: string[];
  is_featured: boolean;
  attendees_count?: number | null | undefined;
  registration_url?: string | null | undefined;
  highlights?: string[] | undefined;
}

export interface GalleryItemInput {
  id?: string | null | undefined;
  event_id?: string | null | undefined;
  title: string;
  caption: string;
  image_url: string;
  category: string;
  aspect_ratio?: "normal" | "tall" | "wide" | undefined;
  hue?: number | undefined;
}

export interface PublicEventsPayload {
  events: CompanyEvent[];
  featuredEvent: CompanyEvent | null;
  galleryItems: EventGalleryItem[];
  stats: {
    totalEvents: number;
    upcomingCount: number;
    completedCount: number;
    totalGalleryPhotos: number;
    attendeesServed: number;
  };
  categories: string[];
}

export function slugifyEvent(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateEvent(input: EventInput): { valid: boolean; error?: string; field?: string } {
  const title = input.title?.trim() || "";
  const date = input.date?.trim() || "";
  const location = input.location?.trim() || "";
  const description = input.description?.trim() || "";
  const coverImage = input.cover_image?.trim() || "";

  if (title.length < 3) {
    return { valid: false, error: "Event title must be at least 3 characters long.", field: "title" };
  }
  if (date.length === 0) {
    return { valid: false, error: "Event date is required.", field: "date" };
  }
  if (location.length === 0) {
    return { valid: false, error: "Event location/venue is required.", field: "location" };
  }
  if (description.length < 10) {
    return { valid: false, error: "Event description must be at least 10 characters.", field: "description" };
  }
  if (!coverImage || (!coverImage.startsWith("http://") && !coverImage.startsWith("https://") && !coverImage.startsWith("data:image/"))) {
    return { valid: false, error: "A valid cover image is required (URL or uploaded file).", field: "cover_image" };
  }
  return { valid: true };
}
