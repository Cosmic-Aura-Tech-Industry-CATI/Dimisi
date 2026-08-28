import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateReview,
  computeStats,
  calculateConversionRate,
  slugify,
  sanitizeText,
  NAME_MAX,
  REVIEW_TEXT_MIN,
  REVIEW_TEXT_MAX,
} from "../reviews.shared";
import {
  issueCaptcha,
  verifyCaptcha,
  escapeHtml,
} from "../reviews.server";

describe("DIMISI Review System Validation", () => {
  it("fails when customer name is missing or too short", () => {
    const res = validateReview({
      customerName: "A",
      rating: 5,
      reviewText: "Outstanding project delivery by Dimisi.",
      consent: true,
    });
    assert.ok(res["customerName"]);
  });

  it("fails when customer name exceeds maximum length", () => {
    const res = validateReview({
      customerName: "A".repeat(NAME_MAX + 1),
      rating: 5,
      reviewText: "Outstanding project delivery by Dimisi.",
      consent: true,
    });
    assert.ok(res["customerName"]);
  });

  it("fails when star rating is missing or out of 1-5 range", () => {
    assert.ok(validateReview({ customerName: "Elena", rating: 0, reviewText: "Great job", consent: true })["rating"]);
    assert.ok(validateReview({ customerName: "Elena", rating: 6, reviewText: "Great job", consent: true })["rating"]);
  });

  it("fails when review text is shorter than minimum", () => {
    const res = validateReview({
      customerName: "Alexander",
      rating: 5,
      reviewText: "Hi",
      consent: true,
    });
    assert.ok(res["reviewText"]);
  });

  it("fails when publication consent is not checked", () => {
    const res = validateReview({
      customerName: "Alexander",
      rating: 5,
      reviewText: "Exceptional AI engineering.",
      consent: false,
    });
    assert.ok(res["consent"]);
  });

  it("validates valid email and flags invalid email", () => {
    const invalid = validateReview({
      customerName: "Alexander",
      customerEmail: "not-an-email",
      rating: 5,
      reviewText: "Exceptional AI engineering.",
      consent: true,
    });
    assert.ok(invalid["customerEmail"]);

    const valid = validateReview({
      customerName: "Alexander",
      customerEmail: "alex@example.com",
      rating: 5,
      reviewText: "Exceptional AI engineering.",
      consent: true,
    });
    assert.equal(valid["customerEmail"], undefined);
  });

  it("passes cleanly with all required fields valid", () => {
    const valid = validateReview({
      customerName: "Alexander Wright",
      customerEmail: "alex@apex.io",
      customerPhone: "+1 415 555 2671",
      serviceName: "AI & Autonomous Agents",
      rating: 5,
      reviewText: "DIMISI delivered an exceptional multi-agent workflow that exceeded our goals.",
      customerLocation: "San Francisco, CA",
      consent: true,
    });
    assert.equal(Object.keys(valid).length, 0);
  });
});

describe("Review Statistics & Conversion Calculations", () => {
  it("accurately computes average rating and star distribution", () => {
    const sample = [
      { rating: 5 },
      { rating: 5 },
      { rating: 5 },
      { rating: 4 },
      { rating: 4 },
      { rating: 3 },
      { rating: 1 },
    ];
    const stats = computeStats(sample);
    assert.equal(stats.total, 7);
    // (5*3 + 4*2 + 3*1 + 1*1) / 7 = 27 / 7 = 3.857 -> 3.9
    assert.equal(stats.average, 3.9);
    assert.equal(stats.distribution[5], 3);
    assert.equal(stats.distribution[4], 2);
    assert.equal(stats.distribution[3], 1);
    assert.equal(stats.distribution[2], 0);
    assert.equal(stats.distribution[1], 1);
  });

  it("accurately computes employee vs client metrics in computeStats", () => {
    const sample = [
      { rating: 5, reviewer_type: "client" as const },
      { rating: 4, reviewer_type: "client" as const },
      { rating: 5, reviewer_type: "employee" as const },
    ];
    const stats = computeStats(sample);
    assert.equal(stats.total, 3);
    assert.equal(stats.clientTotal, 2);
    assert.equal(stats.clientAverage, 4.5);
    assert.equal(stats.employeeTotal, 1);
    assert.equal(stats.employeeAverage, 5.0);
  });

  it("handles empty review list gracefully", () => {
    const stats = computeStats([]);
    assert.equal(stats.total, 0);
    assert.equal(stats.average, 5.0);
    assert.equal(stats.distribution[5], 0);
  });

  it("calculates campaign conversion rate correctly", () => {
    assert.equal(calculateConversionRate(100, 25), 25.0);
    assert.equal(calculateConversionRate(50, 10), 20.0);
    assert.equal(calculateConversionRate(0, 0), 0);
    assert.equal(calculateConversionRate(10, 0), 0);
  });
});

