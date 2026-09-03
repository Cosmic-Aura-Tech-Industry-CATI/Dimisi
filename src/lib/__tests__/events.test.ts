import test from "node:test";
import assert from "node:assert/strict";
import {
  slugifyEvent,
  validateEvent,
  type EventInput,
} from "../events.shared";
import { eventsStore } from "../events.data";

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
});

test("Events System - Store Operations & Status", async (t) => {
  await t.test("returns public payload with accurate counts and seed events", () => {
    const payload = eventsStore.getPublicPayload();
    assert.ok(payload.events.length >= 4);
    assert.ok(payload.featuredEvent !== null);
    assert.ok(payload.stats.totalEvents >= 4);
    assert.ok(payload.stats.totalGalleryPhotos >= 6);
  });

  await t.test("creates, updates, and deletes event in store", () => {
    const newEventInput: EventInput = {
      title: "Test Quantum Tech Summit",
      date: "December 01, 2026",
      location: "Bengaluru, India",
      mode: "hybrid",
      status: "upcoming",
      category: "Tech Summit",
      description: "Exploring post-quantum cryptography in web systems.",
      full_description: "Full event agenda and workshops.",
      cover_image: "https://example.com/quantum.jpg",
      images: ["https://example.com/quantum.jpg", "https://example.com/quantum2.jpg"],
      is_featured: false,
      highlights: ["Quantum resistant auth", "Speed benchmarks"],
    };

    const created = eventsStore.saveEvent(newEventInput);
    assert.ok(created.id);
    assert.equal(created.title, "Test Quantum Tech Summit");
    assert.equal(created.images.length, 2);
    assert.equal(created.mode, "hybrid");

    // Update
    const updated = eventsStore.saveEvent({
      ...newEventInput,
      id: created.id,
      title: "Test Quantum Tech Summit (Updated)",
      status: "ongoing",
    });
    assert.equal(updated.title, "Test Quantum Tech Summit (Updated)");
    assert.equal(updated.status, "ongoing");

    // Delete
    const deleted = eventsStore.deleteEvent(created.id);
    assert.equal(deleted, true);
  });
});
