/**
 * DIMISI Admin — Service Category Express API Service
 * Handles Service Category listing, creation, updates, and deletion
 * against the Express backend API (/api/v1/admin-panel/service-category/*).
 */
import { apiRequest, ApiError } from "./apiClient";
import type { ServiceCategoryItem } from "@/lib/services.shared";

export interface BackendServiceCategoryDoc {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  displayOrder: number;
  status: "active" | "inactive";
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendServiceCategoryListResponse {
  status: string;
  results: number;
  data: {
    serviceCategories: BackendServiceCategoryDoc[];
  };
}

export interface BackendServiceCategorySingleResponse {
  status: string;
  message?: string;
  data: {
    serviceCategory: BackendServiceCategoryDoc;
  };
}

export interface CreateServiceCategoryPayload {
  name: string;
  description?: string;
  displayOrder: number;
  status?: "active" | "inactive";
}

export interface UpdateServiceCategoryPayload {
  name?: string;
  description?: string;
  displayOrder?: number;
  status?: "active" | "inactive";
}

/**
 * Normalizes backend IServiceCategory document into the clean frontend ServiceCategoryItem model.
 */
export function normalizeBackendServiceCategory(
  doc: BackendServiceCategoryDoc | null | undefined,
): ServiceCategoryItem {
  if (!doc) {
    return {
      id: "scat-" + Date.now().toString(36),
      name: "Unnamed Category",
      slug: "unnamed-category",
      description: "",
      status: "active",
      order_index: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return {
    id: String(doc._id),
    name: doc.name || "Unnamed Category",
    slug: doc.slug || doc.name?.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-") || "category",
    description: doc.description || "",
    status: doc.status === "inactive" ? "inactive" : "active",
    order_index: typeof doc.displayOrder === "number" ? doc.displayOrder : 1,
    created_at: doc.createdAt || new Date().toISOString(),
    updated_at: doc.updatedAt || new Date().toISOString(),
  };
}

/**
 * 1. GET ALL SERVICE CATEGORIES
 * Endpoint: GET /api/v1/admin-panel/service-category/all
 */
export async function getAllServiceCategoriesApi(): Promise<ServiceCategoryItem[]> {
  try {
    const res = await apiRequest<BackendServiceCategoryListResponse>(
      "/api/v1/admin-panel/service-category/all",
      {
        method: "GET",
      },
    );

    if (Array.isArray(res?.data?.serviceCategories)) {
      return res.data.serviceCategories.map(normalizeBackendServiceCategory);
    }
    return [];
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      console.warn("Failed to fetch service categories from backend API:", err.message);
    }
    throw err;
  }
}

/**
 * 2. CREATE SERVICE CATEGORY
 * Endpoint: POST /api/v1/admin-panel/service-category/create
 * Body: { name, description?, displayOrder, status? }
 */
export async function createServiceCategoryApi(
  payload: CreateServiceCategoryPayload,
): Promise<ServiceCategoryItem> {
  const cleanName = payload.name?.trim();
  if (!cleanName || cleanName.length < 5) {
    throw new Error("Category name must be at least 5 characters long.");
  }
  if (cleanName.length > 50) {
    throw new Error("Category name cannot exceed 50 characters.");
  }

  const cleanDescription = payload.description?.trim();
  if (cleanDescription && (cleanDescription.length < 5 || cleanDescription.length > 200)) {
    throw new Error("Category description must be between 5 and 200 characters.");
  }

  const displayOrder = Number(payload.displayOrder) || 1;

  const requestBody: Record<string, any> = {
    name: cleanName,
    displayOrder,
    status: payload.status || "active",
  };

  if (cleanDescription) {
    requestBody.description = cleanDescription;
  }

  const res = await apiRequest<BackendServiceCategorySingleResponse>(
    "/api/v1/admin-panel/service-category/create",
    {
      method: "POST",
      body: JSON.stringify(requestBody),
    },
  );

  if (!res?.data?.serviceCategory) {
    throw new Error(res?.message || "Failed to create service category.");
  }

  return normalizeBackendServiceCategory(res.data.serviceCategory);
}

/**
 * 3. UPDATE SERVICE CATEGORY
 * Endpoint: PATCH /api/v1/admin-panel/service-category/:id/update
 * Body: { name?, description?, displayOrder?, status? }
 */
export async function updateServiceCategoryApi(
  id: string,
  payload: UpdateServiceCategoryPayload,
): Promise<ServiceCategoryItem> {
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
    if (cleanDesc.length > 0) {
      if (cleanDesc.length < 5 || cleanDesc.length > 200) {
        throw new Error("Category description must be between 5 and 200 characters.");
      }
      updateBody.description = cleanDesc;
    }
  }

  if (payload.displayOrder !== undefined) {
    const orderNum = Number(payload.displayOrder);
    if (!Number.isInteger(orderNum) || orderNum < 1 || orderNum > 10000) {
      throw new Error("Display order must be an integer between 1 and 10000.");
    }
    updateBody.displayOrder = orderNum;
  }

  if (payload.status !== undefined) {
    updateBody.status = payload.status === "inactive" ? "inactive" : "active";
  }

  if (Object.keys(updateBody).length === 0) {
    throw new Error("No valid fields provided for update.");
  }

  const res = await apiRequest<BackendServiceCategorySingleResponse>(
    `/api/v1/admin-panel/service-category/${encodeURIComponent(id)}/update`,
    {
      method: "PATCH",
      body: JSON.stringify(updateBody),
    },
  );

  if (!res?.data?.serviceCategory) {
    throw new Error(res?.message || "Failed to update service category.");
  }

  return normalizeBackendServiceCategory(res.data.serviceCategory);
}

/**
 * 4. DELETE SERVICE CATEGORY
 * Endpoint: DELETE /api/v1/admin-panel/service-category/:id/delete
 */
export async function deleteServiceCategoryApi(id: string): Promise<boolean> {
  if (!id) {
    throw new Error("Category ID is required for deletion.");
  }

  await apiRequest<void>(
    `/api/v1/admin-panel/service-category/${encodeURIComponent(id)}/delete`,
    {
      method: "DELETE",
    },
  );

  return true;
}
