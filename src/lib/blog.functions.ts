/**
 * DIMISI Technologies — Client-Side Blog Functions
 * Pure client-side implementation backed by in-memory and local data.
 */
import { blogStore } from "./blog.data";
import {
  type BlogPostItem,
  type BlogPostInput,
  type BlogCategoryItem,
  type BlogCategoryInput,
  type BlogConfig,
  type PublicBlogPayload,
  validateBlogPostInput,
  validateBlogCategoryInput,
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
  categoryItems: BlogCategoryItem[];
  categoryCounts: Record<string, number>;
  stats: PublicBlogPayload["stats"];
}> {
  const payload = blogStore.getPublicPayload();
  const all = blogStore.getAllPosts();
  const categoryItems = blogStore.getCategoryItems();
  const categoryCounts = blogStore.getCategoryPostCounts();
  return {
    posts: all,
    config: payload.config,
    categories: payload.categories,
    categoryItems,
    categoryCounts,
    stats: payload.stats,
  };
}

export async function getBlogCategoriesFn(): Promise<{
  categories: BlogCategoryItem[];
  categoryCounts: Record<string, number>;
}> {
  return {
    categories: blogStore.getCategoryItems(),
    categoryCounts: blogStore.getCategoryPostCounts(),
  };
}

export async function saveBlogCategoryFn({
  data,
}: {
  data: BlogCategoryInput;
}): Promise<{ success: boolean; category?: BlogCategoryItem; error?: string }> {
  try {
    const validation = validateBlogCategoryInput(data);
    if (!validation.valid) {
      return { success: false, error: validation.error || "Category validation failed." };
    }
    const saved = blogStore.saveCategory(data);
    return { success: true, category: saved };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save category.",
    };
  }
}

export async function deleteBlogCategoryFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; postCount: number; error?: string }> {
  try {
    if (!data?.id) return { success: false, postCount: 0, error: "Category ID is required." };
    const res = blogStore.deleteCategory(data.id);
    return res;
  } catch (err) {
    return {
      success: false,
      postCount: 0,
      error: err instanceof Error ? err.message : "Failed to delete category.",
    };
  }
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
