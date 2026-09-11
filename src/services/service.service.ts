/**
 * DIMISI Admin — Services Express API Service
 * Handles Services listing, creation, updates, toggling, and deletion
 * against the Express backend API (/api/v1/admin-panel/services/*).
 */
import { apiRequest, ApiError } from "./apiClient";
import type { CompanyService, ServiceCategoryItem, ServiceInput } from "@/lib/services.shared";
import {
  getAllServiceCategoriesApi,
  createServiceCategoryApi,
} from "./serviceCategory.service";

export interface BackendServiceDoc {
  _id: string;
  title: string;
  category: string | { _id: string; name: string } | undefined;
  tagline?: string;
  slug: string;
  summary?: string;
  heroImage?: string;
  relatedImages?: Array<{
    url: string;
    caption?: string;
    alt?: string;
  }>;
  whatIsIt?: string;
  whoIsFor?: string;
  problemSolved?: string;
  whyItMatters?: string;
  features?: string[];
  processSteps?: Array<{
    step: string;
    title: string;
    description: string;
  }>;
  benefits?: Array<{
    title: string;
    description: string;
    metric?: string;
  }>;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  techStack?: string[];
  orderIndex: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendServiceListResponse {
  status: string;
  services: BackendServiceDoc[];
}

export interface BackendServiceSingleResponse {
  status: string;
  message?: string;
  service?: BackendServiceDoc;
  data?: {
    service: BackendServiceDoc;
  };
}

/**
 * Check if a string is a 24-character hexadecimal MongoDB ObjectId
 */
export function isMongoId(id?: string | null): boolean {
  return typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id.trim());
}

/**
 * Resolves category name from category ID or object against the given categories list.
 */
