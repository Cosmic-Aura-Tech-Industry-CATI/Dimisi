/**
 * DIMISI Technologies — Client-Side Work & Projects Functions
 * Backed by live Express Backend APIs (/api/v1/admin-panel/casestudy/*)
 * with robust in-memory synchronization and fallback integrity.
 */
import { workStore } from "./work.data";
import {
  type ProjectItem,
  type ProjectInput,
  type PublicWorkPayload,
  type WorkCategoryItem,
  type WorkCategoryInput,
  validateProjectInput,
  validateWorkCategoryInput,
} from "./work.shared";

import {
  getAllCasestudyCategoriesApi,
  createCasestudyCategoryApi,
  updateCasestudyCategoryApi,
  deleteCasestudyCategoryApi,
  isMongoId,
} from "@/services/casestudyCategory.service";

import {
  getAllCasestudiesApi,
  getActiveCasestudiesApi,
  getCasestudyByIdApi,
  createCasestudyApi,
  updateCasestudyApi,
  deleteCasestudyApi,
  toggleCasestudyActivationApi,
  toggleCasestudyFeaturedApi,
} from "@/services/casestudy.service";

/**
 * 1. GET PUBLIC WORK DATA
 * Fetches active case studies & categories for public visitors
 */
export async function getPublicWorkData(): Promise<PublicWorkPayload> {
  let catItems: WorkCategoryItem[] = [];

  try {
    const remoteCats = await getAllCasestudyCategoriesApi();
    if (Array.isArray(remoteCats)) {
      catItems = remoteCats;
      workStore.setCategories(remoteCats);
    }
  } catch (err) {
    console.warn("Could not fetch remote case study categories for public site:", err);
  }

  try {
    const remoteProjects = await getActiveCasestudiesApi(undefined, catItems);
    if (Array.isArray(remoteProjects)) {
      workStore.setProjects(remoteProjects);
    }
  } catch (err) {
    console.warn("Could not fetch remote active case studies for public site:", err);
  }

  return workStore.getPublicPayload();
}

/**
 * 2. GET PROJECT BY SLUG
 * Fetches single case study by its URL slug or ID
 */
export async function getProjectBySlug({
  data,
}: {
  data: { slug: string };
}): Promise<ProjectItem | null> {
  if (!data?.slug) return null;

  const existing = workStore.getProjectBySlug(data.slug);
  if (existing) return existing;

  // If not in local memory, fetch latest from backend
  try {
    const catItems = workStore.getCategoryItems();
    const remoteProjects = await getActiveCasestudiesApi(undefined, catItems);
    if (Array.isArray(remoteProjects)) {
      workStore.setProjects(remoteProjects);
      const found = workStore.getProjectBySlug(data.slug);
      if (found) return found;
    }
  } catch (err) {
    console.warn("Could not fetch case study by slug from backend:", err);
  }

  // Fallback: If slug is a Mongo ObjectId, try direct ID lookup
  if (isMongoId(data.slug)) {
    try {
      const catItems = workStore.getCategoryItems();
      const direct = await getCasestudyByIdApi(data.slug, catItems);
      if (direct && direct.is_active) {
        return direct;
      }
    } catch (err) {
      console.warn("Could not fetch case study by ID directly from backend:", err);
    }
  }

  return null;
}

/**
 * 3. GET ADMIN WORK DATA
 * Fetches all case studies, categories, and dynamic counts for Admin Control Room
 */
export async function getAdminWorkData(): Promise<{
  projects: ProjectItem[];
  stats: PublicWorkPayload["stats"];
  categoryItems: WorkCategoryItem[];
  categoryCounts: Record<string, number>;
}> {
  let catItems = workStore.getCategoryItems();

  try {
    const apiCats = await getAllCasestudyCategoriesApi();
    if (Array.isArray(apiCats) && apiCats.length > 0) {
      catItems = apiCats;
      workStore.setCategories(apiCats);
    }
  } catch (err) {
    console.warn("Could not fetch remote case study categories for admin panel:", err);
  }

  let projectsList = workStore.getAllProjects();

  try {
    const apiProjects = await getAllCasestudiesApi(undefined, catItems);
    if (Array.isArray(apiProjects) && apiProjects.length > 0) {
      projectsList = apiProjects;
      workStore.setProjects(apiProjects);
    }
  } catch (err) {
    console.warn("Could not fetch remote case studies for admin panel:", err);
  }

  const payload = workStore.getPublicPayload();

  return {
    projects: projectsList,
    stats: payload.stats,
    categoryItems: catItems,
    categoryCounts: workStore.getCategoryProjectCounts(),
  };
}

