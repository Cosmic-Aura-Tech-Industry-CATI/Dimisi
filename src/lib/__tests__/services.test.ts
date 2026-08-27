import test from "node:test";
import assert from "node:assert/strict";
import {
  slugifyService,
  validateServiceInput,
  type ServiceInput,
  type IndustryInput,
} from "../services.shared";
import { servicesStore } from "../services.server";

test("Services System - Slugification", async (t) => {
  await t.test("creates clean URL slugs from service titles", () => {
    assert.equal(slugifyService("Web Development & Architecture"), "web-development-architecture");
    assert.equal(slugifyService("  AI & Autonomous Agents!  "), "ai-autonomous-agents");
    assert.equal(slugifyService("UI/UX Design & 3D Experiences"), "uiux-design-3d-experiences");
  });
});

test("Services System - Validation", async (t) => {
  await t.test("rejects service when title is too short", () => {
    const check = validateServiceInput({
      title: "Ab",
      summary: "Valid summary description for testing.",
      hero_image: "https://example.com/hero.jpg",
      what_is_it: "Valid what is it description.",
      category: "Engineering",
      tagline: "Tagline",
      related_images: [],
      who_is_for: "Founders",
      problem_solved: "Bottlenecks",
      why_it_matters: "ROI",
      features: [],
      process_steps: [],
      benefits: [],
      faqs: [],
      tech_stack: [],
    });
    assert.equal(check.valid, false);
    assert.match(check.error || "", /title must be at least 3 characters/i);
    assert.equal(check.field, "title");
  });

  await t.test("rejects service when hero image is missing", () => {
    const check = validateServiceInput({
      title: "Valid Service Title",
      summary: "Valid summary description for testing.",
      hero_image: "",
      what_is_it: "Valid what is it description.",
      category: "Engineering",
      tagline: "Tagline",
      related_images: [],
      who_is_for: "Founders",
      problem_solved: "Bottlenecks",
      why_it_matters: "ROI",
      features: [],
      process_steps: [],
      benefits: [],
      faqs: [],
      tech_stack: [],
    });
    assert.equal(check.valid, false);
    assert.match(check.error || "", /primary service image is required/i);
    assert.equal(check.field, "hero_image");
  });

  await t.test("accepts valid service payload and falls back to summary for what_is_it if left blank", () => {
    const check = validateServiceInput({
      title: "Quantum AI Architecture",
      summary: "Building post-quantum artificial intelligence workflows with sub-second latency.",
      hero_image: "https://example.com/hero.jpg",
      what_is_it: "", // left blank, should intelligently fallback to summary
      category: "Autonomous Systems",
      tagline: "Quantum speed",
      related_images: [],
      who_is_for: "Enterprise Research",
      problem_solved: "Compute bounds",
      why_it_matters: "Exponential speedup",
      features: ["Quantum Algorithms", "Error Mitigation"],
      process_steps: [],
      benefits: [],
      faqs: [],
      tech_stack: ["Qiskit", "Python"],
    });
    assert.equal(check.valid, true);
  });
});

test("Services System - Store Operations & Slug Lookup", async (t) => {
  await t.test("returns public payload with all 11 core services and 8 industries", () => {
    const payload = servicesStore.getPublicPayload();
    assert.ok(payload.services.length >= 11);
    assert.equal(payload.industries.length, 8);
    assert.ok(payload.stats.totalServices >= 11);
    assert.ok(payload.stats.totalIndustries === 8);
  });

  await t.test("retrieves service by slug", () => {
    const web = servicesStore.getServiceBySlug("web-development");
    assert.ok(web !== null);
    assert.equal(web?.title, "Web Development");
    assert.ok(web?.process_steps.length >= 6);
    assert.ok(web?.benefits.length >= 6);
    assert.ok(web?.faqs.length >= 4);

    const ai = servicesStore.getServiceBySlug("ai");
    assert.ok(ai !== null);
    assert.equal(ai?.title, "AI & Automation");
  });

  await t.test("creates, updates, and deletes service", () => {
    const newService: ServiceInput = {
      title: "Blockchain & Smart Contracts",
      slug: "blockchain",
      category: "Web3 Engineering",
      tagline: "Decentralized trust",
      summary: "Audited smart contracts and DeFi liquidity protocols.",
      hero_image: "https://example.com/blockchain.jpg",
      related_images: [
        { url: "https://example.com/chain1.jpg", caption: "Smart contract audit" },
      ],
      what_is_it: "EVM and Solana smart contracts with zero vulnerabilities.",
      who_is_for: "Fintechs and Web3 protocols",
      problem_solved: "Security exploits and slow settlement",
      why_it_matters: "Trustless verifiable execution",
      features: ["EVM Solidity", "Solana Rust", "Formal Verification"],
      process_steps: [
        { step: "01", title: "Architecture", description: "Protocol tokenomics modeling." },
      ],
      benefits: [
        { title: "Zero Exploits", description: "Mathematically proven contracts.", metric: "100% Secure" },
      ],
      faqs: [
        { question: "Are contracts audited?", answer: "Yes, 3-tier external audit." },
      ],
      tech_stack: ["Solidity", "Rust", "Hardhat"],
      order_index: 99,
      is_featured: false,
      is_active: true,
    };

    const created = servicesStore.saveService(newService);
    assert.ok(created.id);
    assert.equal(created.title, "Blockchain & Smart Contracts");
    assert.equal(created.slug, "blockchain");

    // Lookup
    const fetched = servicesStore.getServiceBySlug("blockchain");
    assert.ok(fetched !== null);
    assert.equal(fetched?.title, "Blockchain & Smart Contracts");

    // Update
    const updated = servicesStore.saveService({
      ...newService,
      id: created.id,
      title: "Blockchain & DeFi Infrastructure",
    });
    assert.equal(updated.title, "Blockchain & DeFi Infrastructure");

    // Delete
    const deleted = servicesStore.deleteService(created.id);
    assert.equal(deleted, true);

    const notFoundAfterDelete = servicesStore.getServiceBySlug("blockchain");
    assert.equal(notFoundAfterDelete, null);
  });
});