export function resolveCategoryName(
  rawCat: string | { _id: string; name: string } | undefined,
  categories?: ServiceCategoryItem[],
): string {
  if (!rawCat) return "Custom Software";

  if (typeof rawCat === "object" && rawCat !== null) {
    if (rawCat.name) return rawCat.name;
    if (rawCat._id && categories) {
      const found = categories.find((c) => c.id === rawCat._id || (c as any)._id === rawCat._id);
      if (found) return found.name;
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

  return catStr || "Custom Software";
}

/**
 * Normalizes backend IService document into the clean frontend CompanyService model.
 */
export function normalizeBackendService(
  doc: BackendServiceDoc | null | undefined,
  categories?: ServiceCategoryItem[],
): CompanyService {
  if (!doc) {
    return {
      id: "srv-" + Date.now().toString(36),
      title: "Unnamed Service",
      slug: "unnamed-service",
      category: "Custom Software",
      summary: "",
      tagline: "",
      hero_image: "",
      related_images: [],
      what_is_it: "",
      who_is_for: "",
      problem_solved: "",
      why_it_matters: "",
      features: [],
      process_steps: [],
      benefits: [],
      faqs: [],
      tech_stack: [],
      order_index: 1,
      is_featured: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const resolvedCategory = resolveCategoryName(doc.category, categories);

  return {
    id: String(doc._id),
    title: doc.title || "Unnamed Service",
    slug: doc.slug || doc.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "service",
    category: resolvedCategory,
    summary: doc.summary || "",
    tagline: doc.tagline || (doc.summary ? doc.summary.slice(0, 80) : ""),
    hero_image: doc.heroImage || "",
    related_images: Array.isArray(doc.relatedImages)
      ? doc.relatedImages.map((img) => ({
          url: img.url,
          caption: img.caption || "",
          alt: img.alt || "",
        }))
      : [],
    what_is_it: doc.whatIsIt || "",
    who_is_for: doc.whoIsFor || "",
    problem_solved: doc.problemSolved || "",
    why_it_matters: doc.whyItMatters || "",
    features: Array.isArray(doc.features) ? doc.features : [],
    process_steps: Array.isArray(doc.processSteps) ? doc.processSteps : [],
    benefits: Array.isArray(doc.benefits) ? doc.benefits : [],
    faqs: Array.isArray(doc.faqs) ? doc.faqs : [],
    tech_stack: Array.isArray(doc.techStack) ? doc.techStack : [],
    order_index: typeof doc.orderIndex === "number" ? doc.orderIndex : 1,
    is_featured: Boolean(doc.isFeatured),
    is_active: doc.isActive !== false,
    created_at: doc.createdAt || new Date().toISOString(),
    updated_at: doc.updatedAt || new Date().toISOString(),
  };
}

/**
 * 1. GET ALL SERVICES (ADMIN)
 * Endpoint: GET /api/v1/admin-panel/services/all
 * Query parameter: ?category=<categoryId> (optional)
 */
export async function getAllServicesApi(
  categoryId?: string,
  categories?: ServiceCategoryItem[],
): Promise<CompanyService[]> {
  try {
    const query = categoryId && categoryId.toLowerCase() !== "all" ? `?category=${encodeURIComponent(categoryId)}` : "";
    const res = await apiRequest<BackendServiceListResponse>(
      `/api/v1/admin-panel/services/all${query}`,
      { method: "GET" },
    );

    if (Array.isArray(res?.services)) {
      return res.services.map((doc) => normalizeBackendService(doc, categories));
    }
    return [];
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      console.warn("Failed to fetch services from backend API:", err.message);
    }
    throw err;
  }
}

/**
 * 2. GET SERVICE BY ID
 * Endpoint: GET /api/v1/admin-panel/services/:id
 */
export async function getServiceByIdApi(
  id: string,
  categories?: ServiceCategoryItem[],
): Promise<CompanyService> {
  if (!id) throw new Error("Service ID is required.");

  const res = await apiRequest<BackendServiceSingleResponse>(
    `/api/v1/admin-panel/services/${encodeURIComponent(id)}`,
    { method: "GET" },
  );

  const doc = res?.data?.service || res?.service;
  if (!doc) throw new Error(res?.message || "Service not found.");

  return normalizeBackendService(doc, categories);
}

/**
 * Helper to resolve category ID from input category name/id
 */
/**
 * Helper to resolve category ID from input category name/id.
 * Guarantees that the returned ID is ALWAYS a valid 24-character hex MongoDB ObjectId.
 */
export async function resolveCategoryIdForPayload(
  categoryInput: string | undefined | null,
  categories?: ServiceCategoryItem[],
): Promise<string> {
  if (!categoryInput) {
    categoryInput = "Full-Stack Engineering";
  }
  const trimmed = categoryInput.trim();
  if (isMongoId(trimmed)) return trimmed;

  const normalizeStr = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]/g, "");

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
  let liveCats: ServiceCategoryItem[] = [];
  try {
    liveCats = await getAllServiceCategoriesApi();
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
  } catch (err) {
    console.warn("Could not load live categories for resolution:", err);
  }

  // 3. Category does not exist in backend MongoDB — auto-create it on backend!
  try {
    const createdCat = await createServiceCategoryApi({
      name: trimmed,
      displayOrder: (liveCats?.length || 0) + 1,
      status: "active",
    });
    if (createdCat && isMongoId(createdCat.id)) {
      return createdCat.id;
    }
  } catch (err) {
    console.warn("Auto-create category on backend failed:", err);
  }

  // 4. Fallback to any existing backend category if available
  if (liveCats && liveCats.length > 0) {
    const firstValid = liveCats.find((c) => isMongoId(c.id));
    if (firstValid) return firstValid.id;
  }

  return trimmed;
}

/**
 * 3. CREATE SERVICE
 * Endpoint: POST /api/v1/admin-panel/services/create
 */
export async function createServiceApi(
  payload: ServiceInput | FormData,
  categories?: ServiceCategoryItem[],
): Promise<CompanyService> {
  let body: any;

  if (payload instanceof FormData) {
    const rawCat = payload.get("category");
    if (typeof rawCat === "string") {
      const resolvedId = await resolveCategoryIdForPayload(rawCat, categories);
      payload.set("category", resolvedId);
    }
    body = payload;
  } else {
    const categoryId = await resolveCategoryIdForPayload(payload.category, categories);
    body = JSON.stringify({
      title: payload.title.trim(),
      category: categoryId,
      tagline: payload.tagline?.trim() || undefined,
      slug: payload.slug?.trim() || undefined,
      summary: payload.summary?.trim() || undefined,
      heroImage: payload.hero_image?.trim() || undefined,
      relatedImages: payload.related_images || [],
      whatIsIt: payload.what_is_it?.trim() || undefined,
      whoIsFor: payload.who_is_for?.trim() || undefined,
      problemSolved: payload.problem_solved?.trim() || undefined,
      whyItMatters: payload.why_it_matters?.trim() || undefined,
      features: payload.features || [],
      processSteps: payload.process_steps || [],
      benefits: payload.benefits || [],
      faqs: payload.faqs || [],
      techStack: payload.tech_stack || [],
      orderIndex: Number(payload.order_index) || 1,
      isFeatured: Boolean(payload.is_featured),
      isActive: payload.is_active !== false,
    });
  }

  try {
    const res = await apiRequest<BackendServiceSingleResponse>(
      "/api/v1/admin-panel/services/create",
      {
        method: "POST",
        body,
      },
    );

    const doc = res?.service || res?.data?.service;
    if (!doc) {
      throw new Error(res?.message || "Failed to create service.");
    }

    return normalizeBackendService(doc, categories);
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 400) {
      console.error("[Service Create 400 Error Context]", {
        selectedCategoryValue: payload instanceof FormData ? payload.get("category") : payload.category,
        resolvedCategoryId:
          typeof body === "string"
            ? JSON.parse(body).category
            : payload instanceof FormData
            ? payload.get("category")
            : undefined,
        errorMessage: err.message,
      });
    }
    throw err;
  }
}

/**
 * 4. UPDATE SERVICE
 * Endpoint: PATCH /api/v1/admin-panel/services/:id/update
 */
