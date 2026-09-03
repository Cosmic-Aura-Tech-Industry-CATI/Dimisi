import test from "node:test";
import assert from "node:assert/strict";
import {
  slugifyBlog,
  validateBlogPostInput,
  type BlogPostInput,
  type BlogPostItem,
} from "../blog.shared";
import { blogStore } from "../blog.data";

test("Blog System - slugifyBlog helper produces clean URL-friendly slugs", () => {
  assert.equal(
    slugifyBlog("The Owl Protocol: Systems That See in the Dark!"),
    "the-owl-protocol-systems-that-see-in-the-dark"
  );
  assert.equal(
    slugifyBlog("  Shipping WebGL & 60FPS Shaders  "),
    "shipping-webgl-60fps-shaders"
  );
  assert.equal(slugifyBlog("AI & Cloud Economics @ 2026"), "ai-cloud-economics-2026");
});

test("Blog System - validateBlogPostInput validates title, category, excerpt, content, and cover", () => {
  // Title missing
  const res1 = validateBlogPostInput({
    title: "",
    category: "AI",
    excerpt: "A valid excerpt with enough length.",
    content: "Valid content body that is at least twenty characters long.",
    cover_image: "https://images.unsplash.com/photo-1",
  });
  assert.equal(res1.valid, false);
  assert.match(res1.error || "", /title must be at least 3 characters/i);
  assert.equal(res1.field, "title");

  // Excerpt too short
  const res2 = validateBlogPostInput({
    title: "Valid Title",
    category: "AI",
    excerpt: "Short",
    content: "Valid content body that is at least twenty characters long.",
    cover_image: "https://images.unsplash.com/photo-1",
  });
  assert.equal(res2.valid, false);
  assert.match(res2.error || "", /excerpt must be at least 10 characters/i);
  assert.equal(res2.field, "excerpt");

  // Invalid cover image URL
  const res3 = validateBlogPostInput({
    title: "Valid Title",
    category: "AI",
    excerpt: "A valid excerpt with enough length.",
    content: "Valid content body that is at least twenty characters long.",
    cover_image: "invalid-url",
  });
  assert.equal(res3.valid, false);
  assert.match(res3.error || "", /valid cover image/i);
  assert.equal(res3.field, "cover_image");

  // Fully valid input with standard URL
  const resValid = validateBlogPostInput({
    title: "Architecting Resilient Multi-Agent AI Swarms",
    category: "AI",
    excerpt: "A comprehensive breakdown of autonomous agents operating under strict memory caps.",
    content: "## System Overview\n\nDetailed walkthrough of agent loops, circuit breakers, and telemetry.",
    cover_image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
  });
  assert.equal(resValid.valid, true);

  // Fully valid input with data URL (uploaded image)
  const resDataUrl = validateBlogPostInput({
    title: "Architecting Resilient Multi-Agent AI Swarms",
    category: "AI",
    excerpt: "A comprehensive breakdown of autonomous agents operating under strict memory caps.",
    content: "## System Overview\n\nDetailed walkthrough of agent loops, circuit breakers, and telemetry.",
    cover_image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  });
  assert.equal(resDataUrl.valid, true);
});

test("Blog System - Default store provides initial published articles and categories", () => {
  const payload = blogStore.getPublicPayload();
  assert.ok(payload.posts.length >= 3, "Expected at least 3 seeded posts");
  assert.ok(payload.categories.includes("AI"), "Expected AI category");
  assert.ok(payload.categories.includes("Web"), "Expected Web category");
  assert.ok(payload.categories.includes("Cloud"), "Expected Cloud category");
  assert.ok(payload.config.under_development_notice_active, "Expected under development notice active");
  assert.equal(
    payload.config.under_development_notice_text,
    "Blog section under development. Please visit again after some time."
  );
  assert.ok(payload.featured_post !== null, "Expected a featured post");
});

test("Blog System - getPostBySlug retrieves valid published post and returns null for unknown slug", () => {
  const owlPost = blogStore.getPostBySlug("owl-protocol");
  assert.ok(owlPost !== null, "Expected owl-protocol article to exist");
  assert.equal(owlPost.category, "AI");

  const unknown = blogStore.getPostBySlug("non-existent-article-slug-xyz");
  assert.equal(unknown, null);
});

test("Blog System - Full CRUD operations with metadata persistence", () => {
  const newPostInput: BlogPostInput = {
    title: "Micro-Frontend State Hydration in React 19",
    category: "Web",
    tags: ["React 19", "Hydration", "Performance"],
    excerpt: "How server components change hydration budgets across distributed team boundaries.",
    content: "## Micro-Frontends in 2026\n\nDeep dive into streaming SSR and isolated hydration trees.",
    cover_image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    cover_caption: "Hydration telemetry benchmark graph",
    cover_alt: "Hydration tree diagram",
    cover_credit: "Photography: DIMISI Technologies",
    author_name: "Kabir Rao",
    reading_time: "5 min read",
    status: "published",
    is_featured: false,
    order_index: 99,
  };

  // 1. Create
  const created = blogStore.savePost(newPostInput);
  assert.ok(created.id, "Expected created post to have an ID");
  assert.equal(created.title, "Micro-Frontend State Hydration in React 19");
  assert.equal(created.slug, "micro-frontend-state-hydration-in-react-19");
  assert.equal(created.cover_alt, "Hydration tree diagram");
  assert.equal(created.cover_credit, "Photography: DIMISI Technologies");

  // 2. Read
  const fetched = blogStore.getPostById(created.id);
  assert.ok(fetched !== null);
  assert.equal(fetched.category, "Web");

  // 3. Edit (Update title & make featured)
  const updated = blogStore.savePost({
    id: created.id,
    title: "Micro-Frontend State Hydration in React 19: Second Edition",
    category: "Web",
    excerpt: "Updated deep dive into streaming SSR and isolated hydration trees with benchmarks.",
    content: "## Updated Benchmarks\n\nComplete telemetry comparing React 19 against traditional bundles.",
    cover_image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    is_featured: true,
  });
  assert.equal(updated.title, "Micro-Frontend State Hydration in React 19: Second Edition");
  assert.equal(updated.is_featured, true);

  // Verify featured spotlight in public payload
  const publicPayload = blogStore.getPublicPayload();
  assert.equal(publicPayload.featured_post?.id, created.id);

  // 4. Draft Toggle (Unpublish)
  blogStore.savePost({
    id: created.id,
    title: updated.title,
    category: updated.category,
    excerpt: updated.excerpt,
    content: updated.content,
    cover_image: updated.cover_image,
    status: "draft",
  });
  const unpublishedLookup = blogStore.getPostBySlug(updated.slug);
  assert.equal(unpublishedLookup, null, "Draft posts should not be accessible via public getPostBySlug");

  // 5. Delete
  const deleted = blogStore.deletePost(created.id);
  assert.equal(deleted, true);
  assert.equal(blogStore.getPostById(created.id), null);
});

test("Blog System - updateConfig modifies notice banner and hero metadata", () => {
  const updatedConfig = blogStore.updateConfig({
    under_development_notice_heading: "Updated Notice Heading",
    under_development_notice_text: "Updated custom notice text for editorial release.",
  });
  assert.equal(updatedConfig.under_development_notice_heading, "Updated Notice Heading");
  assert.equal(updatedConfig.under_development_notice_text, "Updated custom notice text for editorial release.");

  // Reset to default for consistency
  blogStore.updateConfig({
    under_development_notice_heading: "Publication Lab Under Active Development",
    under_development_notice_text: "Blog section under development. Please visit again after some time.",
  });
});
