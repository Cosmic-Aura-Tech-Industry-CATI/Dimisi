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

test("Work & Products System - Store Operations & Live Data Sync", async (t) => {
  await t.test("accepts dynamic project list and computes stats correctly", () => {
    workStore.setProjects([
      {
        id: "test-1",
        slug: "test-work-1",
        title: "Test Work 1",
        type: "work",
        category: "Web Application",
        overview: "Overview text describing work 1 in detail.",
        challenge: "Challenge text describing work 1 in detail.",
        solution: "Solution text describing work 1 in detail.",
        outcome: "Outcome text describing work 1 in detail.",
        cover_image: "https://example.com/cover1.jpg",
        gallery_images: [],
        website_url: "https://example.com",
        tech_stack: ["React", "TypeScript"],
        metrics: [{ label: "Speed", value: "2x" }],
        order_index: 1,
        is_featured: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "test-2",
        slug: "test-prod-1",
        title: "Test Product 1",
        type: "product",
        category: "SaaS Platform",
        overview: "Overview text describing product 1 in detail.",
        challenge: "Challenge text describing product 1 in detail.",
        solution: "Solution text describing product 1 in detail.",
        outcome: "Outcome text describing product 1 in detail.",
        cover_image: "https://example.com/cover2.jpg",
        gallery_images: [],
        website_url: "https://product.example.com",
        tech_stack: ["Node.js", "PostgreSQL"],
        metrics: [{ label: "Uptime", value: "99.9%" }],
        order_index: 2,
        is_featured: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    const payload = workStore.getPublicPayload();
    assert.equal(payload.projects.length, 2);
    assert.equal(payload.stats.totalProjects, 2);
    assert.equal(payload.stats.totalWork, 1);
    assert.equal(payload.stats.totalProducts, 1);

    const workItem = workStore.getProjectBySlug("test-work-1");
    assert.ok(workItem !== null);
    assert.equal(workItem?.type, "work");

    const prodItem = workStore.getProjectBySlug("test-prod-1");
    assert.ok(prodItem !== null);
    assert.equal(prodItem?.type, "product");
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