export async function updateServiceApi(
  id: string,
  payload: Partial<ServiceInput> | FormData,
  categories?: ServiceCategoryItem[],
): Promise<CompanyService> {
  if (!id) throw new Error("Service ID is required for update.");

  let body: any;

  if (payload instanceof FormData) {
    const rawCat = payload.get("category");
    if (typeof rawCat === "string") {
      const resolvedId = await resolveCategoryIdForPayload(rawCat, categories);
      payload.set("category", resolvedId);
    }
    body = payload;
  } else {
    const updateObj: Record<string, any> = {};
    if (payload.title !== undefined) updateObj.title = payload.title.trim();
    if (payload.category !== undefined) {
      updateObj.category = await resolveCategoryIdForPayload(payload.category, categories);
    }
    if (payload.tagline !== undefined) updateObj.tagline = payload.tagline.trim();
    if (payload.slug !== undefined) updateObj.slug = payload.slug.trim();
    if (payload.summary !== undefined) updateObj.summary = payload.summary.trim();
    if (payload.hero_image !== undefined) updateObj.heroImage = payload.hero_image.trim();
    if (payload.related_images !== undefined) updateObj.relatedImages = payload.related_images;
    if (payload.what_is_it !== undefined) updateObj.whatIsIt = payload.what_is_it.trim();
    if (payload.who_is_for !== undefined) updateObj.whoIsFor = payload.who_is_for.trim();
    if (payload.problem_solved !== undefined) updateObj.problemSolved = payload.problem_solved.trim();
    if (payload.why_it_matters !== undefined) updateObj.whyItMatters = payload.why_it_matters.trim();
    if (payload.features !== undefined) updateObj.features = payload.features;
    if (payload.process_steps !== undefined) updateObj.processSteps = payload.process_steps;
    if (payload.benefits !== undefined) updateObj.benefits = payload.benefits;
    if (payload.faqs !== undefined) updateObj.faqs = payload.faqs;
    if (payload.tech_stack !== undefined) updateObj.techStack = payload.tech_stack;
    if (payload.order_index !== undefined) updateObj.orderIndex = Number(payload.order_index);
    if (payload.is_featured !== undefined) updateObj.isFeatured = Boolean(payload.is_featured);
    if (payload.is_active !== undefined) updateObj.isActive = Boolean(payload.is_active);

    body = JSON.stringify(updateObj);
  }

  try {
    const res = await apiRequest<BackendServiceSingleResponse>(
      `/api/v1/admin-panel/services/${encodeURIComponent(id)}/update`,
      {
        method: "PATCH",
        body,
      },
    );

    const doc = res?.data?.service || res?.service;
    if (!doc) {
      throw new Error(res?.message || "Failed to update service.");
    }

    return normalizeBackendService(doc, categories);
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 400) {
      console.error("[Service Update 400 Error Context]", {
        serviceId: id,
        selectedCategoryValue: payload instanceof FormData ? payload.get("category") : payload.category,
        resolvedCategoryId:
          typeof body === "string"
            ? JSON.parse(body).category
            : payload instanceof FormData
            ? payload.get("category")
            : undefined,
        errorMessage: err.message,
      });
    }
    throw err;
  }
}

/**
 * 5. DELETE SERVICE
 * Endpoint: DELETE /api/v1/admin-panel/services/:id/delete
 */
export async function deleteServiceApi(id: string): Promise<boolean> {
  if (!id) throw new Error("Service ID is required for deletion.");

  await apiRequest<void>(
    `/api/v1/admin-panel/services/${encodeURIComponent(id)}/delete`,
    {
      method: "DELETE",
    },
  );

  return true;
}

/**
 * 6. TOGGLE SERVICE ACTIVATION
 * Endpoint: PATCH /api/v1/admin-panel/services/:id/activate
 */
export async function toggleServiceActivationApi(
  id: string,
  categories?: ServiceCategoryItem[],
): Promise<CompanyService> {
  if (!id) throw new Error("Service ID is required.");

  const res = await apiRequest<BackendServiceSingleResponse>(
    `/api/v1/admin-panel/services/${encodeURIComponent(id)}/activate`,
    {
      method: "PATCH",
    },
  );

  const doc = res?.data?.service || res?.service;
  if (!doc) throw new Error(res?.message || "Failed to toggle service activation.");

  return normalizeBackendService(doc, categories);
}

/**
 * 7. TOGGLE SERVICE FEATURED STATUS
 * Endpoint: PATCH /api/v1/admin-panel/services/:id/featured
 */
export async function toggleServiceFeaturedApi(
  id: string,
  categories?: ServiceCategoryItem[],
): Promise<CompanyService> {
  if (!id) throw new Error("Service ID is required.");

  const res = await apiRequest<BackendServiceSingleResponse>(
    `/api/v1/admin-panel/services/${encodeURIComponent(id)}/featured`,
    {
      method: "PATCH",
    },
  );

  const doc = res?.data?.service || res?.service;
  if (!doc) throw new Error(res?.message || "Failed to toggle service featured status.");

  return normalizeBackendService(doc, categories);
}
