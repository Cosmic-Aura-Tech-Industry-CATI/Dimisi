/**
 * DIMISI Technologies — Blog Functions (Express Backend Integration)
 * Primary data source: Live Express / MongoDB Backend APIs.
 * Secondary fallback: In-memory blogStore for offline resilience.
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
import {
  getPublicActiveBlogsApi,
  getAllAdminBlogsApi,
  getBlogByIdApi,
  createBlogApi,
  updateBlogApi,
  deleteBlogApi,
  toggleBlogActiveApi,
  setBlogFeaturedApi,
  getBlogConfigApi,
  updateBlogConfigApi,
} from "@/services/blog.service";
import {
  getAllBlogCategoriesApi,
  createBlogCategoryApi,
  updateBlogCategoryApi,
  deleteBlogCategoryApi,
  isMongoId,
} from "@/services/blogCategory.service";

/**
 * 1. GET PUBLIC BLOG DATA
 * Fetches published blogs, categories, and public config for /blog.
 */
export async function getPublicBlogData(): Promise<PublicBlogPayload> {
  try {
    const [postsRes, categoriesRes, configRes] = await Promise.allSettled([
      getPublicActiveBlogsApi(),
      getAllBlogCategoriesApi(),
      getBlogConfigApi(),
    ]);

    let posts: BlogPostItem[] = [];
    if (postsRes.status === "fulfilled" && Array.isArray(postsRes.value)) {
      posts = postsRes.value;
    } else {
      posts = blogStore.getPublishedPosts();
    }

    let categories: BlogCategoryItem[] = [];
    if (categoriesRes.status === "fulfilled" && Array.isArray(categoriesRes.value)) {
      categories = categoriesRes.value;
    } else {
      categories = blogStore.getCategoryItems();
    }

    let config: BlogConfig;
    if (configRes.status === "fulfilled" && configRes.value) {
      config = configRes.value;
    } else {
      config = blogStore.getConfig();
    }

    const activePosts = posts.filter((p) => p.status === "published");
    const featuredPost =
      activePosts.find((p) => p.is_featured) || activePosts[0] || null;

    const categoryNames = Array.from(
      new Set(categories.filter((c) => c.status === "active").map((c) => c.name)),
    );

    // Compute stats
    const totalPosts = activePosts.length;
    const totalCategories = categoryNames.length;
    const avgMinutes =
      totalPosts > 0
        ? Math.round(
            activePosts.reduce((acc, p) => {
              const parsed = parseInt(p.reading_time, 10);
              return acc + (isNaN(parsed) ? 5 : parsed);
            }, 0) / totalPosts,
          )
        : 5;

    const latestPost = activePosts[0];
    const latestPublishedDate = latestPost
      ? new Date(latestPost.published_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "August 2026";

    return {
      config,
      featured_post: featuredPost,
      posts: activePosts,
      categories: categoryNames,
      categoryItems: categories,
      stats: {
        totalPosts,
        totalCategories,
        avgReadingTime: `${avgMinutes} min avg`,
        latestPublishedDate,
      },
    };
  } catch (err) {
    console.warn("getPublicBlogData encountered an error, using local fallback:", err);
    return blogStore.getPublicPayload();
  }
}

/**
 * 2. GET BLOG POST BY SLUG
 * Resolves a single published blog by slug for /blog/$slug.
 */
export async function getBlogPostBySlug({
  data,
}: {
  data: { slug: string };
}): Promise<BlogPostItem | null> {
  if (!data?.slug) return null;

  try {
    const posts = await getPublicActiveBlogsApi();
    if (Array.isArray(posts) && posts.length > 0) {
      const found = posts.find(
        (p) => p.slug.toLowerCase() === data.slug.toLowerCase(),
      );
      if (found) return found;
    }
  } catch (err) {
    console.warn(`Could not fetch live blog for slug '${data.slug}':`, err);
  }

  // Graceful fallback to local store
  return blogStore.getPostBySlug(data.slug);
}

/**
 * 3. GET ADMIN BLOG DATA
 * Fetches all blog articles (active & drafts), category catalog, and config for Admin Panel.
 */
export async function getAdminBlogData(): Promise<{
  posts: BlogPostItem[];
  config: BlogConfig;
  categories: string[];
  categoryItems: BlogCategoryItem[];
  categoryCounts: Record<string, number>;
  stats: PublicBlogPayload["stats"];
}> {
  try {
    const [postsRes, categoriesRes, configRes] = await Promise.allSettled([
      getAllAdminBlogsApi(),
      getAllBlogCategoriesApi(),
      getBlogConfigApi(),
    ]);

    let posts: BlogPostItem[] = [];
    if (postsRes.status === "fulfilled" && Array.isArray(postsRes.value)) {
      posts = postsRes.value;
    } else {
      posts = blogStore.getAllPosts();
    }

    let categories: BlogCategoryItem[] = [];
    if (categoriesRes.status === "fulfilled" && Array.isArray(categoriesRes.value)) {
      categories = categoriesRes.value;
    } else {
      categories = blogStore.getCategoryItems();
    }

    let config: BlogConfig;
    if (configRes.status === "fulfilled" && configRes.value) {
      config = configRes.value;
    } else {
      config = blogStore.getConfig();
    }

    const categoryNames = Array.from(new Set(categories.map((c) => c.name)));

    const categoryCounts: Record<string, number> = {};
    for (const post of posts) {
      const cat = post.category || "General";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    const totalPosts = posts.length;
    const totalCategories = categoryNames.length;
    const avgMinutes =
      totalPosts > 0
        ? Math.round(
            posts.reduce((acc, p) => {
              const parsed = parseInt(p.reading_time, 10);
              return acc + (isNaN(parsed) ? 5 : parsed);
            }, 0) / totalPosts,
          )
        : 5;

    const latestPost = posts[0];
    const latestPublishedDate = latestPost
      ? new Date(latestPost.published_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "August 2026";

    return {
      posts,
      config,
      categories: categoryNames,
      categoryItems: categories,
      categoryCounts,
      stats: {
        totalPosts,
        totalCategories,
        avgReadingTime: `${avgMinutes} min avg`,
        latestPublishedDate,
      },
    };
  } catch (err) {
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
}

/**
 * 4. GET BLOG CATEGORIES (ADMIN)
 */
export async function getBlogCategoriesFn(): Promise<{
  categories: BlogCategoryItem[];
  categoryCounts: Record<string, number>;
}> {
  try {
    const categories = await getAllBlogCategoriesApi();
    const finalCats = Array.isArray(categories)
      ? categories
      : blogStore.getCategoryItems();
    const posts = await getAllAdminBlogsApi().catch(() => []);
    const finalPosts = Array.isArray(posts) ? posts : blogStore.getAllPosts();

    const categoryCounts: Record<string, number> = {};
    for (const post of finalPosts) {
      const cat = post.category || "General";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    return {
      categories: finalCats,
      categoryCounts,
    };
  } catch {
    return {
      categories: blogStore.getCategoryItems(),
      categoryCounts: blogStore.getCategoryPostCounts(),
    };
  }
}

/**
 * 5. SAVE BLOG CATEGORY (CREATE / UPDATE)
 */
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

    let saved: BlogCategoryItem;

    if (data.id && isMongoId(data.id)) {
      saved = await updateBlogCategoryApi(data.id, {
        name: data.name,
        description: data.description,
        displayOrder: data.order_index,
        status: data.status,
      });
    } else {
      saved = await createBlogCategoryApi({
        name: data.name,
        description: data.description,
        displayOrder: data.order_index || 1,
        status: data.status || "active",
      });
    }

    // Update local cache
    blogStore.saveCategory({
      id: saved.id,
      name: saved.name,
      slug: saved.slug,
      description: saved.description,
      status: saved.status,
      order_index: saved.order_index,
    });

    return { success: true, category: saved };
  } catch (err) {
    console.error("saveBlogCategoryFn failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save category to database.",
    };
  }
}

/**
 * 6. DELETE BLOG CATEGORY
 */
export async function deleteBlogCategoryFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; postCount: number; error?: string }> {
  try {
    if (!data?.id) return { success: false, postCount: 0, error: "Category ID is required." };

    if (isMongoId(data.id)) {
      await deleteBlogCategoryApi(data.id);
    }

    const res = blogStore.deleteCategory(data.id);
    return { success: true, postCount: res.postCount };
  } catch (err) {
    console.error("deleteBlogCategoryFn failed:", err);
    return {
      success: false,
      postCount: 0,
      error: err instanceof Error ? err.message : "Failed to delete category from database.",
    };
  }
}

/**
 * 7. SAVE BLOG POST (CREATE / UPDATE WITH COVER IMAGE FILE)
 */
export async function saveBlogPostFn({
  data,
  coverImageFile,
}: {
  data: BlogPostInput;
  coverImageFile?: File | null;
}): Promise<{ success: boolean; post?: BlogPostItem; error?: string }> {
  try {
    const validation = validateBlogPostInput(data);
    if (!validation.valid) {
      return { success: false, error: validation.error || "Validation failed." };
    }

    let saved: BlogPostItem;

    if (data.id && isMongoId(data.id)) {
      saved = await updateBlogApi(data.id, data, coverImageFile);
    } else {
      saved = await createBlogApi(data, coverImageFile);
    }

    // Sync local cache
    blogStore.savePost({
      ...data,
      id: saved.id,
      slug: saved.slug,
      cover_image: saved.cover_image,
      author_name: saved.author_name,
      author_role: saved.author_role,
      published_at: saved.published_at,
    });

    return { success: true, post: saved };
  } catch (err) {
    console.error("saveBlogPostFn failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save blog post to database.",
    };
  }
}

/**
 * 8. DELETE BLOG POST
 */
export async function deleteBlogPostFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!data?.id) return { success: false, error: "Post ID is required." };

    if (isMongoId(data.id)) {
      await deleteBlogApi(data.id);
    }

    blogStore.deletePost(data.id);
    return { success: true };
  } catch (err) {
    console.error("deleteBlogPostFn failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete post from database.",
    };
  }
}

