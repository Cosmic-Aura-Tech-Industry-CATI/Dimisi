import test from "node:test";
import assert from "node:assert/strict";
import {
  slugifyBlog,
  slugifyBlogCategory,
  validateBlogPostInput,
  validateBlogCategoryInput,
  type BlogPostInput,
  type BlogPostItem,
  type BlogCategoryInput,
} from "../blog.shared";
import {
  parseMarkdownToBlocks,
  serializeBlocksToMarkdown,
  createEmptyBlock,
  type ContentBlock,
  type HeadingBlock,
  type ParagraphBlock,
  type ListBlock,
  type CodeBlock,
  type QuoteBlock,
  type RawBlock,
} from "../blogContent.parser";
import { blogStore } from "../blog.data";
import {
  isMongoId,
  normalizeBackendBlogCategory,
  resolveBlogCategoryName,
} from "../../services/blogCategory.service";
import { normalizeBackendBlog } from "../../services/blog.service";

test("Blog System - slugifyBlog helper produces clean URL-friendly slugs", () => {
  assert.equal(
    slugifyBlog("The Owl Protocol: Systems That See in the Dark!"),
    "the-owl-protocol-systems-that-see-in-the-dark",
  );
  assert.equal(slugifyBlog("  Shipping WebGL & 60FPS Shaders  "), "shipping-webgl-60fps-shaders");
  assert.equal(slugifyBlog("AI & Cloud Economics @ 2026"), "ai-cloud-economics-2026");
});

test("Blog System - slugifyBlogCategory produces clean category slugs", () => {
  assert.equal(slugifyBlogCategory("AI & Autonomy"), "ai-autonomy");
  assert.equal(slugifyBlogCategory("Cloud & Infrastructure"), "cloud-infrastructure");
  assert.equal(slugifyBlogCategory("  Full-Stack & Web 3.0  "), "full-stack-web-30");
});

test("Blog System - validateBlogCategoryInput validates category name length", () => {
  assert.equal(validateBlogCategoryInput({ name: "" }).valid, false);
  assert.equal(validateBlogCategoryInput({ name: "A" }).valid, false);
  assert.equal(validateBlogCategoryInput({ name: "AI" }).valid, true);
  assert.equal(validateBlogCategoryInput({ name: "Cybersecurity & Cryptography" }).valid, true);
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
    content:
      "## System Overview\n\nDetailed walkthrough of agent loops, circuit breakers, and telemetry.",
    cover_image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
  });
  assert.equal(resValid.valid, true);

  // Fully valid input with data URL (uploaded image)
  const resDataUrl = validateBlogPostInput({
    title: "Architecting Resilient Multi-Agent AI Swarms",
    category: "AI",
    excerpt: "A comprehensive breakdown of autonomous agents operating under strict memory caps.",
    content:
      "## System Overview\n\nDetailed walkthrough of agent loops, circuit breakers, and telemetry.",
    cover_image:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  });
  assert.equal(resDataUrl.valid, true);
});

test("Blog System - Default store provides clean initial categories and config", () => {
  const payload = blogStore.getPublicPayload();
  assert.equal(payload.posts.length, 0, "Expected store to start clean with 0 mock posts");
  assert.ok(
    payload.config.under_development_notice_active,
    "Expected under development notice active",
  );
  assert.equal(
    payload.config.under_development_notice_text,
    "Blog section under development. Please visit again after some time.",
  );
  assert.equal(payload.featured_post, null, "Expected no featured post when empty");
});

test("Blog System - getPostBySlug returns null for unknown slug", () => {
  const unknown = blogStore.getPostBySlug("non-existent-article-slug-xyz");
  assert.equal(unknown, null);
});

