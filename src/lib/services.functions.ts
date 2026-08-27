import { createServerFn } from "@tanstack/react-start";
import {
  type CompanyService,
  type IndustrySector,
  type PublicServicesPayload,
  type ServiceInput,
  type IndustryInput,
  validateServiceInput,
} from "./services.shared";

/** Public: Fetch all active services, industries, and metrics for the main Services hub. */
export const getPublicServicesData = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicServicesPayload> => {
    const { servicesStore } = await import("./services.server");
    return servicesStore.getPublicPayload();
  },
);

/** Public: Fetch full details for a single service by slug. */
export const getServiceBySlug = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => input)
  .handler(async ({ data }): Promise<CompanyService | null> => {
    if (!data.slug) return null;
    const { servicesStore } = await import("./services.server");
    return servicesStore.getServiceBySlug(data.slug);
  });

/** Admin: Fetch all services and industries for admin control room. */
export const getAdminServicesData = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ services: CompanyService[]; industries: IndustrySector[] }> => {
    const { servicesStore } = await import("./services.server");
    return {
      services: servicesStore.services,
      industries: servicesStore.industries,
    };
  },
);

/** Admin: Create or update a company service. */
export const saveServiceFn = createServerFn({ method: "POST" })
  .validator((input: ServiceInput) => input)
  .handler(
    async ({
      data,
    }): Promise<{
      success: boolean;
      service?: CompanyService | undefined;
      error?: string | undefined;
    }> => {
      const check = validateServiceInput(data);
      if (!check.valid) {
        return { success: false, error: check.error || "Invalid service input." };
      }

      const { servicesStore } = await import("./services.server");
      const saved = servicesStore.saveService(data);
      return { success: true, service: saved };
    },
  );

/** Admin: Delete a service by ID. */
export const deleteServiceFn = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(
    async ({ data }): Promise<{ success: boolean; error?: string | undefined }> => {
      if (!data.id) return { success: false, error: "Service ID is required." };
      const { servicesStore } = await import("./services.server");
      const ok = servicesStore.deleteService(data.id);
      return { success: ok };
    },
  );

/** Admin: Create or update an industry sector. */
export const saveIndustryFn = createServerFn({ method: "POST" })
  .validator((input: IndustryInput) => input)
  .handler(
    async ({
      data,
    }): Promise<{
      success: boolean;
      industry?: IndustrySector | undefined;
      error?: string | undefined;
    }> => {
      if (!data.name || !data.tagline) {
        return { success: false, error: "Industry name and tagline are required." };
      }

      const { servicesStore } = await import("./services.server");
      const saved = servicesStore.saveIndustry(data);
      return { success: true, industry: saved };
    },
  );

/** Admin: Delete an industry sector by ID. */
export const deleteIndustryFn = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(
    async ({ data }): Promise<{ success: boolean; error?: string | undefined }> => {
      if (!data.id) return { success: false, error: "Industry ID is required." };
      const { servicesStore } = await import("./services.server");
      const ok = servicesStore.deleteIndustry(data.id);
      return { success: ok };
    },
  );
