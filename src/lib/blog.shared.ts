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
  cover_image_public_id?: string | undefined;
  cover_caption?: string | undefined;
  cover_alt?: string | undefined;
  cover_credit?: string | undefined;
  author_name: string;
  author_id?: string | undefined;
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
  cover_image_public_id?: string | undefined;
  cover_caption?: string | undefined;
  cover_alt?: string | undefined;
  cover_credit?: string | undefined;
  author_name?: string | undefined;
  author_id?: string | undefined;
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

export interface BlogCategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | undefined;
  status: "active" | "inactive";
  order_index: number;
  created_at?: string | undefined;
  updated_at?: string | undefined;
}

export interface BlogCategoryInput {
  id?: string | undefined;
  name: string;
  slug?: string | undefined;
  description?: string | undefined;
  status?: "active" | "inactive" | undefined;
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
  categoryItems?: BlogCategoryItem[] | undefined;
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
 * Creates URL-safe slugs for blog categories.
 */
export function slugifyBlogCategory(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Validates blog category input.
 */
export function validateBlogCategoryInput(input: Partial<BlogCategoryInput>): {
  valid: boolean;
  error?: string;
  field?: string;
} {
  const name = input.name?.trim() || "";
  if (name.length < 2) {
    return {
      valid: false,
      error: "Category name must be at least 2 characters long.",
      field: "name",
    };
  }
  return { valid: true };
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

  const ogImage = input.og_image?.trim() || "";

  if (title.length < 5) {
    return {
      valid: false,
      error: "Blog post title must be at least 5 characters long.",
      field: "title",
    };
  }
  if (title.length > 150) {
    return {
      valid: false,
      error: "Blog post title cannot exceed 150 characters.",
      field: "title",
    };
  }
  if (category.length < 2) {
    return { valid: false, error: "Category is required.", field: "category" };
  }
  if (excerpt.length < 10) {
    return {
      valid: false,
      error: "Excerpt must be at least 10 characters long.",
      field: "excerpt",
    };
  }
  if (excerpt.length > 300) {
    return {
      valid: false,
      error: "Excerpt cannot exceed 300 characters.",
      field: "excerpt",
    };
  }
  if (content.length < 20) {
    return {
      valid: false,
      error: "Article content must be at least 20 characters long.",
      field: "content",
    };
  }
  if (
    coverImage.length > 0 &&
    !coverImage.startsWith("http://") &&
    !coverImage.startsWith("https://") &&
    !coverImage.startsWith("data:image/") &&
    !coverImage.startsWith("blob:")
  ) {
    return {
      valid: false,
      error: "Cover image must be a valid URL, local preview, or uploaded file.",
      field: "cover_image",
    };
  }
  if (
    ogImage.length > 0 &&
    !ogImage.startsWith("http://") &&
    !ogImage.startsWith("https://")
  ) {
    return {
      valid: false,
      error: "OG social sharing image must be a valid URL starting with http:// or https://",
      field: "og_image",
    };
  }

  return { valid: true };
}
