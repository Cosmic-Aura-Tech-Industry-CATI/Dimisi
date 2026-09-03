/**
 * DIMISI Technologies — Client-Side Work & Projects Functions
 * Pure client-side implementation backed by in-memory and local data.
 */
import { workStore } from "./work.data";
import {
  type ProjectItem,
  type ProjectInput,
  type PublicWorkPayload,
  validateProjectInput,
} from "./work.shared";

export async function getPublicWorkData(): Promise<PublicWorkPayload> {
  return workStore.getPublicPayload();
}

export async function getProjectBySlug({
  data,
}: {
  data: { slug: string };
}): Promise<ProjectItem | null> {
  if (!data?.slug) return null;
  return workStore.getProjectBySlug(data.slug);
}

export async function getAdminWorkData(): Promise<{ projects: ProjectItem[]; stats: PublicWorkPayload["stats"] }> {
  const payload = workStore.getPublicPayload();
  const all = workStore.getAllProjects();
  return {
    projects: all,
    stats: payload.stats,
  };
}

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
    const saved = workStore.saveProject(data);
    return { success: true, project: saved };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save project.",
    };
  }
}

export async function deleteProjectFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; error?: string }> {
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
}
