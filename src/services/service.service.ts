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
  heroImagePublicId?: string;
  relatedImages?: Array<{
    url: string;
    caption?: string;
    alt?: string;
    publicId?: string;
  }>;
  uploadStatus?: "pending" | "success" | "failed";
  failReason?: string;
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
  results?: number;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
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

export const DEFAULT_SERVICE_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80";

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
      hero_image: DEFAULT_SERVICE_FALLBACK_IMAGE,
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
      upload_status: "success",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const rawCatId =
    typeof doc.category === "object" && doc.category !== null
      ? String((doc.category as any)._id)
      : isMongoId(doc.category)
      ? String(doc.category).trim()
      : undefined;

  const resolvedCategory = resolveCategoryName(doc.category, categories);
  const rawHero = doc.heroImage?.trim() || "";
  const heroImage = rawHero.length > 0 ? rawHero : DEFAULT_SERVICE_FALLBACK_IMAGE;

  return {
    id: String(doc._id),
    title: doc.title || "Unnamed Service",
    slug: doc.slug || doc.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "service",
    category: resolvedCategory,
    category_id: rawCatId,
    summary: doc.summary || "",
    tagline: doc.tagline || (doc.summary ? doc.summary.slice(0, 80) : ""),
    hero_image: heroImage,
    related_images: Array.isArray(doc.relatedImages)
      ? doc.relatedImages.map((img) => ({
          url: img.url || DEFAULT_SERVICE_FALLBACK_IMAGE,
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
    upload_status: doc.uploadStatus || "success",
    created_at: doc.createdAt || new Date().toISOString(),
    updated_at: doc.updatedAt || new Date().toISOString(),
  };
}

export function extractServicesList(res: any): BackendServiceDoc[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.services)) return res.services;
  if (res.services && Array.isArray(res.services.services)) return res.services.services;
  if (res.data && Array.isArray(res.data.services)) return res.data.services;
  if (res.data && res.data.services && Array.isArray(res.data.services.services)) return res.data.services.services;
  if (Array.isArray(res.data)) return res.data;
  return [];
}

/**
 * 1. GET ALL SERVICES FOR VISITORS (PUBLIC ACTIVE SERVICES)
 * Endpoint: GET /api/v1/admin-panel/services/visitors/all
 * Query parameter: ?category=<categoryId> (optional)
 */
export async function getVisitorServicesApi(
  categoryId?: string,
  categories?: ServiceCategoryItem[],
): Promise<CompanyService[]> {
  try {
    const query =
      categoryId && categoryId.toLowerCase() !== "all"
        ? `?category=${encodeURIComponent(categoryId)}`
        : "";
    const res = await apiRequest<BackendServiceListResponse>(
      `/api/v1/admin-panel/services/visitors/all${query}`,
      { method: "GET" },
    );

    const list = extractServicesList(res);
    return list.map((doc) => normalizeBackendService(doc, categories));
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      console.warn("Failed to fetch visitor services from backend API:", err.message);
    }
    throw err;
  }
}

