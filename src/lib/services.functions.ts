/**
 * DIMISI Technologies — Client-Side Services Functions
 * Pure client-side implementation backed by in-memory and local data.
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

export async function getPublicServicesData(): Promise<PublicServicesPayload> {
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

  const saved = servicesStore.saveCategory(data);
  return { success: true, category: saved };
}

export async function deleteServiceCategoryFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; error?: string | undefined }> {
  if (!data.id) return { success: false, error: "Category ID is required." };
  const ok = servicesStore.deleteCategory(data.id);
  return { success: ok };
}

export async function getAdminServicesData(): Promise<{
  services: CompanyService[];
  industries: IndustrySector[];
  categories: string[];
  categoryItems: ServiceCategoryItem[];
  categoryCounts: Record<string, number>;
}> {
  return {
    services: servicesStore.services,
    industries: servicesStore.industries,
    categories: servicesStore.categories,
    categoryItems: servicesStore.categoryItems,
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