/**
 * 4. GET WORK CATEGORIES
 */
export async function getWorkCategoriesFn(): Promise<{
  categories: WorkCategoryItem[];
  counts: Record<string, number>;
}> {
  let catItems = workStore.getCategoryItems();
  try {
    const apiCats = await getAllCasestudyCategoriesApi();
    if (Array.isArray(apiCats) && apiCats.length > 0) {
      catItems = apiCats;
      workStore.setCategories(apiCats);
    }
  } catch (err) {
    console.warn("Could not fetch case study categories from backend API:", err);
  }

  return {
    categories: catItems,
    counts: workStore.getCategoryProjectCounts(),
  };
}

/**
 * 5. SAVE WORK CATEGORY (CREATE / UPDATE)
 */
export async function saveWorkCategoryFn({
  data,
}: {
  data: WorkCategoryInput;
}): Promise<{
  success: boolean;
  category?: WorkCategoryItem | undefined;
  error?: string | undefined;
}> {
  const check = validateWorkCategoryInput(data);
  if (!check.valid) {
    return { success: false, error: check.error || "Invalid category input." };
  }

  let remoteSaved: WorkCategoryItem | null = null;
  let apiError: string | null = null;

  try {
    if (data.id && isMongoId(data.id)) {
      remoteSaved = await updateCasestudyCategoryApi(data.id, {
        name: data.name,
        description: data.description,
        displayOrder: data.order_index ?? 1,
        status: data.status ?? "active",
      });
    } else {
      let existingRemoteId: string | null = null;
      try {
        const currentCats = await getAllCasestudyCategoriesApi();
        const found = currentCats.find(
          (c) =>
            c.name.toLowerCase() === data.name.trim().toLowerCase() ||
            (data.id && c.id === data.id),
        );
        if (found && isMongoId(found.id)) {
          existingRemoteId = found.id;
        }
      } catch {}

      if (existingRemoteId) {
        remoteSaved = await updateCasestudyCategoryApi(existingRemoteId, {
          name: data.name,
          description: data.description,
          displayOrder: data.order_index ?? 1,
          status: data.status ?? "active",
        });
      } else {
        remoteSaved = await createCasestudyCategoryApi({
          name: data.name,
          description: data.description,
          displayOrder: data.order_index ?? (workStore.getCategoryItems().length + 1),
          status: data.status ?? "active",
          slug: data.slug,
        });
      }
    }
  } catch (err: unknown) {
    console.warn("Backend save case study category failed:", err);
    apiError = err instanceof Error ? err.message : "Backend update failed.";
  }

  const savedItem = workStore.saveCategory({
    id: remoteSaved?.id || data.id,
    name: data.name,
    slug: remoteSaved?.slug || data.slug,
    description: data.description,
    status: data.status,
    order_index: data.order_index,
  });

  return {
    success: !apiError,
    category: remoteSaved || savedItem,
    error: apiError || undefined,
  };
}

/**
 * 6. DELETE WORK CATEGORY
 */
export async function deleteWorkCategoryFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; projectCount?: number | undefined; error?: string | undefined }> {
  if (!data?.id) return { success: false, error: "Category ID is required." };

  let apiError: string | null = null;
  try {
    if (isMongoId(data.id)) {
      await deleteCasestudyCategoryApi(data.id);
    } else {
      try {
        const currentCats = await getAllCasestudyCategoriesApi();
        const localCat = workStore.getCategoryItems().find((c) => c.id === data.id);
        if (localCat) {
          const found = currentCats.find(
            (c) => c.name.toLowerCase() === localCat.name.toLowerCase(),
          );
          if (found && isMongoId(found.id)) {
            await deleteCasestudyCategoryApi(found.id);
          }
        }
      } catch {}
    }
  } catch (err: unknown) {
    console.warn("Backend delete case study category warning:", err);
    apiError = err instanceof Error ? err.message : "Failed to delete category.";
  }

  const res = workStore.deleteCategory(data.id);
  return { success: !apiError, projectCount: res.projectCount, error: apiError || undefined };
}

/**
 * 7. SAVE PROJECT / CASE STUDY (CREATE / UPDATE)
 */
