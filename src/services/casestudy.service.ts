/**
 * DIMISI Admin — Case Study / Our Work & Products Express API Service
 * Handles Case Studies listing, creation, updates, toggling, and deletion
 * against the Express backend API (/api/v1/admin-panel/casestudy/*).
 */
import { apiRequest, ApiError } from "./apiClient";
import type { ProjectItem, ProjectInput, WorkCategoryItem, ProjectType } from "@/lib/work.shared";
import {
  getAllCasestudyCategoriesApi,
  createCasestudyCategoryApi,
  isMongoId,
} from "./casestudyCategory.service";

export interface BackendCasestudyDoc {
  _id: string;
  title: string;
  slug: string;
  category: string | { _id: string; name: string } | undefined;
  type: "work" | "product";
  tagline?: string;
  overview?: string;
  challenge?: string;
  solution?: string;
  outcome?: string;
  coverImage?: string;
  galleryImages?: Array<{
    url: string;
    caption?: string;
  }>;
  websiteUrl?: string;
  clientName?: string;
  timeline?: string;
  techStack?: string[];
  metrics?: Array<{
    label: string;
    value: string;
  }>;
  orderIndex: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendCasestudyListResponse {
  status: string;
  casestudies: BackendCasestudyDoc[];
}

export interface BackendCasestudySingleResponse {
  status: string;
  message?: string;
  data?: {
    casestudy: BackendCasestudyDoc;
  };
  casestudy?: BackendCasestudyDoc;
}

export const DEFAULT_CASESTUDY_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";

/**
 * Resolves category name from category ID or object against the given categories list.
 */
export function resolveCasestudyCategoryName(
  rawCat: string | { _id: string; name: string } | undefined,
  categories?: WorkCategoryItem[],
): string {
  if (!rawCat) return "Web Application";

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

  return catStr || "Web Application";
}

/**
 * Helper to resolve category ID from input category name/id.
 * Guarantees that the returned ID is ALWAYS a valid 24-character hex MongoDB ObjectId.
 */
export async function resolveCasestudyCategoryIdForPayload(
  categoryInput: string | undefined | null,
  categories?: WorkCategoryItem[],
): Promise<string> {
  if (!categoryInput) {
    categoryInput = "Web Application";
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
  let liveCats: WorkCategoryItem[] = [];
  try {
    liveCats = await getAllCasestudyCategoriesApi();
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
    console.warn("Could not load live case study categories for resolution:", err);
  }

  // 3. Category does not exist in backend MongoDB — auto-create it on backend!
  try {
    const createdCat = await createCasestudyCategoryApi({
      name: trimmed.length >= 5 ? trimmed : `${trimmed} App`,
      description: `Category for ${trimmed} projects and case studies`,
      displayOrder: (liveCats?.length || 0) + 1,
      status: "active",
    });
    if (createdCat && isMongoId(createdCat.id)) {
      return createdCat.id;
    }
  } catch (err) {
    console.warn("Auto-create case study category on backend failed:", err);
  }

  // 4. Fallback to any existing backend category if available
  if (liveCats && liveCats.length > 0) {
    const firstValid = liveCats.find((c) => isMongoId(c.id));
    if (firstValid) return firstValid.id;
  }

  return trimmed;
}

/**
 * Normalizes backend ICaseStudy document into the clean frontend ProjectItem model.
 */
export function normalizeBackendCasestudy(
  doc: BackendCasestudyDoc | null | undefined,
  categories?: WorkCategoryItem[],
): ProjectItem {
  if (!doc) {
    return {
      id: "proj-" + Date.now().toString(36),
      slug: "unnamed-project",
      title: "Unnamed Case Study",
      type: "work",
      category: "Web Application",
      tagline: "",
      overview: "",
      challenge: "",
      solution: "",
      outcome: "",
      cover_image: DEFAULT_CASESTUDY_FALLBACK_IMAGE,
      gallery_images: [],
      website_url: "",
      client_name: "",
      timeline: "",
      tech_stack: [],
      metrics: [],
      order_index: 1,
      is_featured: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const resolvedCategory = resolveCasestudyCategoryName(doc.category, categories);
  const rawCover = doc.coverImage?.trim() || "";
  const coverImage = rawCover.length > 0 ? rawCover : DEFAULT_CASESTUDY_FALLBACK_IMAGE;

  return {
    id: String(doc._id),
    slug:
      doc.slug ||
      doc.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
      "case-study",
    title: doc.title || "Unnamed Case Study",
    type: (doc.type === "product" ? "product" : "work") as ProjectType,
    category: resolvedCategory,
    tagline: doc.tagline || (doc.overview ? doc.overview.slice(0, 80) : ""),
    overview: doc.overview || "",
    challenge: doc.challenge || "",
    solution: doc.solution || "",
    outcome: doc.outcome || "",
    cover_image: coverImage,
    gallery_images: Array.isArray(doc.galleryImages)
      ? doc.galleryImages.map((img, idx) => ({
          url: img.url || DEFAULT_CASESTUDY_FALLBACK_IMAGE,
          caption: img.caption || `Visual ${idx + 1}`,
        }))
      : [],
    website_url: doc.websiteUrl || "",
    client_name: doc.clientName || "",
    timeline: doc.timeline || "",
    tech_stack: Array.isArray(doc.techStack) ? doc.techStack : [],
    metrics: Array.isArray(doc.metrics)
      ? doc.metrics.map((m) => ({ label: m.label || "", value: m.value || "" }))
      : [],
    order_index: typeof doc.orderIndex === "number" ? doc.orderIndex : 1,
    is_featured: Boolean(doc.isFeatured),
    is_active: doc.isActive !== false,
    created_at: doc.createdAt || new Date().toISOString(),
    updated_at: doc.updatedAt || new Date().toISOString(),
  };
}

/**
 * 1. GET ALL CASE STUDIES (ADMIN VIEW)
 * Endpoint: GET /api/v1/admin-panel/casestudy/all
 * Robust query handling to fetch all documents across categories and types.
 */
export async function getAllCasestudiesApi(
  filters?: { category?: string; type?: ProjectType },
  categories?: WorkCategoryItem[],
): Promise<ProjectItem[]> {
  try {
    let allCats = categories;
    if (!allCats || allCats.length === 0) {
      try {
        allCats = await getAllCasestudyCategoriesApi();
      } catch {}
    }

    // Direct fetch when both category and type are explicitly specified
    if (
      filters?.category &&
      filters.category.toLowerCase() !== "all" &&
      filters?.type &&
      filters.type !== ("all" as any)
    ) {
      const catId = await resolveCasestudyCategoryIdForPayload(filters.category, allCats);
      const res = await apiRequest<BackendCasestudyListResponse>(
        `/api/v1/admin-panel/casestudy/all?category=${encodeURIComponent(catId)}&type=${encodeURIComponent(filters.type)}`,
        { method: "GET" },
      );
      if (Array.isArray(res?.casestudies)) {
        return res.casestudies.map((doc) => normalizeBackendCasestudy(doc, allCats));
      }
      return [];
    }

    // Fetch across all configured categories and types in parallel
    const types: ProjectType[] =
      filters?.type && filters.type !== ("all" as any) ? [filters.type] : ["work", "product"];
    const targetCats =
      filters?.category && filters.category.toLowerCase() !== "all"
        ? (allCats || []).filter(
            (c) =>
              c.id === filters.category ||
              c.name.toLowerCase() === filters.category!.toLowerCase(),
          )
        : allCats || [];

    const fetchPromises: Promise<BackendCasestudyDoc[]>[] = [];

    // Base query
    fetchPromises.push(
      apiRequest<BackendCasestudyListResponse>("/api/v1/admin-panel/casestudy/all", { method: "GET" })
        .then((r) => (Array.isArray(r?.casestudies) ? r.casestudies : []))
        .catch(() => []),
    );

    for (const cat of targetCats) {
      for (const t of types) {
        fetchPromises.push(
          apiRequest<BackendCasestudyListResponse>(
            `/api/v1/admin-panel/casestudy/all?category=${encodeURIComponent(cat.id)}&type=${encodeURIComponent(t)}`,
            { method: "GET" },
          )
            .then((r) => (Array.isArray(r?.casestudies) ? r.casestudies : []))
            .catch(() => []),
        );
      }
    }

    const results = await Promise.all(fetchPromises);
    const seenIds = new Set<string>();
    const merged: BackendCasestudyDoc[] = [];

    for (const list of results) {
      for (const doc of list) {
        const id = String(doc._id);
        if (!seenIds.has(id)) {
          seenIds.add(id);
          merged.push(doc);
        }
      }
    }

    return merged
      .map((doc) => normalizeBackendCasestudy(doc, allCats))
      .sort((a, b) => a.order_index - b.order_index);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      console.warn("Failed to fetch all case studies from backend API:", err.message);
    }
    throw err;
  }
}

/**
 * 2. GET ACTIVE CASE STUDIES FOR VISITORS (PUBLIC VIEW)
 * Endpoint: GET /api/v1/admin-panel/casestudy/visitors/all
 */
export async function getActiveCasestudiesApi(
  filters?: { category?: string; type?: ProjectType },
  categories?: WorkCategoryItem[],
): Promise<ProjectItem[]> {
  try {
    let allCats = categories;
    if (!allCats || allCats.length === 0) {
      try {
        allCats = await getAllCasestudyCategoriesApi();
      } catch {}
    }

    if (
      filters?.category &&
      filters.category.toLowerCase() !== "all" &&
      filters?.type &&
      filters.type !== ("all" as any)
    ) {
      const catId = await resolveCasestudyCategoryIdForPayload(filters.category, allCats);
      const res = await apiRequest<BackendCasestudyListResponse>(
        `/api/v1/admin-panel/casestudy/visitors/all?category=${encodeURIComponent(catId)}&type=${encodeURIComponent(filters.type)}`,
        { method: "GET" },
      );
      if (Array.isArray(res?.casestudies)) {
        return res.casestudies.map((doc) => normalizeBackendCasestudy(doc, allCats));
      }
      return [];
    }

    const types: ProjectType[] =
      filters?.type && filters.type !== ("all" as any) ? [filters.type] : ["work", "product"];
    const targetCats =
      filters?.category && filters.category.toLowerCase() !== "all"
        ? (allCats || []).filter(
            (c) =>
              c.id === filters.category ||
              c.name.toLowerCase() === filters.category!.toLowerCase(),
          )
        : allCats || [];

    const fetchPromises: Promise<BackendCasestudyDoc[]>[] = [];

    fetchPromises.push(
      apiRequest<BackendCasestudyListResponse>("/api/v1/admin-panel/casestudy/visitors/all", { method: "GET" })
        .then((r) => (Array.isArray(r?.casestudies) ? r.casestudies : []))
        .catch(() => []),
    );

    for (const cat of targetCats) {
      for (const t of types) {
        fetchPromises.push(
          apiRequest<BackendCasestudyListResponse>(
            `/api/v1/admin-panel/casestudy/visitors/all?category=${encodeURIComponent(cat.id)}&type=${encodeURIComponent(t)}`,
            { method: "GET" },
          )
            .then((r) => (Array.isArray(r?.casestudies) ? r.casestudies : []))
            .catch(() => []),
        );
      }
    }

    const results = await Promise.all(fetchPromises);
    const seenIds = new Set<string>();
    const merged: BackendCasestudyDoc[] = [];

    for (const list of results) {
      for (const doc of list) {
        const id = String(doc._id);
        if (!seenIds.has(id)) {
          seenIds.add(id);
          merged.push(doc);
        }
      }
    }

    return merged
      .map((doc) => normalizeBackendCasestudy(doc, allCats))
      .sort((a, b) => a.order_index - b.order_index);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      console.warn("Failed to fetch active visitor case studies from backend API:", err.message);
    }
    throw err;
  }
}

/**
 * 3. GET CASE STUDY BY ID
 * Endpoint: GET /api/v1/admin-panel/casestudy/:id
 */
export async function getCasestudyByIdApi(
  id: string,
  categories?: WorkCategoryItem[],
): Promise<ProjectItem> {
  if (!id) throw new Error("Case study ID is required.");

  const res = await apiRequest<BackendCasestudySingleResponse>(
    `/api/v1/admin-panel/casestudy/${encodeURIComponent(id)}`,
    { method: "GET" },
  );

  const doc = res?.data?.casestudy || res?.casestudy;
  if (!doc) throw new Error(res?.message || "Case study not found.");

  return normalizeBackendCasestudy(doc, categories);
}

/**
 * Formats website URL to ensure it starts with http:// or https://
 */
function ensureHttpUrl(url?: string): string {
  if (!url || !url.trim()) return "https://dimisi.com";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Creates clean slug from title string
 */
function createSafeSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * 4. CREATE CASE STUDY
 * Endpoint: POST /api/v1/admin-panel/casestudy/create
 */
export async function createCasestudyApi(
  payload: ProjectInput | FormData,
  categories?: WorkCategoryItem[],
): Promise<ProjectItem> {
  let body: any;

  if (payload instanceof FormData) {
    const rawCat = payload.get("category");
    if (typeof rawCat === "string") {
      const resolvedId = await resolveCasestudyCategoryIdForPayload(rawCat, categories);
      payload.set("category", resolvedId);
    }
    const rawTitle = payload.get("title");
    if (typeof rawTitle === "string" && !payload.get("slug")) {
      payload.set("slug", createSafeSlug(rawTitle));
    }
    body = payload;
  } else {
    const categoryId = await resolveCasestudyCategoryIdForPayload(payload.category, categories);
    const validWebsiteUrl = ensureHttpUrl(payload.website_url);
    const validClientName =
      payload.client_name?.trim() || (payload.type === "product" ? "DIMISI Labs" : "Client Partner");
    const validTimeline = payload.timeline?.trim() || "4 Weeks Sprint";
    const validTagline =
      payload.tagline?.trim() ||
      payload.overview.trim().slice(0, 100) ||
      "Digital Platform Architecture";
    const cleanSlug =
      payload.slug?.trim() || createSafeSlug(payload.title);

    const formattedGallery = (payload.gallery_images || []).map((img, idx) => ({
      url: img.url || DEFAULT_CASESTUDY_FALLBACK_IMAGE,
      caption: img.caption?.trim() || `Showcase visual ${idx + 1}`,
    }));

    body = JSON.stringify({
      title: payload.title.trim(),
      slug: cleanSlug,
      category: categoryId,
      type: payload.type,
      tagline: validTagline,
      overview: payload.overview.trim(),
      challenge: payload.challenge.trim(),
      solution: payload.solution.trim(),
      outcome: payload.outcome.trim(),
      coverImage: payload.cover_image?.trim() || "",
      galleryImages: formattedGallery,
      galleryImageDetails: formattedGallery,
      websiteUrl: validWebsiteUrl,
      clientName: validClientName,
      timeline: validTimeline,
      techStack: payload.tech_stack || [],
      metrics: payload.metrics || [],
      orderIndex: Number(payload.order_index) || 1,
      isFeatured: Boolean(payload.is_featured),
      isActive: payload.is_active !== false,
    });
  }

  try {
    const res = await apiRequest<BackendCasestudySingleResponse>(
      "/api/v1/admin-panel/casestudy/create",
      {
        method: "POST",
        body,
      },
    );

    const doc = res?.casestudy || res?.data?.casestudy;
    if (!doc) {
      throw new Error(res?.message || "Failed to create case study.");
    }

    return normalizeBackendCasestudy(doc, categories);
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 400) {
      console.error("[Casestudy Create 400 Error Context]", {
        selectedCategory: payload instanceof FormData ? payload.get("category") : payload.category,
        errorMessage: err.message,
      });
    }
    throw err;
  }
}

/**
 * 5. UPDATE CASE STUDY
 * Endpoint: PATCH /api/v1/admin-panel/casestudy/:id/update
 */
export async function updateCasestudyApi(
  id: string,
  payload: Partial<ProjectInput> | FormData,
  categories?: WorkCategoryItem[],
): Promise<ProjectItem> {
  if (!id) throw new Error("Case study ID is required for update.");

  let body: any;

  if (payload instanceof FormData) {
    const rawCat = payload.get("category");
    if (typeof rawCat === "string") {
      const resolvedId = await resolveCasestudyCategoryIdForPayload(rawCat, categories);
      payload.set("category", resolvedId);
    }
    body = payload;
  } else {
    const updateObj: Record<string, any> = {};
    if (payload.title !== undefined) updateObj.title = payload.title.trim();
    if (payload.slug !== undefined) updateObj.slug = payload.slug.trim();
    else if (payload.title !== undefined) updateObj.slug = createSafeSlug(payload.title);
    if (payload.type !== undefined) updateObj.type = payload.type;
    if (payload.category !== undefined) {
      updateObj.category = await resolveCasestudyCategoryIdForPayload(payload.category, categories);
    }
    if (payload.tagline !== undefined) updateObj.tagline = payload.tagline.trim();
    if (payload.overview !== undefined) updateObj.overview = payload.overview.trim();
    if (payload.challenge !== undefined) updateObj.challenge = payload.challenge.trim();
    if (payload.solution !== undefined) updateObj.solution = payload.solution.trim();
    if (payload.outcome !== undefined) updateObj.outcome = payload.outcome.trim();
    if (payload.cover_image !== undefined) {
      updateObj.coverImage = payload.cover_image.trim();
      updateObj.existingCoverImage = payload.cover_image.trim();
    }
    if (payload.gallery_images !== undefined) {
      const formattedGallery = payload.gallery_images.map((img, idx) => ({
        url: img.url || DEFAULT_CASESTUDY_FALLBACK_IMAGE,
        caption: img.caption?.trim() || `Showcase visual ${idx + 1}`,
      }));
      updateObj.galleryImages = formattedGallery;
      updateObj.existingGalleryImages = formattedGallery;
    }
    if (payload.website_url !== undefined) {
      updateObj.websiteUrl = ensureHttpUrl(payload.website_url);
    }
    if (payload.client_name !== undefined) {
      updateObj.clientName = payload.client_name.trim();
    }
    if (payload.timeline !== undefined) {
      updateObj.timeline = payload.timeline.trim();
    }
    if (payload.tech_stack !== undefined) updateObj.techStack = payload.tech_stack;
    if (payload.metrics !== undefined) updateObj.metrics = payload.metrics;
    if (payload.order_index !== undefined) updateObj.orderIndex = Number(payload.order_index);
    if (payload.is_featured !== undefined) updateObj.isFeatured = Boolean(payload.is_featured);
    if (payload.is_active !== undefined) updateObj.isActive = Boolean(payload.is_active);

    body = JSON.stringify(updateObj);
  }

  try {
    const res = await apiRequest<BackendCasestudySingleResponse>(
      `/api/v1/admin-panel/casestudy/${encodeURIComponent(id)}/update`,
      {
        method: "PATCH",
        body,
      },
    );

    const doc = res?.data?.casestudy || res?.casestudy;
    if (!doc) {
      throw new Error(res?.message || "Failed to update case study.");
    }

    return normalizeBackendCasestudy(doc, categories);
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 400) {
      console.error("[Casestudy Update 400 Error Context]", {
        casestudyId: id,
        errorMessage: err.message,
      });
    }
    throw err;
  }
}

/**
 * 6. DELETE CASE STUDY
 * Endpoint: DELETE /api/v1/admin-panel/casestudy/:id/delete
 */
export async function deleteCasestudyApi(id: string): Promise<boolean> {
  if (!id) throw new Error("Case study ID is required for deletion.");

  await apiRequest<void>(
    `/api/v1/admin-panel/casestudy/${encodeURIComponent(id)}/delete`,
    {
      method: "DELETE",
    },
  );

  return true;
}

/**
 * 7. TOGGLE CASE STUDY ACTIVATION
 * Endpoint: PATCH /api/v1/admin-panel/casestudy/:id/toggle-activation
 */
export async function toggleCasestudyActivationApi(
  id: string,
  categories?: WorkCategoryItem[],
): Promise<ProjectItem> {
  if (!id) throw new Error("Case study ID is required.");

  const res = await apiRequest<BackendCasestudySingleResponse>(
    `/api/v1/admin-panel/casestudy/${encodeURIComponent(id)}/toggle-activation`,
    {
      method: "PATCH",
    },
  );

  const doc = res?.data?.casestudy || res?.casestudy;
  if (!doc) throw new Error(res?.message || "Failed to toggle case study activation.");

  return normalizeBackendCasestudy(doc, categories);
}

/**
 * 8. TOGGLE CASE STUDY FEATURED STATUS
 * Endpoint: PATCH /api/v1/admin-panel/casestudy/:id/toggle-featured
 */
export async function toggleCasestudyFeaturedApi(
  id: string,
  categories?: WorkCategoryItem[],
): Promise<ProjectItem> {
  if (!id) throw new Error("Case study ID is required.");

  const res = await apiRequest<BackendCasestudySingleResponse>(
    `/api/v1/admin-panel/casestudy/${encodeURIComponent(id)}/toggle-featured`,
    {
      method: "PATCH",
    },
  );

  const doc = res?.data?.casestudy || res?.casestudy;
  if (!doc) throw new Error(res?.message || "Failed to toggle case study featured status.");

  return normalizeBackendCasestudy(doc, categories);
}
