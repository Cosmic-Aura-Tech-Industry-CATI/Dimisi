import { createServerFn } from "@tanstack/react-start";
import { workStore } from "./work.server";
import {
  type ProjectItem,
  type ProjectInput,
  type PublicWorkPayload,
  validateProjectInput,
} from "./work.shared";

/**
 * Public function to fetch all active projects (both Our Work and Our Products) with summary stats.
 */
export const getPublicWorkData = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicWorkPayload> => {
    return workStore.getPublicPayload();
  }
);

/**
 * Public function to fetch single project details by slug for dynamic route `/work/$slug`.
 */
export const getProjectBySlug = createServerFn({ method: "GET" })
  .validator((d: { slug: string }) => d)
  .handler(async ({ data }): Promise<ProjectItem | null> => {
    if (!data?.slug) return null;
    return workStore.getProjectBySlug(data.slug);
  });

/**
 * Admin function to fetch all projects including draft/inactive for moderation and editing.
 */
export const getAdminWorkData = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ projects: ProjectItem[]; stats: PublicWorkPayload["stats"] }> => {
    const payload = workStore.getPublicPayload();
    const all = workStore.getAllProjects();
    return {
      projects: all,
      stats: payload.stats,
    };
  }
);

/**
 * Admin function to create or update a project case study.
 */
export const saveProjectFn = createServerFn({ method: "POST" })
  .validator((d: ProjectInput) => d)
  .handler(async ({ data }): Promise<{ success: boolean; project?: ProjectItem; error?: string }> => {
    try {
      const validation = validateProjectInput(data);
      if (!validation.valid) {
        return { success: false, error: validation.error || "Validation failed." };
      }
      const saved = workStore.saveProject(data);
      return { success: true, project: saved };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to save project.",
      };
    }
  });

/**
 * Admin function to delete a project by ID.
 */
export const deleteProjectFn = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!data?.id) return { success: false, error: "Project ID is required." };
      const ok = workStore.deleteProject(data.id);
      return { success: ok };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete project.",
      };
    }
  });