/**
 * 2. GET ALL SERVICES (ADMIN)
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

    const list = extractServicesList(res);
    return list.map((doc) => normalizeBackendService(doc, categories));
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

function parseJsonArrayField<T>(val: unknown, fallback: T[]): T[] {
  if (!val) return fallback;
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function normalizeProcessSteps(raw: any[]): Array<{ step: string; title: string; description: string }> {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, idx) => ({
      step: String(item?.step || item?.stepNumber || item?.step_number || idx + 1).padStart(2, "0"),
      title: String(item?.title || `Phase ${idx + 1}`).trim(),
      description: String(item?.description || "").trim(),
    }))
    .filter((s) => s.title.length > 0);
}

function normalizeBenefits(raw: any[]): Array<{ title: string; description: string; metric?: string }> {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => ({
      title: String(item?.title || "").trim(),
      description: String(item?.description || "").trim(),
      metric: item?.metric ? String(item.metric).trim() : undefined,
    }))
    .filter((b) => b.title.length > 0);
}

function normalizeFaqs(raw: any[]): Array<{ question: string; answer: string }> {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => ({
      question: String(item?.question || "").trim(),
      answer: String(item?.answer || "").trim(),
    }))
    .filter((f) => f.question.length > 0);
}

function normalizeStringList(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((s) => String(s).trim()).filter(Boolean);
      }
    } catch {}
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
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
    const rawTitle = payload.get("title");
    if (typeof rawTitle === "string" && !payload.get("slug")) {
      payload.set("slug", slugifyService(rawTitle));
    }
    body = payload;
  } else {
    const title = payload.title || "";
    const rawCat = payload.category;
    const tagline = payload.tagline?.trim() || undefined;
    const slug = payload.slug?.trim() || undefined;
    const summary = payload.summary?.trim() || undefined;
    const heroImage = payload.hero_image?.trim() || undefined;
    const relatedImages = payload.related_images || [];
    const whatIsIt = payload.what_is_it?.trim() || payload.summary?.trim() || undefined;
    const whoIsFor = payload.who_is_for?.trim() || undefined;
    const problemSolved = payload.problem_solved?.trim() || undefined;
    const whyItMatters = payload.why_it_matters?.trim() || undefined;
    const features = normalizeStringList(payload.features);
    const techStack = normalizeStringList(payload.tech_stack);
    const processSteps = normalizeProcessSteps(payload.process_steps || []);
    const benefits = normalizeBenefits(payload.benefits || []);
    const faqs = normalizeFaqs(payload.faqs || []);
    const orderIndex = Number(payload.order_index) || 1;
    const isFeatured = Boolean(payload.is_featured);
    const isActive = payload.is_active !== false;

    const categoryId = await resolveCategoryIdForPayload(rawCat, categories);

    const cleanSlug =
      slug ||
      title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") ||
      "service";

    const cleanPayload = {
      title: title.trim(),
      category: categoryId,
      tagline: tagline ? tagline.trim().slice(0, 100) : undefined,
      slug: cleanSlug,
      summary: summary ? summary.trim().slice(0, 200) : undefined,
      heroImage: heroImage && !heroImage.startsWith("blob:") ? heroImage.trim() : DEFAULT_SERVICE_FALLBACK_IMAGE,
      relatedImages,
      whatIsIt: whatIsIt ? whatIsIt.trim().slice(0, 500) : undefined,
      whoIsFor: whoIsFor ? whoIsFor.trim().slice(0, 500) : undefined,
      problemSolved: problemSolved ? problemSolved.trim().slice(0, 500) : undefined,
      whyItMatters: whyItMatters ? whyItMatters.trim().slice(0, 500) : undefined,
      features,
      processSteps,
      benefits,
      faqs,
      techStack,
      orderIndex: Math.max(1, orderIndex),
      isFeatured,
      isActive,
    };

    body = JSON.stringify(cleanPayload);
  }

  try {
    const isForm = typeof FormData !== "undefined" && body instanceof FormData;
    const res = await apiRequest<BackendServiceSingleResponse>(
      "/api/v1/admin-panel/services/create",
      {
        method: "POST",
        ...(isForm ? {} : { headers: { "Content-Type": "application/json" } }),
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
        selectedCategoryValue: rawCat,
        resolvedCategoryId: categoryId,
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

  const updateObj: Record<string, any> = {};

  if (payload instanceof FormData) {
    const rawCat = payload.get("category");
    if (typeof rawCat === "string") {
      const resolvedCatId = await resolveCategoryIdForPayload(rawCat, categories);
      payload.set("category", resolvedCatId);
    }
    const rawTitle = payload.get("title");
    if (typeof rawTitle === "string" && !payload.get("slug")) {
      payload.set("slug", slugifyService(rawTitle));
    }
  } else {
    if (payload.title !== undefined) updateObj.title = payload.title.trim();
    if (payload.category !== undefined) {
      updateObj.category = await resolveCategoryIdForPayload(payload.category, categories);
    }
    if (payload.tagline !== undefined && payload.tagline !== null) {
      updateObj.tagline = payload.tagline.trim().slice(0, 100);
    }
    if (payload.slug !== undefined && payload.slug !== null) updateObj.slug = payload.slug.trim();
    if (payload.summary !== undefined && payload.summary !== null) {
      updateObj.summary = payload.summary.trim().slice(0, 200);
    }
    if (payload.hero_image !== undefined && !payload.hero_image.startsWith("blob:")) {
      updateObj.heroImage = payload.hero_image.trim();
    }
    if (payload.related_images !== undefined) updateObj.relatedImages = payload.related_images;
    if (payload.what_is_it !== undefined) updateObj.whatIsIt = payload.what_is_it.trim().slice(0, 500);
    if (payload.who_is_for !== undefined) updateObj.whoIsFor = payload.who_is_for.trim().slice(0, 500);
    if (payload.problem_solved !== undefined) updateObj.problemSolved = payload.problem_solved.trim().slice(0, 500);
    if (payload.why_it_matters !== undefined) updateObj.whyItMatters = payload.why_it_matters.trim().slice(0, 500);
    if (payload.features !== undefined) updateObj.features = normalizeStringList(payload.features);
    if (payload.process_steps !== undefined) {
      updateObj.processSteps = normalizeProcessSteps(payload.process_steps);
    }
    if (payload.benefits !== undefined) updateObj.benefits = normalizeBenefits(payload.benefits);
    if (payload.faqs !== undefined) updateObj.faqs = normalizeFaqs(payload.faqs);
    if (payload.tech_stack !== undefined) updateObj.techStack = normalizeStringList(payload.tech_stack);
    if (payload.order_index !== undefined) updateObj.orderIndex = Math.max(1, Number(payload.order_index) || 1);
    if (payload.is_featured !== undefined) updateObj.isFeatured = Boolean(payload.is_featured);
    if (payload.is_active !== undefined) updateObj.isActive = Boolean(payload.is_active);
  }

  const isForm = typeof FormData !== "undefined" && payload instanceof FormData;
  const body = isForm ? payload : JSON.stringify(updateObj);

  try {
    const res = await apiRequest<BackendServiceSingleResponse>(
      `/api/v1/admin-panel/services/${encodeURIComponent(id)}/update`,
      {
        method: "PATCH",
        ...(isForm ? {} : { headers: { "Content-Type": "application/json" } }),
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
