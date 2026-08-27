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

  it("handles empty review list gracefully", () => {
    const stats = computeStats([]);
    assert.equal(stats.total, 0);
    assert.equal(stats.average, 0);
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
