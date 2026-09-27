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
  getVisitorServicesApi,
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

  const [catRes, srvRes] = await Promise.allSettled([
    getAllServiceCategoriesApi(),
    getVisitorServicesApi().catch(() => getAllServicesApi()),
  ]);

  if (catRes.status === "fulfilled" && Array.isArray(catRes.value) && catRes.value.length > 0) {
    catItems = catRes.value;
    servicesStore.setCategories(catItems);
  } else if (catRes.status === "rejected") {
    console.warn("Could not load live categories for public services:", catRes.reason);
  }

  if (srvRes.status === "fulfilled" && Array.isArray(srvRes.value)) {
    servicesStore.setServices(srvRes.value);
  } else if (srvRes.status === "rejected") {
    console.warn("Could not load live services for public services:", srvRes.reason);
    throw srvRes.reason;
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
  const trimmedSlug = data.slug.trim().toLowerCase();

  // 1. Check local store
  let service = servicesStore.getServiceBySlug(trimmedSlug);
  if (service) return service;

  // 2. Fetch fresh live visitor services from backend
  try {
    const catItems = servicesStore.categoryItems;
    let liveServices: CompanyService[] = [];
    try {
      liveServices = await getVisitorServicesApi(undefined, catItems);
    } catch {
      liveServices = await getAllServicesApi(undefined, catItems);
    }

    if (Array.isArray(liveServices)) {
      servicesStore.setServices(liveServices);
      service = servicesStore.getServiceBySlug(trimmedSlug);
      if (service) return service;
    }
  } catch (err) {
    console.warn("Live lookup for service by slug failed:", err);
  }

  // 3. If slug is a MongoDB ObjectId, attempt direct ID lookup
  if (isMongoId(data.slug)) {
    try {
      const single = await getServiceByIdApi(data.slug, servicesStore.categoryItems);
      if (single) {
        servicesStore.saveService(single);
        return single;
      }
    } catch {}
  }

  return null;
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

  try {
    let savedCategory: ServiceCategoryItem;

    if (data.id && isMongoId(data.id)) {
      savedCategory = await updateServiceCategoryApi(data.id, {
        name: data.name,
        description: data.description,
        displayOrder: data.order_index ?? 1,
        status: data.status ?? "active",
      });
    } else {
      savedCategory = await createServiceCategoryApi({
        name: data.name,
        description: data.description,
        displayOrder: data.order_index ?? (servicesStore.categoryItems.length + 1),
        status: data.status ?? "active",
      });
    }

    // Sync to store
    servicesStore.saveCategory(savedCategory);

    return {
      success: true,
      category: savedCategory,
    };
  } catch (err: unknown) {
    console.error("[Backend Save Category Error]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save service category.",
    };
  }
}

export async function deleteServiceCategoryFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; error?: string | undefined }> {
  if (!data.id) return { success: false, error: "Category ID is required." };

  try {
    if (isMongoId(data.id)) {
      await deleteServiceCategoryApi(data.id);
    } else {
      const currentCats = await getAllServiceCategoriesApi();
      const localCat = servicesStore.categoryItems.find((c) => c.id === data.id);
      const found = currentCats.find(
        (c) =>
          c.id === data.id ||
          (localCat && c.name.toLowerCase() === localCat.name.toLowerCase()) ||
          (localCat && c.slug.toLowerCase() === localCat.slug.toLowerCase()),
      );
      if (found && isMongoId(found.id)) {
        await deleteServiceCategoryApi(found.id);
      }
    }

    // Remove category from store
    servicesStore.deleteCategory(data.id);

    // Also remove any services that belonged to this category (reflecting backend cascade deletion)
    const targetCat = servicesStore.categoryItems.find((c) => c.id === data.id);
    const catNameLower = targetCat ? targetCat.name.toLowerCase() : "";
    const remainingServices = servicesStore.services.filter(
      (s) => s.category !== data.id && (catNameLower ? s.category?.toLowerCase() !== catNameLower : true),
    );
    servicesStore.setServices(remainingServices);

    return { success: true };
  } catch (err: unknown) {
    console.error("[Backend Delete Category Error]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete category from backend.",
    };
  }
}

