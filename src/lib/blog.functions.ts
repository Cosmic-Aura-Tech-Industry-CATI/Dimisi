/**
 * DIMISI Technologies — Client-Side Blog Functions
 * Pure client-side implementation backed by in-memory and local data.
 */
import { blogStore } from "./blog.data";
import {
  type BlogPostItem,
  type BlogPostInput,
  type BlogConfig,
  type PublicBlogPayload,
  validateBlogPostInput,
} from "./blog.shared";

export async function getPublicBlogData(): Promise<PublicBlogPayload> {
  return blogStore.getPublicPayload();
}

export async function getBlogPostBySlug({
  data,
}: {
  data: { slug: string };
}): Promise<BlogPostItem | null> {
  if (!data?.slug) return null;
  return blogStore.getPostBySlug(data.slug);
}

export async function getAdminBlogData(): Promise<{
  posts: BlogPostItem[];
  config: BlogConfig;
  categories: string[];
  stats: PublicBlogPayload["stats"];
}> {
  const payload = blogStore.getPublicPayload();
  const all = blogStore.getAllPosts();
  return {
    posts: all,
    config: payload.config,
    categories: payload.categories,
    stats: payload.stats,
  };
}

export async function saveBlogPostFn({
  data,
}: {
  data: BlogPostInput;
}): Promise<{ success: boolean; post?: BlogPostItem; error?: string }> {
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
}

export async function deleteBlogPostFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; error?: string }> {
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
}

export async function saveBlogConfigFn({
  data,
}: {
  data: { config: Partial<BlogConfig>; categories?: string[] };
}): Promise<{ success: boolean; config: BlogConfig }> {
  const updated = blogStore.updateConfig(data.config);
  if (data.categories) {
    blogStore.updateCategories(data.categories);
  }
  return { success: true, config: updated };
}