export async function saveProjectFn({
  data,
}: {
  data: ProjectInput;
}): Promise<{ success: boolean; project?: ProjectItem; error?: string }> {
  try {
    const validation = validateProjectInput(data);
    if (!validation.valid) {
      return { success: false, error: validation.error || "Validation failed." };
    }

    const categories = workStore.getCategoryItems();
    let remoteSaved: ProjectItem | null = null;
    let apiError: string | null = null;

    try {
      if (data.id && isMongoId(data.id)) {
        remoteSaved = await updateCasestudyApi(data.id, data, categories);
      } else {
        // Check if an existing project with this title or ID exists on backend
        let existingRemoteId: string | null = null;
        try {
          const allRemote = await getAllCasestudiesApi(undefined, categories);
          const found = allRemote.find(
            (p) =>
              p.title.toLowerCase() === data.title.trim().toLowerCase() ||
              (data.id && p.id === data.id),
          );
          if (found && isMongoId(found.id)) {
            existingRemoteId = found.id;
          }
        } catch {}

        if (existingRemoteId) {
          remoteSaved = await updateCasestudyApi(existingRemoteId, data, categories);
        } else {
          remoteSaved = await createCasestudyApi(data, categories);
        }
      }
    } catch (err: unknown) {
      console.warn("Backend save case study failed:", err);
      apiError = err instanceof Error ? err.message : "Backend update failed.";
    }

    // Update in-memory store
    const localSaved = workStore.saveProject({
      ...data,
      id: remoteSaved?.id || data.id,
      slug: remoteSaved?.slug || data.slug,
    });

    return {
      success: !apiError,
      project: remoteSaved || localSaved,
      error: apiError || undefined,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save case study.",
    };
  }
}

/**
 * 8. DELETE PROJECT / CASE STUDY
 */
export async function deleteProjectFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!data?.id) return { success: false, error: "Case study ID is required." };

    let apiError: string | null = null;

    try {
      if (isMongoId(data.id)) {
        await deleteCasestudyApi(data.id);
      } else {
        try {
          const allRemote = await getAllCasestudiesApi();
          const localItem = workStore.getProjectById(data.id);
          if (localItem) {
            const found = allRemote.find(
              (p) => p.title.toLowerCase() === localItem.title.toLowerCase(),
            );
            if (found && isMongoId(found.id)) {
              await deleteCasestudyApi(found.id);
            }
          }
        } catch {}
      }
    } catch (err: unknown) {
      console.warn("Backend delete case study failed:", err);
      apiError = err instanceof Error ? err.message : "Failed to delete case study.";
    }

    const ok = workStore.deleteProject(data.id);
    return { success: ok && !apiError, error: apiError || undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete case study.",
    };
  }
}

/**
 * 9. TOGGLE PROJECT ACTIVATION
 */
export async function toggleProjectActivationFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; project?: ProjectItem; error?: string }> {
  try {
    if (!data?.id) return { success: false, error: "Case study ID is required." };

    const categories = workStore.getCategoryItems();
    let updated: ProjectItem | null = null;

    if (isMongoId(data.id)) {
      updated = await toggleCasestudyActivationApi(data.id, categories);
    } else {
      const existing = workStore.getProjectById(data.id);
      if (existing) {
        return await saveProjectFn({
          data: {
            ...existing,
            is_active: !existing.is_active,
          },
        });
      }
    }

    if (updated) {
      workStore.saveProject(updated);
      return { success: true, project: updated };
    }

    return { success: false, error: "Case study not found." };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle activation.",
    };
  }
}

/**
 * 10. TOGGLE PROJECT FEATURED STATUS
 */
export async function toggleProjectFeaturedFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; project?: ProjectItem; error?: string }> {
  try {
    if (!data?.id) return { success: false, error: "Case study ID is required." };

    const categories = workStore.getCategoryItems();
    let updated: ProjectItem | null = null;

    if (isMongoId(data.id)) {
      updated = await toggleCasestudyFeaturedApi(data.id, categories);
    } else {
      const existing = workStore.getProjectById(data.id);
      if (existing) {
        return await saveProjectFn({
          data: {
            ...existing,
            is_featured: !existing.is_featured,
          },
        });
      }
    }

    if (updated) {
      workStore.saveProject(updated);
      return { success: true, project: updated };
    }

    return { success: false, error: "Case study not found." };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle featured status.",
    };
  }
}
