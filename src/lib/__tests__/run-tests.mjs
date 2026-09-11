import test from "node:test";
import assert from "node:assert/strict";
import {
  validateReview,
  computeStats,
  calculateConversionRate,
  slugify,
  sanitizeText,
  NAME_MAX,
} from "../reviews.shared.ts";
import {
  issueCaptcha,
  verifyCaptcha,
  escapeHtml,
} from "../reviews.data.ts";

test("Customer Review Validation", async (t) => {
  await t.test("fails on empty or short name", () => {
    const err = validateReview({ customerName: "A", rating: 5, reviewText: "Valid text here", consent: true });
    assert.ok(err.customerName, "Should have error on customerName");
  });

  await t.test("fails when rating is out of 1-5", () => {
    const err = validateReview({ customerName: "Alex", rating: 0, reviewText: "Valid text here", consent: true });
    assert.ok(err.rating, "Should have error on rating 0");
  });

  await t.test("fails when consent is false", () => {
    const err = validateReview({ customerName: "Alex", rating: 5, reviewText: "Valid text here", consent: false });
    assert.ok(err.consent, "Should have error on consent false");
  });

  await t.test("validates valid submission successfully", () => {
    const err = validateReview({
      customerName: "Alexander Wright",
      customerEmail: "alex@apex.io",
      customerPhone: "+1 415 555 1234",
      serviceName: "AI & Autonomous Agents",
      rating: 5,
      reviewText: "Exceptional architecture and delivery by DIMISI team.",
      customerLocation: "San Francisco, CA",
      consent: true,
    });
    assert.equal(Object.keys(err).length, 0);
  });
});

test("Review Stats & Analytics Formulae", async (t) => {
  await t.test("computes distribution and average correctly", () => {
    const sample = [{ rating: 5 }, { rating: 5 }, { rating: 4 }, { rating: 3 }];
    const stats = computeStats(sample);
    assert.equal(stats.total, 4);
    assert.equal(stats.average, 4.3);
    assert.equal(stats.distribution[5], 2);
    assert.equal(stats.distribution[4], 1);
    assert.equal(stats.distribution[3], 1);
  });

  await t.test("calculates conversion rate", () => {
    assert.equal(calculateConversionRate(100, 20), 20);
    assert.equal(calculateConversionRate(0, 0), 0);
  });
});

test("Slug, Anti-Spam Captcha, and XSS Sanitization", async (t) => {
  await t.test("slugifies strings", () => {
    assert.equal(slugify("Summer Campaign 2026!"), "summer-campaign-2026");
  });

  await t.test("sanitizes HTML tags", () => {
    const clean = sanitizeText("<script>alert('xss')</script>Hello", 50);
    assert.equal(clean.includes("<"), false);
    assert.equal(clean.includes(">"), false);
  });

  await t.test("escapes HTML for emails", () => {
    assert.equal(escapeHtml(`<b>"Test"</b> & 'More'`), "&lt;b&gt;&quot;Test&quot;&lt;/b&gt; &amp; &#39;More&#39;");
  });

  await t.test("issues and verifies arithmetic challenge", () => {
    const cap = issueCaptcha();
    assert.match(cap.question, /What is \d+ \+ \d+\?/);
    const m = /What is (\d+) \+ (\d+)\?/.exec(cap.question);
    const answer = String(Number(m[1]) + Number(m[2]));
    assert.equal(verifyCaptcha(cap.token, answer), true);
    assert.equal(verifyCaptcha(cap.token, "9999"), false);
  });
});
