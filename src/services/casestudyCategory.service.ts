/**
 * DIMISI Admin — Case Study Category Express API Service
 * Handles Case Study / Work & Products Category listing, creation, updates, and deletion
 * against the Express backend API (/api/v1/admin-panel/casestudy-category/*).
 */
import { apiRequest, ApiError } from "./apiClient";
import type { WorkCategoryItem } from "@/lib/work.shared";

export interface BackendCasestudyCategoryDoc {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendCasestudyCategoryListResponse {
  status: string;
  results: number;
  data: {
    casestudyCategories: BackendCasestudyCategoryDoc[];
  };
}

export interface BackendCasestudyCategorySingleResponse {
  status: string;
  message?: string;
  data: {
    casestudyCategory: BackendCasestudyCategoryDoc;
  };
}

export interface CreateCasestudyCategoryPayload {
  name: string;
  description?: string;
  displayOrder: number;
  isActive?: boolean;
  status?: "active" | "inactive";
  slug?: string;
}

export interface UpdateCasestudyCategoryPayload {
  name?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
  status?: "active" | "inactive";
}

/**
 * Checks if a given string is a valid 24-character hex MongoDB ObjectId.
 */
export function isMongoId(id?: string | null): boolean {
  if (!id || typeof id !== "string") return false;
  return /^[0-9a-fA-F]{24}$/.test(id.trim());
}

/**
 * Normalizes backend ICaseStudyCategory document into the clean frontend WorkCategoryItem model.
 */
export function normalizeBackendCasestudyCategory(
  doc: BackendCasestudyCategoryDoc | null | undefined,
): WorkCategoryItem {
  if (!doc) {
    return {
      id: "cat-" + Date.now().toString(36),
      name: "Unnamed Category",
      slug: "unnamed-category",
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
    name: doc.name || "Unnamed Category",
    slug: cleanSlug,
    description: doc.description || "",
    status: doc.isActive !== false ? "active" : "inactive",
    order_index: typeof doc.displayOrder === "number" ? doc.displayOrder : 1,
    created_at: doc.createdAt || new Date().toISOString(),
    updated_at: doc.updatedAt || new Date().toISOString(),
  };
}

/**
 * 1. GET ALL CASE STUDY CATEGORIES
 * Endpoint: GET /api/v1/admin-panel/casestudy-category/all
 */
export async function getAllCasestudyCategoriesApi(): Promise<WorkCategoryItem[]> {
  try {
    const res = await apiRequest<BackendCasestudyCategoryListResponse>(
      "/api/v1/admin-panel/casestudy-category/all",
      {
        method: "GET",
      },
    );

    if (Array.isArray(res?.data?.casestudyCategories)) {
      return res.data.casestudyCategories.map(normalizeBackendCasestudyCategory);
    }
    return [];
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      console.warn("Failed to fetch case study categories from backend API:", err.message);
    }
    throw err;
  }
}

/**
 * 2. CREATE CASE STUDY CATEGORY
 * Endpoint: POST /api/v1/admin-panel/casestudy-category/create
 * Body: { name, description, displayOrder, isActive, slug? }
 */
export async function createCasestudyCategoryApi(
  payload: CreateCasestudyCategoryPayload,
): Promise<WorkCategoryItem> {
  const cleanName = payload.name?.trim();
  if (!cleanName || cleanName.length < 5) {
    throw new Error("Category name must be at least 5 characters long (5-50 characters).");
  }
  if (cleanName.length > 50) {
    throw new Error("Category name cannot exceed 50 characters.");
  }

  const cleanDescription = payload.description?.trim();
  if (!cleanDescription || cleanDescription.length < 5) {
    throw new Error("Category description is required (5-200 characters).");
  }
  if (cleanDescription.length > 200) {
    throw new Error("Category description cannot exceed 200 characters.");
  }

  const cleanSlug =
    payload.slug?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
    cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const displayOrder = Number(payload.displayOrder) || 1;
  const isActive =
    payload.isActive !== undefined
      ? Boolean(payload.isActive)
      : payload.status !== "inactive";

  const requestBody: Record<string, any> = {
    name: cleanName,
    description: cleanDescription,
    displayOrder,
    isActive,
    slug: cleanSlug,
  };

  const res = await apiRequest<BackendCasestudyCategorySingleResponse>(
    "/api/v1/admin-panel/casestudy-category/create",
    {
      method: "POST",
      body: JSON.stringify(requestBody),
    },
  );

  if (!res?.data?.casestudyCategory) {
    throw new Error(res?.message || "Failed to create case study category.");
  }

  return normalizeBackendCasestudyCategory(res.data.casestudyCategory);
}

/**
 * 3. UPDATE CASE STUDY CATEGORY
 * Endpoint: PATCH /api/v1/admin-panel/casestudy-category/:id/update
 * Body: { name?, description?, displayOrder?, isActive? }
 */
export async function updateCasestudyCategoryApi(
  id: string,
  payload: UpdateCasestudyCategoryPayload,
): Promise<WorkCategoryItem> {
  if (!id) {
    throw new Error("Category ID is required for update.");
  }

  const updateBody: Record<string, any> = {};

  if (payload.name !== undefined) {
    const cleanName = payload.name.trim();
    if (cleanName.length < 5 || cleanName.length > 50) {
      throw new Error("Category name must be between 5 and 50 characters.");
    }
    updateBody.name = cleanName;
  }

  if (payload.description !== undefined) {
    const cleanDesc = payload.description.trim();
    if (cleanDesc.length < 5 || cleanDesc.length > 200) {
      throw new Error("Category description must be between 5 and 200 characters.");
    }
    updateBody.description = cleanDesc;
  }

  if (payload.displayOrder !== undefined) {
    const orderNum = Number(payload.displayOrder);
    if (!Number.isInteger(orderNum) || orderNum < 1 || orderNum > 10000) {
      throw new Error("Display order must be an integer between 1 and 10000.");
    }
    updateBody.displayOrder = orderNum;
  }

  if (payload.isActive !== undefined) {
    updateBody.isActive = Boolean(payload.isActive);
  } else if (payload.status !== undefined) {
    updateBody.isActive = payload.status === "active";
  }

  if (Object.keys(updateBody).length === 0) {
    throw new Error("No valid fields provided for update.");
  }

  const res = await apiRequest<BackendCasestudyCategorySingleResponse>(
    `/api/v1/admin-panel/casestudy-category/${encodeURIComponent(id)}/update`,
    {
      method: "PATCH",
      body: JSON.stringify(updateBody),
    },
  );

  if (!res?.data?.casestudyCategory) {
    throw new Error(res?.message || "Failed to update case study category.");
  }

  return normalizeBackendCasestudyCategory(res.data.casestudyCategory);
}

/**
 * 4. DELETE CASE STUDY CATEGORY
 * Endpoint: DELETE /api/v1/admin-panel/casestudy-category/:id/delete
 */
export async function deleteCasestudyCategoryApi(id: string): Promise<boolean> {
  if (!id) {
    throw new Error("Category ID is required for deletion.");
  }

  await apiRequest<void>(
    `/api/v1/admin-panel/casestudy-category/${encodeURIComponent(id)}/delete`,
    {
      method: "DELETE",
    },
  );

  return true;
}