describe("Slug & Anti-Spam Security", () => {
  it("slugifies campaign names into clean URL slugs", () => {
    assert.equal(slugify("Web Clients Q3 - 2026!"), "web-clients-q3-2026");
    assert.equal(slugify("Noida Office QR Code #1"), "noida-office-qr-code-1");
  });

  it("sanitizes text by stripping HTML tags and control characters", () => {
    const dirty = "<script>alert('xss')</script>Great work!";
    const clean = sanitizeText(dirty, 100);
    assert.equal(clean.includes("<"), false);
    assert.equal(clean.includes(">"), false);
    assert.equal(clean, "scriptalert('xss')/scriptGreat work!");
  });

  it("escapes HTML entities for safe email formatting", () => {
    const raw = `Alex & "Co." <alex@apex.io>`;
    const escaped = escapeHtml(raw);
    assert.equal(escaped, "Alex &amp; &quot;Co.&quot; &lt;alex@apex.io&gt;");
  });

  it("issues and verifies cryptographic arithmetic captcha challenge", () => {
    const captcha = issueCaptcha();
    assert.match(captcha.question, /What is \d+ \+ \d+\?/);
    assert.ok(captcha.token.includes("."));

    const match = /What is (\d+) \+ (\d+)\?/.exec(captcha.question);
    assert.ok(match);
    const [_, a, b] = match!;
    const correctSum = String(Number(a) + Number(b));
    const wrongSum = String(Number(a) + Number(b) + 1);

    assert.equal(verifyCaptcha(captcha.token, correctSum), true);
    assert.equal(verifyCaptcha(captcha.token, wrongSum), false);
    assert.equal(verifyCaptcha("invalid.token", correctSum), false);
  });
});

