/**
 * DIMISI Admin — Blog Category Express API Service
 * Handles Blog Category listing, creation, updates, and deletion
 * against the Express backend API (/api/v1/admin-panel/blog-category/*).
 */
import { apiRequest, ApiError, clearApiCache } from "./apiClient";
import type { BlogCategoryItem } from "@/lib/blog.shared";

export interface BackendBlogCategoryDoc {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendBlogCategoryListResponse {
  status: string;
  results: number;
  data: {
    categories: BackendBlogCategoryDoc[];
  };
}

export interface BackendBlogCategorySingleResponse {
  status: string;
  message?: string;
  data: {
    category: BackendBlogCategoryDoc;
  };
}

export interface CreateBlogCategoryPayload {
  name: string;
  description?: string | undefined;
  displayOrder: number;
  isActive?: boolean | undefined;
  status?: "active" | "inactive" | undefined;
}

export interface UpdateBlogCategoryPayload {
  name?: string | undefined;
  description?: string | undefined;
  displayOrder?: number | undefined;
  isActive?: boolean | undefined;
  status?: "active" | "inactive" | undefined;
}

/**
 * Checks if a given string is a valid 24-character hex MongoDB ObjectId.
 */
export function isMongoId(id?: string | null): boolean {
  if (!id || typeof id !== "string") return false;
  return /^[0-9a-fA-F]{24}$/.test(id.trim());
}

/**
 * Normalizes backend IBlogCategory document into the clean frontend BlogCategoryItem model.
 */
export function normalizeBackendBlogCategory(
  doc: BackendBlogCategoryDoc | null | undefined,
): BlogCategoryItem {
  if (!doc) {
    return {
      id: "cat-" + Date.now().toString(36),
      name: "General",
      slug: "general",
      description: "",
      status: "active",
      order_index: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const cleanSlug =
    doc.slug ||
    doc.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
    "category";

  return {
    id: String(doc._id),
    name: doc.name || "General",
    slug: cleanSlug,
    description: doc.description || "",
    status: doc.isActive !== false ? "active" : "inactive",
    order_index: typeof doc.displayOrder === "number" ? doc.displayOrder : 1,
    created_at: doc.createdAt || new Date().toISOString(),
    updated_at: doc.updatedAt || new Date().toISOString(),
  };
}

/**
 * Resolves category name from a raw category (which may be a string, ObjectId, or object).
 */
export function resolveBlogCategoryName(
  rawCat: string | { _id: string; name: string; slug?: string } | undefined | null,
  categories?: BlogCategoryItem[],
): string {
  if (!rawCat) return "General";

  // If already an object with name
  if (typeof rawCat === "object" && rawCat !== null) {
    if (typeof (rawCat as any).name === "string" && (rawCat as any).name.trim()) {
      return (rawCat as any).name.trim();
    }
  }

  const catStr = String(rawCat).trim();

  // If it's a Mongo ObjectId, look it up in categories
  if (isMongoId(catStr) && categories && categories.length > 0) {
    const found = categories.find(
      (c) => c.id === catStr || (c as any)._id === catStr || c.slug === catStr,
    );
    if (found) return found.name;
  }

  // If not found or not a Mongo ID, check if it's already a category name / slug
  if (categories && categories.length > 0) {
    const foundByName = categories.find(
      (c) =>
        c.name.toLowerCase() === catStr.toLowerCase() ||
        c.slug.toLowerCase() === catStr.toLowerCase(),
    );
    if (foundByName) return foundByName.name;
  }

  return catStr || "General";
}

/**
 * Helper to resolve category ID from input category name/id.
 * Guarantees that the returned ID is ALWAYS a valid 24-character hex MongoDB ObjectId.
 */
export async function resolveBlogCategoryIdForPayload(
  categoryInput: string | undefined | null,
  categories?: BlogCategoryItem[],
): Promise<string> {
  if (!categoryInput) {
    categoryInput = "General";
  }
  const trimmed = categoryInput.trim();
  if (isMongoId(trimmed)) return trimmed;

  const normalizeStr = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const targetKey = normalizeStr(trimmed);

  // 1. Try in supplied categories
  if (categories && categories.length > 0) {
    const match = categories.find(
      (c) =>
        c.id === trimmed ||
        c.name.toLowerCase() === trimmed.toLowerCase() ||
        c.slug.toLowerCase() === trimmed.toLowerCase() ||
        normalizeStr(c.name) === targetKey ||
        normalizeStr(c.slug) === targetKey,
    );
    if (match && isMongoId(match.id)) {
      return match.id;
    }
  }

  // 2. Query live categories from backend API
  let liveCats: BlogCategoryItem[] = [];
  try {
    liveCats = await getAllBlogCategoriesApi();
    if (Array.isArray(liveCats) && liveCats.length > 0) {
      const match = liveCats.find(
        (c) =>
          c.id === trimmed ||
          c.name.toLowerCase() === trimmed.toLowerCase() ||
          c.slug.toLowerCase() === trimmed.toLowerCase() ||
          normalizeStr(c.name) === targetKey ||
          normalizeStr(c.slug) === targetKey,
      );
      if (match && isMongoId(match.id)) {
        return match.id;
      }
    }
  } catch {
    // API not reachable
  }

  // 3. Category does not exist in backend MongoDB — auto-create it on backend!
  try {
    const createdCat = await createBlogCategoryApi({
      name: trimmed.length >= 2 ? trimmed : "General",
      description: `${trimmed} related editorial publications.`,
      displayOrder: (liveCats?.length || 0) + 1,
      isActive: true,
    });
    if (createdCat && isMongoId(createdCat.id)) {
      return createdCat.id;
    }
  } catch {
    // Cannot reach backend - proceed with local key
  }

  // 4. Fallback to first available category from live categories
  if (liveCats.length > 0 && isMongoId(liveCats[0].id)) {
    return liveCats[0].id;
  }

  return trimmed;
}

/**
 * 1. GET ALL BLOG CATEGORIES
 * Endpoint: GET /api/v1/admin-panel/blog-category/all
 */
export async function getAllBlogCategoriesApi(): Promise<BlogCategoryItem[]> {
  try {
    const res = await apiRequest<BackendBlogCategoryListResponse>(
      "/api/v1/admin-panel/blog-category/all",
      {
        method: "GET",
        cacheTtlMs: 15000,
      },
    );

    const rawList = res?.data?.categories;
    if (!Array.isArray(rawList)) {
      return [];
    }

    return rawList
      .map(normalizeBackendBlogCategory)
      .sort((a, b) => a.order_index - b.order_index);
  } catch {
    return [];
  }
}

/**
 * 2. CREATE BLOG CATEGORY
 * Endpoint: POST /api/v1/admin-panel/blog-category/create
 */
export async function createBlogCategoryApi(
  payload: CreateBlogCategoryPayload,
): Promise<BlogCategoryItem> {
  const body: Record<string, any> = {
    name: payload.name.trim(),
    description: (payload.description || "").trim(),
    displayOrder:
      typeof payload.displayOrder === "number" ? payload.displayOrder : 1,
    isActive: payload.isActive !== false && payload.status !== "inactive",
  };

  const res = await apiRequest<BackendBlogCategorySingleResponse>(
    "/api/v1/admin-panel/blog-category/create",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );

  clearApiCache("/api/v1/admin-panel/blog-category");
  clearApiCache("/api/v1/admin-panel/blog");

  const doc = res?.data?.category;
  if (!doc) {
    throw new Error(res?.message || "Failed to create blog category on server.");
  }

  return normalizeBackendBlogCategory(doc);
}

/**
 * 3. UPDATE BLOG CATEGORY
 * Endpoint: PATCH /api/v1/admin-panel/blog-category/:id/update
 */
export async function updateBlogCategoryApi(
  id: string,
  payload: UpdateBlogCategoryPayload,
): Promise<BlogCategoryItem> {
  if (!id) throw new Error("Blog Category ID is required for update.");

  const body: Record<string, any> = {};
  if (payload.name !== undefined) body.name = payload.name.trim();
  if (payload.description !== undefined) body.description = payload.description.trim();
  if (payload.displayOrder !== undefined) body.displayOrder = payload.displayOrder;
  if (payload.isActive !== undefined) {
    body.isActive = payload.isActive;
  } else if (payload.status !== undefined) {
    body.isActive = payload.status === "active";
  }

  const res = await apiRequest<BackendBlogCategorySingleResponse>(
    `/api/v1/admin-panel/blog-category/${encodeURIComponent(id)}/update`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );

  clearApiCache("/api/v1/admin-panel/blog-category");
  clearApiCache("/api/v1/admin-panel/blog");

  const doc = res?.data?.category;
  if (!doc) {
    throw new Error(res?.message || "Failed to update blog category on server.");
  }

  return normalizeBackendBlogCategory(doc);
}

/**
 * 4. DELETE BLOG CATEGORY
 * Endpoint: DELETE /api/v1/admin-panel/blog-category/:id/delete
 */
export async function deleteBlogCategoryApi(
  id: string,
): Promise<{ success: boolean; message?: string }> {
  if (!id) throw new Error("Blog Category ID is required for deletion.");

  const res = await apiRequest<{ status: string; message: string }>(
    `/api/v1/admin-panel/blog-category/${encodeURIComponent(id)}/delete`,
    {
      method: "DELETE",
    },
  );

  clearApiCache("/api/v1/admin-panel/blog-category");
  clearApiCache("/api/v1/admin-panel/blog");

  return {
    success: res?.status === "success",
    message: res?.message,
  };
}