/**
 * 9. TOGGLE BLOG ACTIVE STATUS (PUBLISH / DRAFT)
 */
export async function toggleBlogActiveFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; post?: BlogPostItem; error?: string }> {
  try {
    if (!data?.id) return { success: false, error: "Post ID is required." };

    if (isMongoId(data.id)) {
      const updated = await toggleBlogActiveApi(data.id);
      blogStore.savePost({
        ...updated,
      });
      return { success: true, post: updated };
    }

    return { success: false, error: "Invalid blog ID." };
  } catch (err) {
    console.error("toggleBlogActiveFn failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle blog status.",
    };
  }
}

/**
 * 10. SET BLOG AS FEATURED SPOTLIGHT
 */
export async function setBlogFeaturedFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; post?: BlogPostItem; error?: string }> {
  try {
    if (!data?.id) return { success: false, error: "Post ID is required." };

    if (isMongoId(data.id)) {
      try {
        const updated = await setBlogFeaturedApi(data.id);
        blogStore.savePost({
          ...updated,
        });
        return { success: true, post: updated };
      } catch (apiErr) {
        console.warn("Set featured API failed, updating locally:", apiErr);
      }
    }

    // Local fallback
    const post = blogStore.getPostById(data.id);
    if (!post) return { success: false, error: "Post not found." };
    const updated = blogStore.savePost({ ...post, is_featured: !post.is_featured });
    return { success: true, post: updated };
  } catch (err) {
    console.error("setBlogFeaturedFn failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to set featured.",
    };
  }
}

/**
 * 11. SAVE BLOG CONFIG (HERO & NOTICE BANNER)
 */
export async function saveBlogConfigFn({
  data,
}: {
  data: { config: Partial<BlogConfig>; categories?: string[] };
}): Promise<{ success: boolean; config: BlogConfig; error?: string }> {
  try {
    let updated: BlogConfig | null = null;
    try {
      updated = await updateBlogConfigApi(data.config);
    } catch (apiErr) {
      console.warn("Save blog config API failed, saving locally:", apiErr);
    }

    if (data.categories) {
      blogStore.updateCategories(data.categories);
    }
    const localConfig = blogStore.updateConfig(data.config);

    return { success: true, config: updated || localConfig };
  } catch (err) {
    console.error("saveBlogConfigFn failed:", err);
    return {
      success: false,
      config: blogStore.getConfig(),
      error: err instanceof Error ? err.message : "Failed to save blog configuration.",
    };
  }
}
