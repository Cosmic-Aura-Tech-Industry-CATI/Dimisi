/**
 * DIMISI Technologies — Client-Side & Admin API Services Functions
 * Integrates live Express backend endpoints for Service Categories with local fallback.
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

export async function getPublicServicesData(): Promise<PublicServicesPayload> {
  try {
    const apiCats = await getAllServiceCategoriesApi();
    if (apiCats && apiCats.length > 0) {
      const activeCats = apiCats.filter((c) => c.status === "active");
      const basePayload = servicesStore.getPublicPayload();
      return {
        ...basePayload,
        categories: activeCats.map((c) => c.name),
        categoryItems: activeCats,
      };
    }
  } catch {
    // Graceful fallback to in-memory store
  }
  return servicesStore.getPublicPayload();
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
    if (apiCats && apiCats.length > 0) {
      // Sync with servicesStore categories
      apiCats.forEach((c) => {
        servicesStore.saveCategory({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          status: c.status,
          order_index: c.order_index,
        });
      });
      return {
        categories: apiCats,
        counts: servicesStore.getCategoryServiceCounts(),
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
    let saved: ServiceCategoryItem;

    if (data.id && !data.id.startsWith("scat-")) {
      // Existing backend Mongo document
      saved = await updateServiceCategoryApi(data.id, {
        name: data.name,
        description: data.description,
        displayOrder: data.order_index ?? 1,
        status: data.status ?? "active",
      });
    } else {
      // Create new category in backend
      saved = await createServiceCategoryApi({
        name: data.name,
        description: data.description,
        displayOrder: data.order_index ?? (servicesStore.categoryItems.length + 1),
        status: data.status ?? "active",
      });
    }

    // Keep memory store updated
    servicesStore.saveCategory({
      id: saved.id,
      name: saved.name,
      slug: saved.slug,
      description: saved.description,
      status: saved.status,
      order_index: saved.order_index,
    });

    return { success: true, category: saved };
  } catch (err: unknown) {
    console.error("Failed to save service category to backend:", err);
    const msg = err instanceof Error ? err.message : "Failed to save category.";
    return { success: false, error: msg };
  }
}

export async function deleteServiceCategoryFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; error?: string | undefined }> {
  if (!data.id) return { success: false, error: "Category ID is required." };

  try {
    if (!data.id.startsWith("scat-")) {
      await deleteServiceCategoryApi(data.id);
    }
    servicesStore.deleteCategory(data.id);
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete service category from backend:", err);
    const msg = err instanceof Error ? err.message : "Failed to delete category.";
    return { success: false, error: msg };
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

  try {
    const apiCats = await getAllServiceCategoriesApi();
    if (apiCats && apiCats.length > 0) {
      catItems = apiCats;
    }
  } catch (err) {
    console.warn("Could not fetch remote service categories for admin panel, using local:", err);
  }

  const activeCategories = catItems.filter((c) => c.status === "active").map((c) => c.name);

  return {
    services: servicesStore.services,
    industries: servicesStore.industries,
    categories: activeCategories,
    categoryItems: catItems,
    categoryCounts: servicesStore.getCategoryServiceCounts(),
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

  const saved = servicesStore.saveService(data);
  return { success: true, service: saved };
}

export async function deleteServiceFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; error?: string | undefined }> {
  if (!data.id) return { success: false, error: "Service ID is required." };
  const ok = servicesStore.deleteService(data.id);
  return { success: ok };
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
