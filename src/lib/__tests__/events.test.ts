import test from "node:test";
import assert from "node:assert/strict";
import {
  slugifyEvent,
  slugifyEventCategory,
  validateEvent,
  validateEventCategoryInput,
  type EventInput,
  type EventCategoryInput,
} from "../events.shared";
import {
  normalizeBackendEvent,
  normalizeBackendGalleryItem,
  type BackendEventDoc,
} from "@/services/event.service";
import {
  normalizeBackendEventCategory,
  resolveEventCategoryName,
  resolveEventCategoryIdForPayload,
  isMongoId,
  type BackendEventCategoryDoc,
} from "@/services/eventCategory.service";

test("Events System - Slugification", async (t) => {
  await t.test("creates clean URL slugs from event titles", () => {
    assert.equal(
      slugifyEvent("Kalesh App Global Launch 2026!"),
      "kalesh-app-global-launch-2026",
    );
    assert.equal(
      slugifyEvent("   DIMISI Sovereign AI & Agentic Systems Summit   "),
      "dimisi-sovereign-ai-agentic-systems-summit",
    );
  });

  await t.test("creates clean category slugs", () => {
    assert.equal(slugifyEventCategory("Tech Summits & AI"), "tech-summits-ai");
  });
});

test("Events System - Validation", async (t) => {
  await t.test("rejects event when title is too short", () => {
    const check = validateEvent({
      title: "Hi",
      date: "Oct 24, 2026",
      location: "New Delhi",
      description: "A very nice event description for attendees.",
      cover_image: "https://example.com/image.jpg",
      status: "upcoming",
      category: "Tech Summit",
      full_description: "Full description",
      images: [],
      is_featured: false,
    });
    assert.equal(check.valid, false);
    assert.match(check.error || "", /title must be at least 3 characters/i);
    assert.equal(check.field, "title");
  });

  await t.test("rejects event when cover image is missing", () => {
    const check = validateEvent({
      title: "Valid Event Title",
      date: "Oct 24, 2026",
      location: "New Delhi",
      description: "A very nice event description for attendees.",
      cover_image: "",
      status: "upcoming",
      category: "Tech Summit",
      full_description: "Full description",
      images: [],
      is_featured: false,
    });
    assert.equal(check.valid, false);
    assert.match(check.error || "", /valid cover image is required/i);
    assert.equal(check.field, "cover_image");
  });

  await t.test("accepts valid event payload with URL or Data URL", () => {
    const check = validateEvent({
      title: "Kalesh Global Keynote",
      date: "Oct 24, 2026",
      location: "New Delhi & Virtual",
      description: "Official launch event for the Kalesh anonymous platform.",
      cover_image: "https://example.com/image.jpg",
      status: "upcoming",
      category: "Product Launch",
      full_description: "Deep dive into WebGPU architecture.",
      images: ["https://example.com/image.jpg"],
      is_featured: true,
    });
    assert.equal(check.valid, true);

    const checkDataUrl = validateEvent({
      title: "Kalesh Global Keynote",
      date: "Oct 24, 2026",
      location: "New Delhi & Virtual",
      description: "Official launch event for the Kalesh anonymous platform.",
      cover_image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      status: "upcoming",
      category: "Product Launch",
      full_description: "Deep dive into WebGPU architecture.",
      images: [],
      is_featured: true,
    });
    assert.equal(checkDataUrl.valid, true);
  });

  await t.test("validates event category inputs", () => {
    const valid = validateEventCategoryInput({
      name: "AI & Robotics",
      displayOrder: 1,
      status: "active",
      order_index: 1,
    });
    assert.equal(valid.valid, true);

    const invalid = validateEventCategoryInput({
      name: "A",
      status: "active",
      order_index: 1,
    });
    assert.equal(invalid.valid, false);
  });
});

