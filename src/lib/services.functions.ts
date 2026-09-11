/**
 * DIMISI Technologies — Client-Side & Admin API Services Functions
 * Integrates live Express backend endpoints for Services and Service Categories.
 */
import { servicesStore } from "./services.data";
import {
  type CompanyService,
  type IndustrySector,
  type ServiceCategoryItem,
  type ServiceCategoryInput,
  type PublicServicesPayload,
  type ServiceInput,
  type IndustryInput,
  validateServiceInput,
  validateIndustryInput,
  validateServiceCategoryInput,
} from "./services.shared";
import {
  getAllServiceCategoriesApi,
  createServiceCategoryApi,
  updateServiceCategoryApi,
  deleteServiceCategoryApi,
} from "../services/serviceCategory.service";
import {
  getAllServicesApi,
  getServiceByIdApi,
  createServiceApi,
  updateServiceApi,
  deleteServiceApi,
  toggleServiceActivationApi,
  toggleServiceFeaturedApi,
  isMongoId,
} from "../services/service.service";

export { isMongoId };

export async function getPublicServicesData(): Promise<PublicServicesPayload> {
  let catItems = servicesStore.categoryItems;
  try {
    const apiCats = await getAllServiceCategoriesApi();
    if (apiCats && apiCats.length > 0) {
      catItems = apiCats;
      servicesStore.setCategories(apiCats);
    }
  } catch {
    // Fallback to local store
  }

  try {
    const remoteServices = await getAllServicesApi(undefined, catItems);
    if (Array.isArray(remoteServices) && remoteServices.length > 0) {
      servicesStore.setServices(remoteServices);
    }
  } catch {
    // Fallback to local store
  }

  const activeCats = catItems.filter((c) => c.status === "active");
  const basePayload = servicesStore.getPublicPayload();
  return {
    ...basePayload,
    categories: activeCats.map((c) => c.name),
    categoryItems: activeCats,
  };
}

export async function getServiceBySlug({
  data,
}: {
  data: { slug: string };
}): Promise<CompanyService | null> {
  if (!data.slug) return null;
  return servicesStore.getServiceBySlug(data.slug);
}

export async function getServiceCategoriesFn(): Promise<{
  categories: ServiceCategoryItem[];
  counts: Record<string, number>;
}> {
  try {
    const apiCats = await getAllServiceCategoriesApi();
    if (Array.isArray(apiCats)) {
      servicesStore.setCategories(apiCats);
      const localCounts = servicesStore.getCategoryServiceCounts();
      const mergedCounts: Record<string, number> = { ...localCounts };
      apiCats.forEach((c) => {
        if (typeof c.total_service_count === "number") {
          mergedCounts[c.name] = c.total_service_count;
          mergedCounts[c.name.toLowerCase()] = c.total_service_count;
        }
      });
      return {
        categories: apiCats,
        counts: mergedCounts,
      };
    }
  } catch (err) {
    console.warn("Falling back to local service categories:", err);
  }

  return {
    categories: servicesStore.categoryItems,
    counts: servicesStore.getCategoryServiceCounts(),
  };
}

