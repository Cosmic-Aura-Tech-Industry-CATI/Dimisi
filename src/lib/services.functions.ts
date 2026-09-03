/**
 * DIMISI Technologies — Client-Side Services Functions
 * Pure client-side implementation backed by in-memory and local data.
 */
import { servicesStore } from "./services.data";
import {
  type CompanyService,
  type IndustrySector,
  type PublicServicesPayload,
  type ServiceInput,
  type IndustryInput,
  validateServiceInput,
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

export async function getAdminServicesData(): Promise<{ services: CompanyService[]; industries: IndustrySector[] }> {
  return {
    services: servicesStore.services,
    industries: servicesStore.industries,
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
  if (!data.name || !data.tagline) {
    return { success: false, error: "Industry name and tagline are required." };
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
