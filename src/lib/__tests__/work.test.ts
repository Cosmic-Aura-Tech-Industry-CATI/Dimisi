import test from "node:test";
import assert from "node:assert/strict";
import {
  slugifyProject,
  validateProjectInput,
  type ProjectInput,
} from "../work.shared";
import { workStore } from "../work.data";

test("Work & Products System - Slugification", async (t) => {
  await t.test("creates clean URL slugs from project titles", () => {
    assert.equal(slugifyProject("Rudra Tours & Travels"), "rudra-tours-travels");
    assert.equal(slugifyProject("  Kalesh: Anonymous Social!  "), "kalesh-anonymous-social");
    assert.equal(slugifyProject("AxisCon 2026 ICCIST"), "axiscon-2026-iccist");
  });
});

test("Work & Products System - Validation", async (t) => {
  await t.test("rejects project when title is missing or too short", () => {
    const check = validateProjectInput({
      title: "A",
      type: "work",
      category: "Travel",
      overview: "Valid project overview text with sufficient length.",
      challenge: "Valid challenge description text with sufficient length.",
      solution: "Valid solution description text with sufficient length.",
      outcome: "Valid outcome description text with sufficient length.",
      cover_image: "https://example.com/cover.jpg",
    });
    assert.equal(check.valid, false);
    assert.match(check.error || "", /title must be at least 2 characters/i);
  });

  await t.test("rejects project when type is invalid", () => {
    const check = validateProjectInput({
      title: "Valid Project",
      type: "invalid_type" as unknown as "work",
      category: "Travel",
      overview: "Valid project overview text with sufficient length.",
      challenge: "Valid challenge description text with sufficient length.",
      solution: "Valid solution description text with sufficient length.",
      outcome: "Valid outcome description text with sufficient length.",
      cover_image: "https://example.com/cover.jpg",
    });
    assert.equal(check.valid, false);
    assert.match(check.error || "", /type must be either 'work' or 'product'/i);
  });

  await t.test("rejects project when 4-pillar narrative fields are incomplete", () => {
    const check = validateProjectInput({
      title: "Valid Project",
      type: "product",
      category: "Social Platform",
      overview: "Short",
      challenge: "Short",
      solution: "Short",
      outcome: "Short",
      cover_image: "https://example.com/cover.jpg",
    });
    assert.equal(check.valid, false);
    assert.match(check.error || "", /must be at least 10 characters/i);
  });

  await t.test("accepts valid case study input", () => {
    const check = validateProjectInput({
      title: "Kalesh Social Engine",
      type: "product",
      category: "Social Platform · Website",
      tagline: "Anonymous Polling Engine",
      overview: "An anonymous social platform built around real-time polls, private chats, and authentic opinion sharing.",
      challenge: "The product needed a clear way to explain anonymity, community trust, and fast participation without overwhelming first-time visitors.",
      solution: "We presented the platform around anonymous profiles, instant polls, and direct community actions so the value is obvious on arrival.",
      outcome: "Visitors can quickly understand how to share honest opinions without profile pressure or identity exposure.",
      cover_image: "https://example.com/kalesh.jpg",
      website_url: "https://thekalesh.com",
    });
    assert.equal(check.valid, true);
  });
});

test("Work & Products System - Store Operations & Seed Integrity", async (t) => {
  await t.test("returns public payload with all 4 seeded featured projects", () => {
    const payload = workStore.getPublicPayload();
    assert.ok(payload.projects.length >= 4);
    assert.ok(payload.stats.totalWork >= 2);
    assert.ok(payload.stats.totalProducts >= 2);
  });

  await t.test("retrieves Rudra Tours & Travels by slug with correct category and link", () => {
    const proj = workStore.getProjectBySlug("rudra-tours-travels");
    assert.ok(proj !== null);
    assert.equal(proj?.type, "work");
    assert.equal(proj?.category, "Travel · Website");
    assert.equal(proj?.website_url, "https://toursbyrudra.com");
    assert.ok(proj?.gallery_images.length >= 3);
    assert.ok(proj?.metrics.length >= 3);
  });

  await t.test("retrieves Kalesh by slug with product type", () => {
    const proj = workStore.getProjectBySlug("kalesh");
    assert.ok(proj !== null);
    assert.equal(proj?.type, "product");
    assert.equal(proj?.category, "Social Platform · Website");
    assert.equal(proj?.website_url, "https://thekalesh.com");
  });

  await t.test("retrieves Karyon by slug with product type", () => {
    const proj = workStore.getProjectBySlug("karyon");
    assert.ok(proj !== null);
    assert.equal(proj?.type, "product");
    assert.equal(proj?.category, "Home Services · Web App");
    assert.equal(proj?.website_url, "https://karyon.app");
  });

  await t.test("retrieves AxisCon by slug with work type", () => {
    const proj = workStore.getProjectBySlug("axiscon");
    assert.ok(proj !== null);
    assert.equal(proj?.type, "work");
    assert.equal(proj?.category, "Conference · Website");
    assert.equal(proj?.website_url, "https://axiscon.netlify.app/");
  });

  await t.test("creates, updates, and deletes case study in store", () => {
    const input: ProjectInput = {
      title: "Fintech Autonomous Ledger",
      slug: "fintech-ledger",
      type: "work",
      category: "Fintech · Platform",
      tagline: "High-Frequency Reconciliation Engine",
      overview: "Autonomous ledger reconciliation processing $50M daily transactions with sub-millisecond settlement.",
      challenge: "Manual ledger disputes and slow batch settlement were causing merchant churn.",
      solution: "Engineered distributed streaming ledger pipelines with immutable cryptographic audit trails.",
      outcome: "Dispute resolution time dropped from 48 hours to under 30 seconds with 99.999% uptime.",
      cover_image: "https://example.com/fintech.jpg",
      website_url: "https://fintech-demo.com",
      tech_stack: ["Rust", "TypeScript", "PostgreSQL", "Kafka"],
      metrics: [{ label: "Settlement Speed", value: "< 30ms" }],
      order_index: 99,
      is_featured: false,
      is_active: true,
    };

    const created = workStore.saveProject(input);
    assert.ok(created.id);
    assert.equal(created.title, "Fintech Autonomous Ledger");

    const fetched = workStore.getProjectBySlug("fintech-ledger");
    assert.ok(fetched !== null);
    assert.equal(fetched?.title, "Fintech Autonomous Ledger");

    // Update
    const updated = workStore.saveProject({
      ...input,
      id: created.id,
      title: "Fintech Autonomous Ledger v2",
    });
    assert.equal(updated.title, "Fintech Autonomous Ledger v2");

    // Delete
    const deleted = workStore.deleteProject(created.id);
    assert.equal(deleted, true);

    const notFoundAfterDelete = workStore.getProjectBySlug("fintech-ledger");
    assert.equal(notFoundAfterDelete, null);
  });
});