export async function getAdminServicesData(): Promise<{
  services: CompanyService[];
  industries: IndustrySector[];
  categories: string[];
  categoryItems: ServiceCategoryItem[];
  categoryCounts: Record<string, number>;
}> {
  let catItems = servicesStore.categoryItems;
  let servicesList = servicesStore.services;

  const [catRes, srvRes] = await Promise.allSettled([
    getAllServiceCategoriesApi(),
    getAllServicesApi(),
  ]);

  if (catRes.status === "fulfilled" && Array.isArray(catRes.value) && catRes.value.length > 0) {
    catItems = catRes.value;
    servicesStore.setCategories(catItems);
  } else if (catRes.status === "rejected") {
    console.warn("Could not fetch remote service categories for admin panel:", catRes.reason);
  }

  if (srvRes.status === "fulfilled" && Array.isArray(srvRes.value)) {
    servicesList = srvRes.value;
    servicesStore.setServices(servicesList);
  } else if (srvRes.status === "rejected") {
    console.warn("Could not fetch remote services for admin panel:", srvRes.reason);
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

export interface SaveServiceOptions {
  data: ServiceInput | FormData;
  serviceId?: string;
}

export async function saveServiceFn({
  data,
  serviceId,
}: SaveServiceOptions): Promise<{
  success: boolean;
  service?: CompanyService | undefined;
  error?: string | undefined;
}> {
  const catItems = servicesStore.categoryItems;

  if (data instanceof FormData) {
    const id = serviceId || (data.get("id") as string | null);
    try {
      let saved: CompanyService;
      if (id && isMongoId(id)) {
        saved = await updateServiceApi(id, data, catItems);
      } else {
        saved = await createServiceApi(data, catItems);
      }
      servicesStore.saveService(saved);
      return { success: true, service: saved };
    } catch (err: unknown) {
      console.error("[Backend Save Service FormData Error]", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to save service.",
      };
    }
  }

  const check = validateServiceInput(data);
  if (!check.valid) {
    return { success: false, error: check.error || "Invalid service input." };
  }

  try {
    let remoteSaved: CompanyService;
    if (data.id && isMongoId(data.id)) {
      remoteSaved = await updateServiceApi(data.id, data, catItems);
    } else {
      remoteSaved = await createServiceApi(data, catItems);
    }
    servicesStore.saveService(remoteSaved);
    return {
      success: true,
      service: remoteSaved,
    };
  } catch (err: unknown) {
    console.error("[Backend Save Service Error]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save service on server.",
    };
  }
}

export async function deleteServiceFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; error?: string | undefined }> {
  if (!data.id) return { success: false, error: "Service ID is required." };

  try {
    if (isMongoId(data.id)) {
      await deleteServiceApi(data.id);
    } else {
      const remoteServices = await getAllServicesApi();
      const localSrv = servicesStore.services.find((s) => s.id === data.id);
      if (localSrv) {
        const found = remoteServices.find(
          (s) =>
            s.id === data.id ||
            s.title.toLowerCase() === localSrv.title.toLowerCase() ||
            s.slug.toLowerCase() === localSrv.slug.toLowerCase(),
        );
        if (found && isMongoId(found.id)) {
          await deleteServiceApi(found.id);
        }
      }
    }
    // Only remove locally if backend deletion succeeded
    servicesStore.deleteService(data.id);
    return { success: true };
  } catch (err: unknown) {
    console.error("[Backend Delete Service Error]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete service from backend.",
    };
  }
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
      servicesStore.saveService(updated);
      return { success: true, service: updated };
    }
    return { success: false, error: "A valid database service ID is required for activation toggle." };
  } catch (err: unknown) {
    console.error("[Backend Toggle Activation Error]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle activation status.",
    };
  }
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
      servicesStore.saveService(updated);
      return { success: true, service: updated };
    }
    return { success: false, error: "A valid database service ID is required for featured toggle." };
  } catch (err: unknown) {
    console.error("[Backend Toggle Featured Error]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle featured status.",
    };
  }
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