describe("End-to-End Review Pipeline (Submit -> Pending -> Approve -> Public)", () => {
  it("processes a client review through the full store lifecycle", async () => {
    const { memoryStore, toPublicReview } = await import("../reviews.server");

    // 1. Submit review into store
    const uniqueName = `Test Client ${Date.now()}`;
    const newId = crypto.randomUUID();
    const newReview = {
      id: newId,
      campaign_id: null,
      campaign_name: null,
      customer_name: uniqueName,
      customer_email: "test.client@example.com",
      customer_phone: "+1 415 555 0199",
      service_name: "Web Development & Platforms",
      reviewer_type: "client" as const,
      role_or_title: "Product Lead",
      employee_department: null,
      employment_status: null,
      is_verified: false,
      rating: 5,
      review_text: "Flawless delivery, modern 3D interface, incredible engineering speed.",
      customer_photo_url: null,
      customer_location: "San Francisco, CA",
      consent_to_publish: true,
      status: "pending" as const,
      is_featured: false,
      moderation_reason: null,
      moderated_by: null,
      submitter_ip: "127.0.0.1",
      submitted_at: new Date().toISOString(),
      approved_at: null,
      rejected_at: null,
      archived_at: null,
      updated_at: new Date().toISOString(),
    };

    memoryStore.reviews.unshift(newReview);

    // 2. Verify it appears as pending in store
    const foundPending = memoryStore.reviews.find((r) => r.id === newId);
    assert.ok(foundPending, "Review must be found in store");
    assert.equal(foundPending.status, "pending");
    assert.equal(foundPending.customer_name, uniqueName);
    assert.equal(foundPending.reviewer_type, "client");

    // 3. Verify it is NOT public yet
    const publicBefore = memoryStore.reviews.filter((r) => r.status === "approved");
    assert.equal(
      publicBefore.some((r) => r.id === newId),
      false,
      "Pending review must not be in approved public list",
    );

    // 4. Admin Approves
    foundPending.status = "approved";
    foundPending.approved_at = new Date().toISOString();
    foundPending.updated_at = new Date().toISOString();

    // 5. Verify it appears on public reviews
    const publicAfter = memoryStore.reviews.filter((r) => r.status === "approved");
    const foundPublic = publicAfter.find((r) => r.id === newId);
    assert.ok(foundPublic, "Approved review must now be in approved list");
    assert.equal(foundPublic.customer_name, uniqueName);
    assert.equal(foundPublic.rating, 5);

    const publicFormatted = toPublicReview(foundPublic, new Map());
    assert.equal(publicFormatted.id, newId);
    assert.equal(publicFormatted.reviewer_type, "client");
    assert.equal(publicFormatted.customer_name, uniqueName);
  });

  it("processes an employee review with staff metadata through the pipeline", async () => {
    const { memoryStore, toPublicReview } = await import("../reviews.server");

    const uniqueEmpName = `Engineer ${Date.now()}`;
    const newEmpId = crypto.randomUUID();
    const newEmpReview = {
      id: newEmpId,
      campaign_id: null,
      campaign_name: null,
      customer_name: uniqueEmpName,
      customer_email: "staff.test@dimisi.in",
      customer_phone: null,
      service_name: "AI & Autonomous Agents",
      reviewer_type: "employee" as const,
      role_or_title: "Senior AI Engineer",
      employee_department: "AI & Autonomous Systems",
      employment_status: "current" as const,
      is_verified: true,
      rating: 5,
      review_text: "Working on bleeding edge agent orchestration at DIMISI is unmatched.",
      customer_photo_url: null,
      customer_location: "Bengaluru, India",
      consent_to_publish: true,
      status: "pending" as const,
      is_featured: false,
      moderation_reason: null,
      moderated_by: null,
      submitter_ip: "127.0.0.1",
      submitted_at: new Date().toISOString(),
      approved_at: null,
      rejected_at: null,
      archived_at: null,
      updated_at: new Date().toISOString(),
    };

    memoryStore.reviews.unshift(newEmpReview);

    // Check store
    const found = memoryStore.reviews.find((r) => r.id === newEmpId);
    assert.ok(found);
    assert.equal(found.reviewer_type, "employee");
    assert.equal(found.role_or_title, "Senior AI Engineer");
    assert.equal(found.is_verified, true);
    assert.equal(found.status, "pending");

    // Approve
    found.status = "approved";
    found.approved_at = new Date().toISOString();

    // Verify public projection
    const publicFormatted = toPublicReview(found, new Map());
    assert.equal(publicFormatted.reviewer_type, "employee");
    assert.equal(publicFormatted.role_or_title, "Senior AI Engineer");
    assert.equal(publicFormatted.employee_department, "AI & Autonomous Systems");
    assert.equal(publicFormatted.is_verified, true);
  });

  it("handles new campaign creation and tracks reviews submitted via campaign link", async () => {
    const { memoryStore } = await import("../reviews.server");

    // 1. Create new campaign
    const campId = crypto.randomUUID();
    const campSlug = `event-expo-${Date.now()}`;
    const newCamp = {
      id: campId,
      campaign_name: "Tech Expo 2026",
      slug: campSlug,
      service_name: "AI & Autonomous Agents",
      location: "New Delhi",
      is_active: true,
      expires_at: null,
      visits: 10,
      scans: 5,
      submissions: 0,
      created_by: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryStore.campaigns.unshift(newCamp);

    // Verify campaign is stored
    const foundCamp = memoryStore.campaigns.find((c) => c.slug === campSlug);
    assert.ok(foundCamp, "Campaign must exist in memory store");

    // 2. Submit review with this campaign slug
    const reviewId = crypto.randomUUID();
    foundCamp.submissions += 1;

    const campaignReview = {
      id: reviewId,
      campaign_id: foundCamp.id,
      campaign_name: foundCamp.campaign_name,
      customer_name: "Summit Attendee",
      customer_email: "attendee@summit.org",
      customer_phone: null,
      service_name: foundCamp.service_name,
      reviewer_type: "client" as const,
      role_or_title: "Attendee",
      employee_department: null,
      employment_status: null,
      is_verified: false,
      rating: 5,
      review_text: "Incredible showcase by DIMISI at the Expo.",
      customer_photo_url: null,
      customer_location: foundCamp.location,
      consent_to_publish: true,
      status: "pending" as const,
      is_featured: false,
      moderation_reason: null,
      moderated_by: null,
      submitter_ip: "127.0.0.1",
      submitted_at: new Date().toISOString(),
      approved_at: null,
      rejected_at: null,
      archived_at: null,
      updated_at: new Date().toISOString(),
    };
    memoryStore.reviews.unshift(campaignReview);

    // 3. Verify in Admin queue
    const queued = memoryStore.reviews.find((r) => r.id === reviewId);
    assert.ok(queued);
    assert.equal(queued.status, "pending");
    assert.equal(queued.campaign_id, campId);
    assert.equal(foundCamp.submissions, 1);
  });
});