export async function saveServiceCategoryFn({
  data,
}: {
  data: ServiceCategoryInput;
}): Promise<{
  success: boolean;
  category?: ServiceCategoryItem | undefined;
  error?: string | undefined;
}> {
  const check = validateServiceCategoryInput(data);
  if (!check.valid) {
    return { success: false, error: check.error || "Invalid category input." };
  }

  let remoteSaved: ServiceCategoryItem | null = null;
  let apiError: string | null = null;

  // 1. Try to persist to the Express Backend API
  try {
    if (data.id && isMongoId(data.id)) {
      remoteSaved = await updateServiceCategoryApi(data.id, {
        name: data.name,
        slug: data.slug,
        description: data.description,
        displayOrder: data.order_index ?? 1,
        status: data.status ?? "active",
      });
    } else {
      let existingRemoteId: string | null = null;
      try {
        const currentCats = await getAllServiceCategoriesApi();
        const found = currentCats.find(
          (c) => c.name.toLowerCase() === data.name.trim().toLowerCase() || (data.id && c.id === data.id),
        );
        if (found && isMongoId(found.id)) {
          existingRemoteId = found.id;
        }
      } catch {}

      if (existingRemoteId) {
        remoteSaved = await updateServiceCategoryApi(existingRemoteId, {
          name: data.name,
          slug: data.slug,
          description: data.description,
          displayOrder: data.order_index ?? 1,
          status: data.status ?? "active",
        });
      } else {
        remoteSaved = await createServiceCategoryApi({
          name: data.name,
          slug: data.slug,
          description: data.description,
          displayOrder: data.order_index ?? (servicesStore.categoryItems.length + 1),
          status: data.status ?? "active",
        });
      }
    }
  } catch (err: unknown) {
    console.warn("Backend save category failed:", err);
    apiError = err instanceof Error ? err.message : "Backend update failed.";
  }

  // 2. Update local store & persistent localStorage
  const savedItem = servicesStore.saveCategory({
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

export async function deleteServiceCategoryFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; error?: string | undefined }> {
  if (!data.id) return { success: false, error: "Category ID is required." };

  let apiError: string | null = null;
  try {
    if (isMongoId(data.id)) {
      await deleteServiceCategoryApi(data.id);
    } else {
      try {
        const currentCats = await getAllServiceCategoriesApi();
        const localCat = servicesStore.categoryItems.find((c) => c.id === data.id);
        if (localCat) {
          const found = currentCats.find((c) => c.name.toLowerCase() === localCat.name.toLowerCase());
          if (found && isMongoId(found.id)) {
            await deleteServiceCategoryApi(found.id);
          }
        }
      } catch {}
    }
  } catch (err: unknown) {
    console.warn("Backend delete category warning:", err);
    apiError = err instanceof Error ? err.message : "Failed to delete category.";
  }

  servicesStore.deleteCategory(data.id);
  return { success: !apiError, error: apiError || undefined };
}

export async function getAdminServicesData(): Promise<{
  services: CompanyService[];
  industries: IndustrySector[];
  categories: string[];
  categoryItems: ServiceCategoryItem[];
  categoryCounts: Record<string, number>;
}> {
  let catItems = servicesStore.categoryItems;

  try {
    const apiCats = await getAllServiceCategoriesApi();
    if (apiCats && apiCats.length > 0) {
      catItems = apiCats;
      servicesStore.setCategories(apiCats);
    }
  } catch (err) {
    console.warn("Could not fetch remote service categories for admin panel:", err);
  }

  let servicesList = servicesStore.services;
  try {
    const remoteServices = await getAllServicesApi(undefined, catItems);
    if (Array.isArray(remoteServices)) {
      servicesList = remoteServices;
      servicesStore.setServices(remoteServices);
    }
  } catch (err) {
    console.warn("Could not fetch remote services for admin panel:", err);
  }

  const activeCategories = catItems.filter((c) => c.status === "active").map((c) => c.name);
  const localCounts = servicesStore.getCategoryServiceCounts();
  const mergedCounts: Record<string, number> = { ...localCounts };
  catItems.forEach((c) => {
    if (typeof c.total_service_count === "number") {
      mergedCounts[c.name] = c.total_service_count;
      mergedCounts[c.name.toLowerCase()] = c.total_service_count;
    }
  });

  return {
    services: servicesList,
    industries: servicesStore.industries,
    categories: activeCategories,
    categoryItems: catItems,
    categoryCounts: mergedCounts,
  };
}

export async function saveServiceFn({
  data,
}: {
  data: ServiceInput;
}): Promise<{
  success: boolean;
  service?: CompanyService | undefined;
  error?: string | undefined;
}> {
  const check = validateServiceInput(data);
  if (!check.valid) {
    return { success: false, error: check.error || "Invalid service input." };
  }

  let remoteSaved: CompanyService | null = null;
  let apiError: string | null = null;

  try {
    const catItems = servicesStore.categoryItems;
    if (data.id && isMongoId(data.id)) {
      remoteSaved = await updateServiceApi(data.id, data, catItems);
    } else {
      remoteSaved = await createServiceApi(data, catItems);
    }
  } catch (err: unknown) {
    console.warn("Backend save service failed:", err);
    apiError = err instanceof Error ? err.message : "Failed to save service.";
  }

  const saved = servicesStore.saveService({
    ...data,
    id: remoteSaved?.id || data.id,
    slug: remoteSaved?.slug || data.slug,
    hero_image: remoteSaved?.hero_image || data.hero_image,
    related_images: remoteSaved?.related_images || data.related_images,
  });

  return {
    success: !apiError,
    service: remoteSaved || saved,
    error: apiError || undefined,
  };
}

export async function deleteServiceFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; error?: string | undefined }> {
  if (!data.id) return { success: false, error: "Service ID is required." };

  let apiError: string | null = null;
  try {
    if (isMongoId(data.id)) {
      await deleteServiceApi(data.id);
    }
  } catch (err: unknown) {
    console.warn("Backend delete service failed:", err);
    apiError = err instanceof Error ? err.message : "Failed to delete service.";
  }

  servicesStore.deleteService(data.id);
  return { success: !apiError, error: apiError || undefined };
}

export async function toggleServiceActivationFn({
  data,
}: {
  data: { id: string };
}): Promise<{
  success: boolean;
  service?: CompanyService | undefined;
  error?: string | undefined;
}> {
  if (!data.id) return { success: false, error: "Service ID is required." };

  try {
    if (isMongoId(data.id)) {
      const updated = await toggleServiceActivationApi(data.id, servicesStore.categoryItems);
      servicesStore.saveService({
        id: updated.id,
        title: updated.title,
        slug: updated.slug,
        category: updated.category,
        tagline: updated.tagline,
        summary: updated.summary,
        hero_image: updated.hero_image,
        related_images: updated.related_images,
        what_is_it: updated.what_is_it,
        who_is_for: updated.who_is_for,
        problem_solved: updated.problem_solved,
        why_it_matters: updated.why_it_matters,
        features: updated.features,
        process_steps: updated.process_steps,
        benefits: updated.benefits,
        faqs: updated.faqs,
        tech_stack: updated.tech_stack,
        order_index: updated.order_index,
        is_featured: updated.is_featured,
        is_active: updated.is_active,
      });
      return { success: true, service: updated };
    }
  } catch (err: unknown) {
    console.warn("Backend toggle service activation failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle activation status.",
    };
  }

  const srv = servicesStore.services.find((s) => s.id === data.id);
  if (srv) {
    const updated = servicesStore.saveService({ ...srv, is_active: !srv.is_active });
    return { success: true, service: updated };
  }
  return { success: false, error: "Service not found." };
}

export async function toggleServiceFeaturedFn({
  data,
}: {
  data: { id: string };
}): Promise<{
  success: boolean;
  service?: CompanyService | undefined;
  error?: string | undefined;
}> {
  if (!data.id) return { success: false, error: "Service ID is required." };

  try {
    if (isMongoId(data.id)) {
      const updated = await toggleServiceFeaturedApi(data.id, servicesStore.categoryItems);
      servicesStore.saveService({
        id: updated.id,
        title: updated.title,
        slug: updated.slug,
        category: updated.category,
        tagline: updated.tagline,
        summary: updated.summary,
        hero_image: updated.hero_image,
        related_images: updated.related_images,
        what_is_it: updated.what_is_it,
        who_is_for: updated.who_is_for,
        problem_solved: updated.problem_solved,
        why_it_matters: updated.why_it_matters,
        features: updated.features,
        process_steps: updated.process_steps,
        benefits: updated.benefits,
        faqs: updated.faqs,
        tech_stack: updated.tech_stack,
        order_index: updated.order_index,
        is_featured: updated.is_featured,
        is_active: updated.is_active,
      });
      return { success: true, service: updated };
    }
  } catch (err: unknown) {
    console.warn("Backend toggle service featured failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle featured status.",
    };
  }

  const srv = servicesStore.services.find((s) => s.id === data.id);
  if (srv) {
    const updated = servicesStore.saveService({ ...srv, is_featured: !srv.is_featured });
    return { success: true, service: updated };
  }
  return { success: false, error: "Service not found." };
}

export async function saveIndustryFn({
  data,
}: {
  data: IndustryInput;
}): Promise<{
  success: boolean;
  industry?: IndustrySector | undefined;
  error?: string | undefined;
}> {
  const check = validateIndustryInput(data);
  if (!check.valid) {
    return { success: false, error: check.error || "Invalid industry input." };
  }

  const saved = servicesStore.saveIndustry(data);
  return { success: true, industry: saved };
}

export async function deleteIndustryFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; error?: string | undefined }> {
  if (!data.id) return { success: false, error: "Industry ID is required." };
  const ok = servicesStore.deleteIndustry(data.id);
  return { success: ok };
}