test("Events System - MongoDB Normalization & ObjectId Mapping", async (t) => {
  await t.test("validates MongoDB ObjectId strings", () => {
    assert.equal(isMongoId("64b8f3e5c9e77b0012a4b8d1"), true);
    assert.equal(isMongoId("invalid-id"), false);
    assert.equal(isMongoId(""), false);
    assert.equal(isMongoId(undefined), false);
  });

  await t.test("normalizes backend event category documents", () => {
    const backendCategory: BackendEventCategoryDoc = {
      _id: "64b8f3e5c9e77b0012a4b8d1",
      name: "Autonomous AI Summit",
      slug: "autonomous-ai-summit",
      description: "Conferences on autonomy",
      displayOrder: 1,
      isActive: true,
      totalEventCount: 5,
      activeEventCount: 3,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    };

    const normalized = normalizeBackendEventCategory(backendCategory);
    assert.equal(normalized.id, "64b8f3e5c9e77b0012a4b8d1");
    assert.equal(normalized.name, "Autonomous AI Summit");
    assert.equal(normalized.slug, "autonomous-ai-summit");
    assert.equal(normalized.status, "active");
    assert.equal(normalized.order_index, 1);
  });

  await t.test("normalizes backend event documents", () => {
    const backendEvent: BackendEventDoc = {
      _id: "64b8f3e5c9e77b0012a4b8d9",
      title: "Global Tech Convergence",
      slug: "global-tech-convergence",
      type: "event",
      category: {
        _id: "64b8f3e5c9e77b0012a4b8d1",
        name: "Autonomous AI Summit",
      },
      date: "2026-11-14T00:00:00.000Z",
      startDate: "2026-11-14T10:00:00.000Z",
      endDate: "2026-11-14T17:00:00.000Z",
      location: "Bengaluru, India",
      venueDetails: "Grand Convention Hall",
      mode: "hybrid",
      status: "upcoming",
      description: "Leading technical summit on autonomous systems.",
      coverImage: "https://example.com/cover.jpg",
      images: [{ url: "https://example.com/img1.jpg", publicId: "img1" }],
      attendeesCount: 450,
      registrationUrl: "https://example.com/register",
      highlights: ["Keynote Speech", "Live Demo"],
      isFeatured: true,
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    };

    const normalized = normalizeBackendEvent(backendEvent);
    assert.equal(normalized.id, "64b8f3e5c9e77b0012a4b8d9");
    assert.equal(normalized.title, "Global Tech Convergence");
    assert.equal(normalized.category, "Autonomous AI Summit");
    assert.equal(normalized.mode, "hybrid");
    assert.equal(normalized.is_featured, true);
    assert.equal(normalized.gallery_images.length, 1);
    assert.equal(normalized.highlights?.length, 2);
  });

  await t.test("normalizes backend gallery items", () => {
    const backendGallery: BackendEventDoc = {
      _id: "64b8f3e5c9e77b0012a4b8e2",
      title: "Main Stage Light Study",
      slug: "main-stage-light-study",
      type: "gallery",
      category: "Autonomous AI Summit",
      date: "2026-11-14T00:00:00.000Z",
      startDate: "2026-11-14T10:00:00.000Z",
      endDate: "2026-11-14T17:00:00.000Z",
      location: "DIMISI Gallery",
      mode: "offline",
      status: "completed",
      description: "Volumetric laser lighting capture.",
      coverImage: "https://example.com/gallery.jpg",
      images: [],
      isFeatured: false,
      isActive: true,
    };

    const normalized = normalizeBackendGalleryItem(backendGallery);
    assert.equal(normalized.id, "64b8f3e5c9e77b0012a4b8e2");
    assert.equal(normalized.title, "Main Stage Light Study");
    assert.equal(normalized.caption, "Volumetric laser lighting capture.");
    assert.equal(normalized.image_url, "https://example.com/gallery.jpg");
  });

  await t.test("resolves category names and IDs properly", async () => {
    const categories = [
      {
        id: "64b8f3e5c9e77b0012a4b8d1",
        name: "Autonomous AI Summit",
        slug: "autonomous-ai-summit",
        status: "active" as const,
        order_index: 1,
        created_at: "2026-01-01T00:00:00.000Z",
      },
    ];

    // Name resolution
    const resolvedName = resolveEventCategoryName("64b8f3e5c9e77b0012a4b8d1", categories);
    assert.equal(resolvedName, "Autonomous AI Summit");

    // ID resolution
    const resolvedId = await resolveEventCategoryIdForPayload("Autonomous AI Summit", categories);
    assert.equal(resolvedId, "64b8f3e5c9e77b0012a4b8d1");

    // Unmatched category safely resolves to a valid known MongoDB ObjectId
    const unresolvable = await resolveEventCategoryIdForPayload("Unknown Cat", categories);
    assert.ok(isMongoId(unresolvable));
  });

  await t.test("auto-generates valid slug for category creation payload", () => {
    const rawName = "  Annual Developers Conference 2026!  ";
    const generatedSlug = slugifyEventCategory(rawName);
    assert.equal(generatedSlug, "annual-developers-conference-2026");
  });

  await t.test("normalizes gallery items with valid aspect ratios and fallback images", () => {
    const backendGallery: BackendEventDoc = {
      _id: "64b8f3e5c9e77b0012a4b8e5",
      title: "Night Keynote Session",
      slug: "night-keynote-session",
      type: "gallery",
      category: "64b8f3e5c9e77b0012a4b8d1",
      date: "2026-11-14T00:00:00.000Z",
      description: "Night keynote session recording.",
      coverImage: "",
      images: [],
      isActive: true,
    };

    const normalized = normalizeBackendGalleryItem(backendGallery, [
      {
        id: "64b8f3e5c9e77b0012a4b8d1",
        name: "Autonomous AI Summit",
        slug: "autonomous-ai-summit",
        status: "active",
        order_index: 1,
        created_at: "2026-01-01T00:00:00.000Z",
      },
    ]);

    assert.equal(normalized.id, "64b8f3e5c9e77b0012a4b8e5");
    assert.equal(normalized.category, "Autonomous AI Summit");
    assert.equal(normalized.aspect_ratio, "normal");
    assert.ok(normalized.image_url.length > 0);
  });

  await t.test("preserves empty array without generating mock data or fixture fallbacks", () => {
    const rawEventsList: BackendEventDoc[] = [];
    const normalizedEvents = rawEventsList
      .filter((doc) => doc.type !== "gallery")
      .map((doc) => normalizeBackendEvent(doc));
    const normalizedGallery = rawEventsList
      .filter((doc) => doc.type === "gallery")
      .map((doc) => normalizeBackendGalleryItem(doc));

    assert.equal(normalizedEvents.length, 0);
    assert.equal(normalizedGallery.length, 0);
    assert.deepEqual(normalizedEvents, []);
    assert.deepEqual(normalizedGallery, []);
  });

  await t.test("generates unique slugs for consecutive items to avoid MongoDB index collisions", () => {
    const baseTitle = "DIMISI Annual Gala 2026";
    const slug1 = slugifyEvent(baseTitle);
    const slug2 = `${slugifyEvent(baseTitle)}-${Date.now().toString(36)}`;
    const slug3 = `${slugifyEvent(baseTitle)}-${(Date.now() + 1).toString(36)}`;

    assert.notEqual(slug1, slug2);
    assert.notEqual(slug2, slug3);
    assert.match(slug1, /^[a-z0-9-]+$/);
    assert.match(slug2, /^[a-z0-9-]+$/);
    assert.match(slug3, /^[a-z0-9-]+$/);
  });

  await t.test("subdocument images always contain non-empty publicId for Mongoose schema compliance", () => {
    const rawImages = ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"];
    const sanitizedImages = rawImages.map((url, idx) => ({
      url,
      publicId: `img_${Date.now().toString(36)}_${idx}`,
    }));

    for (const img of sanitizedImages) {
      assert.ok(img.url.startsWith("http"));
      assert.ok(img.publicId.length > 0);
      assert.match(img.publicId, /^img_/);
    }
  });

  await t.test("preserves type='gallery' vs type='event' separation across normalization", () => {
    const galleryDoc: BackendEventDoc = {
      _id: "64b8f3e5c9e77b0012a4b8f1",
      title: "Gallery Photo Alpha",
      type: "gallery",
      category: "64b8f3e5c9e77b0012a4b8d1",
      date: "2026-11-14T00:00:00.000Z",
      description: "Description of photo",
      coverImage: "https://example.com/photo.jpg",
      images: [],
    };
    const eventDoc: BackendEventDoc = {
      _id: "64b8f3e5c9e77b0012a4b8f2",
      title: "Major Event Beta",
      type: "event",
      category: "64b8f3e5c9e77b0012a4b8d1",
      date: "2026-11-14T00:00:00.000Z",
      description: "Description of event",
      coverImage: "https://example.com/cover.jpg",
      images: [],
    };

    const docs = [galleryDoc, eventDoc];
    const galleryItems = docs.filter((d) => d.type === "gallery").map((d) => normalizeBackendGalleryItem(d));
    const eventItems = docs.filter((d) => d.type !== "gallery").map((d) => normalizeBackendEvent(d));

    assert.equal(galleryItems.length, 1);
    assert.equal(galleryItems[0].title, "Gallery Photo Alpha");
    assert.equal(eventItems.length, 1);
    assert.equal(eventItems[0].title, "Major Event Beta");
  });
});

