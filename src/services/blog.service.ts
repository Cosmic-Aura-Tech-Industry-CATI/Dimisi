/**
 * DIMISI Admin & Public — Blog Express API Service
 * Handles Blog listing, retrieval, creation, updates, activation toggle,
 * featured spotlight, deletion, and configuration against the Express backend API
 * (/api/v1/admin-panel/blog/* and /api/v1/config/blog).
 */
import { apiRequest, ApiError, clearApiCache } from "./apiClient";
import type { BlogPostItem, BlogPostInput, BlogCategoryItem, BlogConfig } from "@/lib/blog.shared";
import {
  getAllBlogCategoriesApi,
  resolveBlogCategoryName,
  resolveBlogCategoryIdForPayload,
  isMongoId,
} from "./blogCategory.service";

export interface BackendBlogDoc {
  _id: string;
  title: string;
  slug: string;
  category: string | { _id: string; name: string; slug?: string } | undefined;
  tags?: string[];
  excerpt?: string;
  content: string;
  coverImage?: string;
  coverImagePublicId?: string;
  coverCaption?: string;
  coverAlt?: string;
  coverCredit?: string;
  author?:
    | string
    | {
        _id: string;
        name?: string;
        email?: string;
        role?: string;
        avatar?: string;
      };
  readingTime?: string;
  publishedAt?: string;
  isFeatured: boolean;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  ogIndex?: number;
  orderIndex: number;
  uploadStatus?: string;
  failReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendBlogListResponse {
  status: string;
  blogs: BackendBlogDoc[];
}

export interface BackendBlogSingleResponse {
  status: string;
  message?: string;
  data?: {
    blog: BackendBlogDoc;
  };
  blog?: BackendBlogDoc;
}

export interface BackendBlogConfigResponse {
  status: string;
  data: {
    config: {
      enableNoticeBanner?: boolean;
      noticeBannerHeading?: string;
      noticeBannerDescription?: string;
      heroHeading?: string;
      heroSubline?: string;
    };
  };
}

export const DEFAULT_BLOG_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80";

/**
 * Normalizes backend IBlog document into the clean frontend BlogPostItem model.
 */
export function normalizeBackendBlog(
  doc: BackendBlogDoc | null | undefined,
  categories?: BlogCategoryItem[],
): BlogPostItem {
  if (!doc) {
    return {
      id: "post-" + Date.now().toString(36),
      slug: "untitled-article",
      title: "Untitled Article",
      category: "General",
      tags: [],
      excerpt: "",
      content: "",
      cover_image: DEFAULT_BLOG_FALLBACK_IMAGE,
      author_name: "DIMISI Editorial Team",
      author_role: "Engineering & Research",
      reading_time: "5 min read",
      published_at: new Date().toISOString(),
      is_featured: false,
      status: "draft",
      order_index: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const resolvedCategory = resolveBlogCategoryName(doc.category, categories);
  const rawCover = doc.coverImage?.trim() || "";
  const coverImage = rawCover.length > 0 ? rawCover : DEFAULT_BLOG_FALLBACK_IMAGE;

  // Extract author info safely
  let authorName = "DIMISI Editorial Team";
  let authorRole = "Engineering & Research";
  let authorAvatar: string | undefined = undefined;

  if (doc.author && typeof doc.author === "object") {
    if (doc.author.name?.trim()) authorName = doc.author.name.trim();
    if (doc.author.role?.trim()) authorRole = doc.author.role.trim();
    if (doc.author.avatar?.trim()) authorAvatar = doc.author.avatar.trim();
  }

  const cleanSlug =
    doc.slug ||
    doc.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
    "article";

  return {
    id: String(doc._id),
    slug: cleanSlug,
    title: doc.title || "Untitled Article",
    category: resolvedCategory,
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    excerpt: doc.excerpt || "",
    content: doc.content || "",
    cover_image: coverImage,
    cover_caption: doc.coverCaption || undefined,
    cover_alt: doc.coverAlt || undefined,
    cover_credit: doc.coverCredit || undefined,
    author_name: authorName,
    author_role: authorRole,
    author_avatar: authorAvatar,
    reading_time: doc.readingTime || "5 min read",
    published_at: doc.publishedAt || doc.createdAt || new Date().toISOString(),
    is_featured: Boolean(doc.isFeatured),
    status: doc.isActive !== false ? "published" : "draft",
    meta_title: doc.metaTitle || undefined,
    meta_description: doc.metaDescription || undefined,
    og_image: doc.ogImage || undefined,
    order_index: typeof doc.orderIndex === "number" ? doc.orderIndex : 1,
    created_at: doc.createdAt || new Date().toISOString(),
    updated_at: doc.updatedAt || new Date().toISOString(),
  };
}

/**
 * 1. GET PUBLIC ACTIVE BLOGS
 * Endpoint: GET /api/v1/admin-panel/blog/visitors/all
 * Public / unauthenticated endpoint for public visitors.
 */
export async function getPublicActiveBlogsApi(
  categoryId?: string,
  categories?: BlogCategoryItem[],
): Promise<BlogPostItem[]> {
  try {
    let allCats = categories;
    if (!allCats || allCats.length === 0) {
      try {
        allCats = await getAllBlogCategoriesApi();
      } catch {}
    }

    let url = "/api/v1/admin-panel/blog/visitors/all";
    if (categoryId && categoryId.toLowerCase() !== "all") {
      const resolvedId = await resolveBlogCategoryIdForPayload(categoryId, allCats);
      url += `?category=${encodeURIComponent(resolvedId)}`;
    }

    const res = await apiRequest<BackendBlogListResponse>(url, {
      method: "GET",
      cacheTtlMs: 20000,
    });

    if (Array.isArray(res?.blogs)) {
      return res.blogs.map((doc) => normalizeBackendBlog(doc, allCats));
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * 2. GET ALL ADMIN BLOGS (ADMIN VIEW)
 * Endpoint: GET /api/v1/admin-panel/blog/all
 * Admin JWT protected endpoint returning all active and inactive blogs.
 */
export async function getAllAdminBlogsApi(
  categoryId?: string,
  categories?: BlogCategoryItem[],
): Promise<BlogPostItem[]> {
  try {
    let allCats = categories;
    if (!allCats || allCats.length === 0) {
      try {
        allCats = await getAllBlogCategoriesApi();
      } catch {}
    }

    let url = "/api/v1/admin-panel/blog/all";
    if (categoryId && categoryId.toLowerCase() !== "all") {
      const resolvedId = await resolveBlogCategoryIdForPayload(categoryId, allCats);
      url += `?category=${encodeURIComponent(resolvedId)}`;
    }

    const res = await apiRequest<BackendBlogListResponse>(url, {
      method: "GET",
      cacheTtlMs: 5000,
    });

    if (Array.isArray(res?.blogs)) {
      return res.blogs.map((doc) => normalizeBackendBlog(doc, allCats));
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * 3. GET SINGLE BLOG BY ID
 * Endpoint: GET /api/v1/admin-panel/blog/:id
 */
export async function getBlogByIdApi(
  id: string,
  categories?: BlogCategoryItem[],
): Promise<BlogPostItem> {
  if (!id) throw new Error("Blog ID is required.");

  const res = await apiRequest<BackendBlogSingleResponse>(
    `/api/v1/admin-panel/blog/${encodeURIComponent(id)}`,
    {
      method: "GET",
    },
  );

  const doc = res?.data?.blog || res?.blog;
  if (!doc) {
    throw new Error(res?.message || `Blog '${id}' not found on server.`);
  }

  return normalizeBackendBlog(doc, categories);
}

/**
 * Helper to build FormData or JSON payload for Create / Update operations.
 */
async function buildBlogPayload(
  payload: Partial<BlogPostInput>,
  coverImageFile?: File | null,
  categories?: BlogCategoryItem[],
): Promise<FormData | Record<string, any>> {
  const catId = await resolveBlogCategoryIdForPayload(payload.category, categories);

  const isFilePresent = coverImageFile instanceof File;

  if (isFilePresent) {
    const fd = new FormData();
    if (payload.title) fd.append("title", payload.title.trim());
    fd.append("category", catId);
    if (payload.excerpt !== undefined) fd.append("excerpt", payload.excerpt.trim());
    if (payload.content !== undefined) fd.append("content", payload.content.trim());
    if (coverImageFile) fd.append("coverImage", coverImageFile);
    if (payload.cover_caption !== undefined) fd.append("coverCaption", payload.cover_caption.trim());
    if (payload.cover_alt !== undefined) fd.append("coverAlt", payload.cover_alt.trim());
    if (payload.cover_credit !== undefined) fd.append("coverCredit", payload.cover_credit.trim());
    if (payload.reading_time !== undefined) fd.append("readingTime", payload.reading_time.trim());
    if (payload.order_index !== undefined) fd.append("orderIndex", String(payload.order_index));
    if (payload.is_featured !== undefined) fd.append("isFeatured", String(payload.is_featured));
    if (payload.status !== undefined) {
      fd.append("isActive", String(payload.status === "published"));
    }
    if (payload.meta_title !== undefined) fd.append("metaTitle", payload.meta_title.trim());
    if (payload.meta_description !== undefined) fd.append("metaDescription", payload.meta_description.trim());
    if (payload.og_image !== undefined) fd.append("ogImage", payload.og_image.trim());

    if (Array.isArray(payload.tags)) {
      payload.tags.forEach((tag) => fd.append("tags", tag.trim()));
    }
    return fd;
  }

  // JSON payload
  const body: Record<string, any> = {};
  if (payload.title) body.title = payload.title.trim();
  body.category = catId;
  if (payload.excerpt !== undefined) body.excerpt = payload.excerpt.trim();
  if (payload.content !== undefined) body.content = payload.content.trim();
  if (payload.cover_image !== undefined && payload.cover_image.trim()) {
    body.coverImage = payload.cover_image.trim();
  }
  if (payload.cover_caption !== undefined) body.coverCaption = payload.cover_caption.trim();
  if (payload.cover_alt !== undefined) body.coverAlt = payload.cover_alt.trim();
  if (payload.cover_credit !== undefined) body.coverCredit = payload.cover_credit.trim();
  if (payload.reading_time !== undefined) body.readingTime = payload.reading_time.trim();
  if (payload.order_index !== undefined) body.orderIndex = payload.order_index;
  if (payload.is_featured !== undefined) body.isFeatured = payload.is_featured;
  if (payload.status !== undefined) {
    body.isActive = payload.status === "published";
  }
  if (payload.meta_title !== undefined) body.metaTitle = payload.meta_title.trim();
  if (payload.meta_description !== undefined) body.metaDescription = payload.meta_description.trim();
  if (payload.og_image !== undefined) body.ogImage = payload.og_image.trim();
  if (Array.isArray(payload.tags)) {
    body.tags = payload.tags.map((t) => t.trim()).filter(Boolean);
  }

  return body;
}

/**
 * 4. CREATE BLOG
 * Endpoint: POST /api/v1/admin-panel/blog/create
 */
export async function createBlogApi(
  payload: BlogPostInput,
  coverImageFile?: File | null,
  categories?: BlogCategoryItem[],
): Promise<BlogPostItem> {
  const requestBody = await buildBlogPayload(payload, coverImageFile, categories);

  const isForm = typeof FormData !== "undefined" && requestBody instanceof FormData;

  const res = await apiRequest<BackendBlogSingleResponse>(
    "/api/v1/admin-panel/blog/create",
    {
      method: "POST",
      body: isForm ? requestBody : JSON.stringify(requestBody),
    },
  );

  clearApiCache("/api/v1/admin-panel/blog");

  const doc = res?.data?.blog || res?.blog;
  if (!doc) {
    throw new Error(res?.message || "Failed to create blog post on server.");
  }

  return normalizeBackendBlog(doc, categories);
}

/**
 * 5. UPDATE BLOG
 * Endpoint: PATCH /api/v1/admin-panel/blog/:id/update
 */
export async function updateBlogApi(
  id: string,
  payload: Partial<BlogPostInput>,
  coverImageFile?: File | null,
  categories?: BlogCategoryItem[],
): Promise<BlogPostItem> {
  if (!id) throw new Error("Blog ID is required for update.");

  const requestBody = await buildBlogPayload(payload, coverImageFile, categories);
  const isForm = typeof FormData !== "undefined" && requestBody instanceof FormData;

  const res = await apiRequest<BackendBlogSingleResponse>(
    `/api/v1/admin-panel/blog/${encodeURIComponent(id)}/update`,
    {
      method: "PATCH",
      body: isForm ? requestBody : JSON.stringify(requestBody),
    },
  );

  clearApiCache("/api/v1/admin-panel/blog");

  const doc = res?.data?.blog || res?.blog;
  if (!doc) {
    throw new Error(res?.message || "Failed to update blog post on server.");
  }

  return normalizeBackendBlog(doc, categories);
}

/**
 * 6. DELETE BLOG
 * Endpoint: DELETE /api/v1/admin-panel/blog/:id/delete
 */
export async function deleteBlogApi(
  id: string,
): Promise<{ success: boolean; message?: string }> {
  if (!id) throw new Error("Blog ID is required for deletion.");

  const res = await apiRequest<{ status: string; message: string }>(
    `/api/v1/admin-panel/blog/${encodeURIComponent(id)}/delete`,
    {
      method: "DELETE",
    },
  );

  clearApiCache("/api/v1/admin-panel/blog");

  return {
    success: res?.status === "success",
    message: res?.message,
  };
}

/**
 * 7. TOGGLE BLOG ACTIVE STATUS (PUBLISH / DRAFT)
 * Endpoint: PATCH /api/v1/admin-panel/blog/:id/toggle-activation
 */
export async function toggleBlogActiveApi(
  id: string,
  categories?: BlogCategoryItem[],
): Promise<BlogPostItem> {
  if (!id) throw new Error("Blog ID is required to toggle status.");

  const res = await apiRequest<BackendBlogSingleResponse>(
    `/api/v1/admin-panel/blog/${encodeURIComponent(id)}/toggle-activation`,
    {
      method: "PATCH",
    },
  );

  clearApiCache("/api/v1/admin-panel/blog");

  const doc = res?.data?.blog || res?.blog;
  if (!doc) {
    throw new Error(res?.message || "Failed to toggle blog status on server.");
  }

  return normalizeBackendBlog(doc, categories);
}

/**
 * 8. SET BLOG AS FEATURED SPOTLIGHT
 * Endpoint: PATCH /api/v1/admin-panel/blog/:id/featured
 */
export async function setBlogFeaturedApi(
  id: string,
  categories?: BlogCategoryItem[],
): Promise<BlogPostItem> {
  if (!id) throw new Error("Blog ID is required to set featured.");

  const res = await apiRequest<BackendBlogSingleResponse>(
    `/api/v1/admin-panel/blog/${encodeURIComponent(id)}/featured`,
    {
      method: "PATCH",
    },
  );

  clearApiCache("/api/v1/admin-panel/blog");

  const doc = res?.data?.blog || res?.blog;
  if (!doc) {
    throw new Error(res?.message || "Failed to set blog as featured on server.");
  }

  return normalizeBackendBlog(doc, categories);
}

/**
 * 9. GET BLOG CONFIG (HERO & NOTICE BANNER)
 * Endpoint: GET /api/v1/config/blog
 */
export async function getBlogConfigApi(): Promise<BlogConfig> {
  const fallbackConfig: BlogConfig = {
    hero_eyebrow: "Blog",
    hero_heading: "Ideas, Insights & Updates",
    hero_subline: "Thoughts on building software, shipping products, and the technology shaping tomorrow.",
    under_development_notice_active: true,
    under_development_notice_heading: "Publication Lab Under Active Development",
    under_development_notice_text: "Blog section under development. Please visit again after some time.",
  };

  try {
    const res = await apiRequest<BackendBlogConfigResponse>("/api/v1/config/blog", {
      method: "GET",
      cacheTtlMs: 30000,
    });

    const c = res?.data?.config;
    if (c) {
      return {
        hero_eyebrow: "Blog",
        hero_heading: c.heroHeading || fallbackConfig.hero_heading,
        hero_subline: c.heroSubline || fallbackConfig.hero_subline,
        under_development_notice_active:
          c.enableNoticeBanner !== undefined
            ? c.enableNoticeBanner
            : fallbackConfig.under_development_notice_active,
        under_development_notice_heading:
          c.noticeBannerHeading || fallbackConfig.under_development_notice_heading,
        under_development_notice_text:
          c.noticeBannerDescription || fallbackConfig.under_development_notice_text,
      };
    }
  } catch {
    // API unavailable - return fallback config
  }

  return fallbackConfig;
}

/**
 * 10. UPDATE BLOG CONFIG (HERO & NOTICE BANNER)
 * Endpoint: PATCH /api/v1/config/blog
 */
export async function updateBlogConfigApi(
  payload: Partial<BlogConfig>,
): Promise<BlogConfig> {
  const backendBody: Record<string, any> = {};

  if (payload.hero_heading !== undefined) backendBody.heroHeading = payload.hero_heading;
  if (payload.hero_subline !== undefined) backendBody.heroSubline = payload.hero_subline;
  if (payload.under_development_notice_active !== undefined) {
    backendBody.enableNoticeBanner = payload.under_development_notice_active;
  }
  if (payload.under_development_notice_heading !== undefined) {
    backendBody.noticeBannerHeading = payload.under_development_notice_heading;
  }
  if (payload.under_development_notice_text !== undefined) {
    backendBody.noticeBannerDescription = payload.under_development_notice_text;
  }

  const res = await apiRequest<BackendBlogConfigResponse>("/api/v1/config/blog", {
    method: "PATCH",
    body: JSON.stringify(backendBody),
  });

  clearApiCache("/api/v1/config/blog");

  const c = res?.data?.config;
  return {
    hero_eyebrow: "Blog",
    hero_heading: c?.heroHeading || payload.hero_heading || "Ideas, Insights & Updates",
    hero_subline:
      c?.heroSubline ||
      payload.hero_subline ||
      "Thoughts on building software, shipping products, and the technology shaping tomorrow.",
    under_development_notice_active:
      c?.enableNoticeBanner !== undefined
        ? c.enableNoticeBanner
        : payload.under_development_notice_active ?? true,
    under_development_notice_heading:
      c?.noticeBannerHeading ||
      payload.under_development_notice_heading ||
      "Publication Lab Under Active Development",
    under_development_notice_text:
      c?.noticeBannerDescription ||
      payload.under_development_notice_text ||
      "Blog section under development. Please visit again after some time.",
  };
}
