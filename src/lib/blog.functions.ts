import { createServerFn } from "@tanstack/react-start";
import { blogStore } from "./blog.server";
import {
  type BlogPostItem,
  type BlogPostInput,
  type BlogConfig,
  type PublicBlogPayload,
  validateBlogPostInput,
} from "./blog.shared";

/**
 * Public function to fetch published articles, featured post, categories, notice config, and stats.
 */
export const getPublicBlogData = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicBlogPayload> => {
    return blogStore.getPublicPayload();
  }
);

/**
 * Public function to fetch single article details by slug for dynamic route `/blog/$slug`.
 */
export const getBlogPostBySlug = createServerFn({ method: "GET" })
  .validator((d: { slug: string }) => d)
  .handler(async ({ data }): Promise<BlogPostItem | null> => {
    if (!data?.slug) return null;
    return blogStore.getPostBySlug(data.slug);
  });

/**
 * Admin function to fetch all posts (including draft & archived) and configurations.
 */
export const getAdminBlogData = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    posts: BlogPostItem[];
    config: BlogConfig;
    categories: string[];
    stats: PublicBlogPayload["stats"];
  }> => {
    const payload = blogStore.getPublicPayload();
    const all = blogStore.getAllPosts();
    return {
      posts: all,
      config: payload.config,
      categories: payload.categories,
      stats: payload.stats,
    };
  }
);

/**
 * Admin function to create or update a blog post.
 */
export const saveBlogPostFn = createServerFn({ method: "POST" })
  .validator((d: BlogPostInput) => d)
  .handler(async ({ data }): Promise<{ success: boolean; post?: BlogPostItem; error?: string }> => {
    try {
      const validation = validateBlogPostInput(data);
      if (!validation.valid) {
        return { success: false, error: validation.error || "Validation failed." };
      }
      const saved = blogStore.savePost(data);
      return { success: true, post: saved };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to save blog post.",
      };
    }
  });

/**
 * Admin function to delete a blog post.
 */
export const deleteBlogPostFn = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!data?.id) return { success: false, error: "Post ID is required." };
      const ok = blogStore.deletePost(data.id);
      return { success: ok };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete post.",
      };
    }
  });

/**
 * Admin function to update blog configuration and notice settings.
 */
export const saveBlogConfigFn = createServerFn({ method: "POST" })
  .validator((d: { config: Partial<BlogConfig>; categories?: string[] }) => d)
  .handler(async ({ data }): Promise<{ success: boolean; config: BlogConfig }> => {
    const updated = blogStore.updateConfig(data.config);
    if (data.categories) {
      blogStore.updateCategories(data.categories);
    }
    return { success: true, config: updated };
  });
