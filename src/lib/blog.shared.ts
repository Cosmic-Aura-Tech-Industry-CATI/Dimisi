/**
 * Shared types, interfaces, slugification, and validation for
 * DIMISI Blog & Editorial Publication System.
 */

export type BlogStatus = "published" | "draft" | "archived";

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  category: string; // e.g. "Web", "Mobile", "AI", "Cloud", "Startups", "Technology Trends"
  tags: string[];
  excerpt: string;
  content: string; // Rich article markdown or structured text
  cover_image: string;
  cover_caption?: string | undefined;
  cover_alt?: string | undefined;
  cover_credit?: string | undefined;
  author_name: string;
  author_role?: string | undefined;
  author_avatar?: string | undefined;
  reading_time: string; // e.g. "7 min read"
  published_at: string;
  is_featured: boolean;
  status: BlogStatus;
  meta_title?: string | undefined;
  meta_description?: string | undefined;
  og_image?: string | undefined;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPostInput {
  id?: string | undefined;
  title: string;
  slug?: string | undefined;
  category: string;
  tags?: string[] | undefined;
  excerpt: string;
  content: string;
  cover_image: string;
  cover_caption?: string | undefined;
  cover_alt?: string | undefined;
  cover_credit?: string | undefined;
  author_name?: string | undefined;
  author_role?: string | undefined;
  author_avatar?: string | undefined;
  reading_time?: string | undefined;
  published_at?: string | undefined;
  is_featured?: boolean | undefined;
  status?: BlogStatus | undefined;
  meta_title?: string | undefined;
  meta_description?: string | undefined;
  og_image?: string | undefined;
  order_index?: number | undefined;
}

export interface BlogConfig {
  hero_eyebrow: string;
  hero_heading: string;
  hero_subline: string;
  under_development_notice_active: boolean;
  under_development_notice_heading: string;
  under_development_notice_text: string;
}

export interface PublicBlogPayload {
  config: BlogConfig;
  featured_post: BlogPostItem | null;
  posts: BlogPostItem[];
  categories: string[];
  stats: {
    totalPosts: number;
    totalCategories: number;
    avgReadingTime: string;
    latestPublishedDate: string;
  };
}

/**
 * Creates URL-safe slugs from article titles.
 */
export function slugifyBlog(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Validates blog post inputs.
 */
export function validateBlogPostInput(input: Partial<BlogPostInput>): {
  valid: boolean;
  error?: string;
  field?: string;
} {
  const title = input.title?.trim() || "";
  const category = input.category?.trim() || "";
  const excerpt = input.excerpt?.trim() || "";
  const content = input.content?.trim() || "";
  const coverImage = input.cover_image?.trim() || "";

  if (title.length < 3) {
    return { valid: false, error: "Blog post title must be at least 3 characters long.", field: "title" };
  }
  if (category.length < 2) {
    return { valid: false, error: "Category is required.", field: "category" };
  }
  if (excerpt.length < 10) {
    return { valid: false, error: "Excerpt must be at least 10 characters long.", field: "excerpt" };
  }
  if (content.length < 20) {
    return { valid: false, error: "Article content must be at least 20 characters long.", field: "content" };
  }
  if (!coverImage || (!coverImage.startsWith("http://") && !coverImage.startsWith("https://") && !coverImage.startsWith("data:image/"))) {
    return { valid: false, error: "A valid cover image is required (URL or uploaded file).", field: "cover_image" };
  }

  return { valid: true };
}