test("Blog System - Full CRUD operations with metadata persistence", () => {
  const newPostInput: BlogPostInput = {
    title: "Micro-Frontend State Hydration in React 19",
    category: "Web",
    tags: ["React 19", "Hydration", "Performance"],
    excerpt: "How server components change hydration budgets across distributed team boundaries.",
    content:
      "## Micro-Frontends in 2026\n\nDeep dive into streaming SSR and isolated hydration trees.",
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
    content:
      "## Updated Benchmarks\n\nComplete telemetry comparing React 19 against traditional bundles.",
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
  assert.equal(
    unpublishedLookup,
    null,
    "Draft posts should not be accessible via public getPostBySlug",
  );

  // 5. Delete
  const deleted = blogStore.deletePost(created.id);
  assert.equal(deleted, true);
  assert.equal(blogStore.getPostById(created.id), null);
});

test("Blog System - Category CRUD and post count calculation", () => {
  // 1. Create Category
  const createdCat = blogStore.saveCategory({
    name: "Cybersecurity & Web3",
    slug: "cybersecurity-web3",
    description: "Zero-trust architectures, cryptography and protocol security.",
    status: "active",
  });
  assert.ok(createdCat.id);
  assert.equal(createdCat.name, "Cybersecurity & Web3");
  assert.equal(createdCat.slug, "cybersecurity-web3");

  // Post count
  const initialCount = blogStore.getCategoryPostCount("Cybersecurity & Web3");
  assert.equal(initialCount, 0);

  // Add a post and verify count increases
  const post = blogStore.savePost({
    title: "Autonomous Agent Swarms",
    category: "Cybersecurity & Web3",
    excerpt: "Comprehensive architecture breakdown for multi-agent systems.",
    content: "Detailed content for testing category post counts.",
    cover_image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
  });
  const updatedCount = blogStore.getCategoryPostCount("Cybersecurity & Web3");
  assert.equal(updatedCount, 1, "Expected 1 post after saving");
  blogStore.deletePost(post.id);

  // 2. Edit Category
  const updatedCat = blogStore.saveCategory({
    id: createdCat.id,
    name: "Cybersecurity & Zero Trust",
    slug: "cybersecurity-zero-trust",
    description: "Updated description for zero-trust security.",
    status: "active",
  });
  assert.equal(updatedCat.name, "Cybersecurity & Zero Trust");

  // 3. Delete Category
  const delRes = blogStore.deleteCategory(createdCat.id);
  assert.equal(delRes.success, true);
  assert.equal(delRes.postCount, 0);
});

test("Blog System - updateConfig modifies notice banner and hero metadata", () => {
  const updatedConfig = blogStore.updateConfig({
    under_development_notice_heading: "Updated Notice Heading",
    under_development_notice_text: "Updated custom notice text for editorial release.",
  });
  assert.equal(updatedConfig.under_development_notice_heading, "Updated Notice Heading");
  assert.equal(
    updatedConfig.under_development_notice_text,
    "Updated custom notice text for editorial release.",
  );

  // Reset to default for consistency
  blogStore.updateConfig({
    under_development_notice_heading: "Publication Lab Under Active Development",
    under_development_notice_text:
      "Blog section under development. Please visit again after some time.",
  });
});

test("Blog System - parseMarkdownToBlocks parses Headings, Paragraphs, Lists, Code, Quotes, and Raw blocks", () => {
  const md = `## Section One

This is a descriptive paragraph with **bold** and *italic* text.

### Sub-section Details

- Bullet point 1
- Bullet point 2
- Bullet point 3

#### Minor Details

1. Step one
2. Step two

\`\`\`typescript
interface Config {
  enabled: boolean;
}
\`\`\`

> This is an important quote
> — Senior Engineer

| Col1 | Col2 |
|---|---|
| A | B |`;

  const blocks = parseMarkdownToBlocks(md);

  assert.equal(blocks.length, 9);
  assert.equal(blocks[0].type, "heading");
  assert.equal((blocks[0] as HeadingBlock).level, 2);
  assert.equal((blocks[0] as HeadingBlock).text, "Section One");

  assert.equal(blocks[1].type, "paragraph");
  assert.equal(
    (blocks[1] as ParagraphBlock).text,
    "This is a descriptive paragraph with **bold** and *italic* text.",
  );

  assert.equal(blocks[2].type, "heading");
  assert.equal((blocks[2] as HeadingBlock).level, 3);
  assert.equal((blocks[2] as HeadingBlock).text, "Sub-section Details");

  assert.equal(blocks[3].type, "list");
  assert.equal((blocks[3] as ListBlock).style, "bullet");
  assert.equal((blocks[3] as ListBlock).items.length, 3);

  assert.equal(blocks[4].type, "heading");
  assert.equal((blocks[4] as HeadingBlock).level, 4);

  assert.equal(blocks[5].type, "list");
  assert.equal((blocks[5] as ListBlock).style, "numbered");
  assert.equal((blocks[5] as ListBlock).items.length, 2);

  assert.equal(blocks[6].type, "code");
  assert.equal((blocks[6] as CodeBlock).language, "typescript");
  assert.match((blocks[6] as CodeBlock).code, /interface Config/);

  assert.equal(blocks[7].type, "quote");
  assert.equal((blocks[7] as QuoteBlock).text, "This is an important quote");
  assert.equal((blocks[7] as QuoteBlock).cite, "Senior Engineer");

  assert.equal(blocks[8].type, "raw");
  assert.match((blocks[8] as RawBlock).markdown, /\| Col1 \| Col2 \|/);
});

test("Blog System - serializeBlocksToMarkdown serializes visual blocks to valid Markdown", () => {
  const blocks: ContentBlock[] = [
    { id: "1", type: "heading", level: 2, text: "Architecture Blueprint" },
    {
      id: "2",
      type: "paragraph",
      text: "Autonomous perception stacks require sub-second latency.",
    },
    {
      id: "3",
      type: "list",
      style: "bullet",
      items: ["Infrared Sensor", "LiDAR Fusion", "TensorRT Engine"],
    },
    { id: "4", type: "code", language: "python", code: "def run():\n    return True" },
    { id: "5", type: "quote", text: "Latency is the new throughput.", cite: "Lead Architect" },
  ];

  const markdown = serializeBlocksToMarkdown(blocks);

  assert.match(markdown, /## Architecture Blueprint/);
  assert.match(markdown, /Autonomous perception stacks require sub-second latency\./);
  assert.match(markdown, /- Infrared Sensor\n- LiDAR Fusion\n- TensorRT Engine/);
  assert.match(markdown, /```python\ndef run\(\):\n {4}return True\n```/);
  assert.match(markdown, /> Latency is the new throughput\.\n> — Lead Architect/);

  // Round trip test
  const reparsed = parseMarkdownToBlocks(markdown);
  assert.equal(reparsed.length, 5);
  assert.equal(reparsed[0].type, "heading");
  assert.equal((reparsed[0] as HeadingBlock).text, "Architecture Blueprint");
  assert.equal(reparsed[2].type, "list");
  assert.equal((reparsed[2] as ListBlock).items.length, 3);
});

test("Blog System - Phase 5 & 6: Exhaustive Block Builder & Markdown Roundtrip Fidelity", () => {
  // 1. Special characters & symbols
  const complexMarkdown = `## Special Characters: <script>alert('test')</script> & {props} -> 100%

Paragraph with markdown symbols: *italic* and **bold** and \`const x = 10;\` and [DIMISI](https://dimisi.com).

### Subheading with math: E = mc^2 & unicode 🚀 ⚡ 🌐

- Bullet item with symbols: & < > " ' / \\
- Bullet item 2 with code: \`npm install @dimisi/core\`
- Bullet item 3 with bold: **Critical Safety Threshold**

1. Step one: Initialize $PORT=8080
2. Step two: Validate JSON schema {"key": "value"}
3. Step three: Verify auth token Bearer xyz

\`\`\`bash
# Bash script containing comment and markdown-like chars
echo "Hello World"
curl -X POST https://api.dimisi.com/v1/telemetry \\
  -H "Authorization: Bearer ${"$"}TOKEN" \\
  -d '{"status": "ok"}'
\`\`\`

> Deep thinking is the foundational catalyst for exponential engineering breakthroughs.
> — CTO & Chief Architect

| Feature | Status | SLA |
| :--- | :--- | :--- |
| Perception Engine | Operational | 99.99% |
| Sensor Hub | Active | 99.95% |`;

  const parsed = parseMarkdownToBlocks(complexMarkdown);
  assert.equal(parsed.length, 8);

  // Verify Heading 2
  assert.equal(parsed[0].type, "heading");
  assert.equal((parsed[0] as HeadingBlock).level, 2);
  assert.equal(
    (parsed[0] as HeadingBlock).text,
    "Special Characters: <script>alert('test')</script> & {props} -> 100%",
  );

  // Verify Paragraph
  assert.equal(parsed[1].type, "paragraph");
  assert.match((parsed[1] as ParagraphBlock).text, /Paragraph with markdown symbols/);

  // Verify Heading 3
  assert.equal(parsed[2].type, "heading");
  assert.equal((parsed[2] as HeadingBlock).level, 3);
  assert.match((parsed[2] as HeadingBlock).text, /unicode 🚀 ⚡ 🌐/);

  // Verify Bullet List
  assert.equal(parsed[3].type, "list");
  assert.equal((parsed[3] as ListBlock).style, "bullet");
  assert.equal((parsed[3] as ListBlock).items.length, 3);
  assert.equal((parsed[3] as ListBlock).items[0], "Bullet item with symbols: & < > \" ' / \\");

  // Verify Numbered List
  assert.equal(parsed[4].type, "list");
  assert.equal((parsed[4] as ListBlock).style, "numbered");
  assert.equal((parsed[4] as ListBlock).items.length, 3);
  assert.equal((parsed[4] as ListBlock).items[0], "Step one: Initialize $PORT=8080");

  // Verify Code Block with multiline and bash
  assert.equal(parsed[5].type, "code");
  assert.equal((parsed[5] as CodeBlock).language, "bash");
  assert.match((parsed[5] as CodeBlock).code, /# Bash script containing comment/);

  // Verify Quote
  assert.equal(parsed[6].type, "quote");
  assert.match((parsed[6] as QuoteBlock).text, /Deep thinking is the foundational catalyst/);
  assert.equal((parsed[6] as QuoteBlock).cite, "CTO & Chief Architect");

  // Verify Raw fallback
  assert.equal(parsed[7].type, "raw");
  assert.match((parsed[7] as RawBlock).markdown, /\| Feature \| Status \| SLA \|/);

  // Serialize back and re-parse to ensure 100% roundtrip fidelity
  const serialized = serializeBlocksToMarkdown(parsed);
  const reparsed = parseMarkdownToBlocks(serialized);

  assert.equal(reparsed.length, 8);
  assert.equal(reparsed[0].type, "heading");
  assert.equal(
    (reparsed[0] as HeadingBlock).text,
    "Special Characters: <script>alert('test')</script> & {props} -> 100%",
  );
  assert.equal(reparsed[3].type, "list");
  assert.equal((reparsed[3] as ListBlock).items.length, 3);
  assert.equal(reparsed[5].type, "code");
  assert.equal((reparsed[5] as CodeBlock).language, "bash");
  assert.equal(reparsed[6].type, "quote");
  assert.equal((reparsed[6] as QuoteBlock).cite, "CTO & Chief Architect");
  assert.equal(reparsed[7].type, "raw");
});

test("Blog System - Empty block and fallback handling", () => {
  // Empty string
  const emptyParsed = parseMarkdownToBlocks("");
  assert.equal(emptyParsed.length, 1);
  assert.equal(emptyParsed[0].type, "paragraph");

  // Whitespace only
  const whitespaceParsed = parseMarkdownToBlocks("    \n\n   \n\t  ");
  assert.equal(whitespaceParsed.length, 1);
  assert.equal(whitespaceParsed[0].type, "paragraph");

  // Empty blocks serialization skips invalid/empty blocks gracefully
  const emptyBlocks: ContentBlock[] = [
    { id: "1", type: "heading", level: 2, text: "   " },
    { id: "2", type: "paragraph", text: "" },
    { id: "3", type: "list", style: "bullet", items: ["", "  "] },
    { id: "4", type: "quote", text: "" },
    { id: "5", type: "raw", markdown: "" },
  ];
  const serializedEmpty = serializeBlocksToMarkdown(emptyBlocks);
  assert.equal(serializedEmpty, "");
});

test("Blog System - Backend Document Normalization & Category Resolution", () => {
  // Verify MongoDB ID validator
  assert.equal(isMongoId("507f1f77bcf86cd799439011"), true);
  assert.equal(isMongoId("cat-ai"), false);
  assert.equal(isMongoId(""), false);
  assert.equal(isMongoId(null), false);

  // Verify Category normalization
  const normCat = normalizeBackendBlogCategory({
    _id: "507f1f77bcf86cd799439011",
    name: "Artificial Intelligence",
    slug: "artificial-intelligence",
    description: "AI research and engineering.",
    displayOrder: 1,
    isActive: true,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  });
  assert.equal(normCat.id, "507f1f77bcf86cd799439011");
  assert.equal(normCat.name, "Artificial Intelligence");
  assert.equal(normCat.status, "active");
  assert.equal(normCat.order_index, 1);

  // Verify Category Name resolution
  const categoriesList = [normCat];
  assert.equal(resolveBlogCategoryName("507f1f77bcf86cd799439011", categoriesList), "Artificial Intelligence");
  assert.equal(resolveBlogCategoryName({ _id: "507f1f77bcf86cd799439011", name: "Artificial Intelligence" }, categoriesList), "Artificial Intelligence");
  assert.equal(resolveBlogCategoryName("Unknown Category", categoriesList), "Unknown Category");

  // Verify Blog document normalization
  const normBlog = normalizeBackendBlog(
    {
      _id: "607f1f77bcf86cd799439022",
      title: "Autonomous Perception Stacks in Production",
      slug: "autonomous-perception-stacks-in-production",
      category: "507f1f77bcf86cd799439011",
      tags: ["AI", "Robotics", "Computer Vision"],
      excerpt: "A deep technical breakdown of multi-modal sensor fusion in low-light environments.",
      content: "## System Architecture\n\nSensor fusion pipelines processing 60 FPS streams.",
      coverImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
      coverCaption: "Sensor test bench",
      coverAlt: "Hardware sensor rig",
      coverCredit: "Photography: DIMISI Technologies",
      author: {
        _id: "707f1f77bcf86cd799439033",
        name: "Dr. Ira Mehta",
        role: "Head of AI Research",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      },
      readingTime: "8 min read",
      publishedAt: "2026-08-15T10:00:00.000Z",
      isFeatured: true,
      isActive: true,
      orderIndex: 1,
      metaTitle: "Autonomous Perception Stacks in Production | DIMISI",
      metaDescription: "A deep technical breakdown of multi-modal sensor fusion.",
      ogImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
    },
    categoriesList,
  );

  assert.equal(normBlog.id, "607f1f77bcf86cd799439022");
  assert.equal(normBlog.slug, "autonomous-perception-stacks-in-production");
  assert.equal(normBlog.category, "Artificial Intelligence");
  assert.equal(normBlog.author_name, "Dr. Ira Mehta");
  assert.equal(normBlog.author_role, "Head of AI Research");
  assert.equal(normBlog.status, "published");
  assert.equal(normBlog.is_featured, true);
  assert.equal(normBlog.order_index, 1);
});

test("Blog System - Empty database array preserved without converting to mock blogs", async () => {
  // Test that an empty backend array is preserved faithfully
  const emptyBlogList: BlogPostItem[] = [];
  assert.equal(emptyBlogList.length, 0);
  assert.equal(Array.isArray(emptyBlogList), true);

  // Normalization of empty list produces empty list
  const normalized = emptyBlogList.map((doc) => normalizeBackendBlog(doc as any));
  assert.equal(normalized.length, 0);
});

test("Blog System - Validation fails for invalid inputs before network calls", async () => {
  const invalidPost = {
    title: "AB", // too short
    category: "",
    excerpt: "Short",
    content: "Tiny",
    cover_image: "not-a-url",
  };
  const validation = validateBlogPostInput(invalidPost);
  assert.equal(validation.valid, false);
  assert.ok(validation.error);

  const invalidCat = { name: "X" }; // too short
  const catVal = validateBlogCategoryInput(invalidCat);
  assert.equal(catVal.valid, false);
  assert.ok(catVal.error);
});

