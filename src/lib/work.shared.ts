/**
 * Shared types, interfaces, slugification, and validation for
 * DIMISI Our Work & Our Products Portfolio Case Studies System.
 */

export type ProjectType = "work" | "product";

export interface ProjectGalleryImage {
  url: string;
  caption?: string | undefined;
}

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  type: ProjectType; // "work" (Client Solutions) | "product" (In-House Products)
  category: string; // e.g. "Travel · Website", "Social Platform · Website", "Home Services · Web App", "Conference · Website"
  category_id?: string | undefined;
  tagline: string;
  overview: string;
  challenge: string;
  solution: string;
  outcome: string;
  cover_image: string;
  gallery_images: ProjectGalleryImage[];
  upload_status?: "pending" | "success" | "failed";
  website_url?: string | undefined;
  client_name?: string | undefined;
  timeline?: string | undefined;
  tech_stack: string[];
  metrics: ProjectMetric[];
  order_index: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectInput {
  id?: string | undefined;
  title: string;
  slug?: string | undefined;
  type: ProjectType;
  category: string;
  category_id?: string | undefined;
  tagline?: string | undefined;
  overview: string;
  challenge: string;
  solution: string;
  outcome: string;
  cover_image: string;
  gallery_images?: ProjectGalleryImage[] | undefined;
  upload_status?: "pending" | "success" | "failed";
  website_url?: string | undefined;
  client_name?: string | undefined;
  timeline?: string | undefined;
  tech_stack?: string[] | undefined;
  metrics?: ProjectMetric[] | undefined;
  order_index?: number | undefined;
  is_featured?: boolean | undefined;
  is_active?: boolean | undefined;
}

export interface WorkCategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | undefined;
  status: "active" | "inactive";
  order_index: number;
  created_at?: string | undefined;
  updated_at?: string | undefined;
}

export interface WorkCategoryInput {
  id?: string | undefined;
  name: string;
  slug?: string | undefined;
  description?: string | undefined;
  status?: "active" | "inactive" | undefined;
  order_index?: number | undefined;
}

export interface PublicWorkPayload {
  projects: ProjectItem[];
  categories?: string[] | undefined;
  categoryItems?: WorkCategoryItem[] | undefined;
  stats: {
    totalProjects: number;
    totalWork: number;
    totalProducts: number;
    satisfactionScore: string;
    deliveryRate: string;
  };
}

/**
 * Creates URL-safe slugs from project titles.
 */
export function slugifyProject(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Creates URL-safe slugs for work/product categories.
 */
export function slugifyWorkCategory(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Validates work category inputs.
 */
export function validateWorkCategoryInput(input: Partial<WorkCategoryInput>): {
  valid: boolean;
  error?: string;
  field?: string;
} {
  const name = input.name?.trim() || "";
  if (name.length < 5) {
    return { valid: false, error: "Category name must be at least 5 characters long (5-50 characters).", field: "name" };
  }
  if (name.length > 50) {
    return { valid: false, error: "Category name cannot exceed 50 characters.", field: "name" };
  }
  if (input.description && input.description.trim().length > 0) {
    const desc = input.description.trim();
    if (desc.length < 5) {
      return { valid: false, error: "Description must be at least 5 characters long.", field: "description" };
    }
    if (desc.length > 200) {
      return { valid: false, error: "Description cannot exceed 200 characters.", field: "description" };
    }
  }
  if (input.order_index !== undefined && input.order_index !== null) {
    const num = Number(input.order_index);
    if (!Number.isInteger(num) || num < 1 || num > 10000) {
      return { valid: false, error: "Display order must be a whole number between 1 and 10000.", field: "order_index" };
    }
  }
  return { valid: true };
}

/**
 * Validates project input data for both create and update operations.
 */
export const MAX_NARRATIVE_LENGTH = 2000;
export const MAX_TITLE_LENGTH = 100;
export const MIN_TITLE_LENGTH = 5;
export const MAX_TAGLINE_LENGTH = 200;

export function validateProjectInput(input: Partial<ProjectInput>): {
  valid: boolean;
  error?: string;
  field?: string;
} {
  const title = input.title?.trim() || "";
  const type = input.type;
  const category = input.category?.trim() || "";
  const tagline = input.tagline?.trim() || "";
  const overview = input.overview?.trim() || "";
  const challenge = input.challenge?.trim() || "";
  const solution = input.solution?.trim() || "";
  const outcome = input.outcome?.trim() || "";
  const coverImage = input.cover_image?.trim() || "";

  if (title.length < MIN_TITLE_LENGTH) {
    return { valid: false, error: `Project title must be at least ${MIN_TITLE_LENGTH} characters long (5-100 chars).`, field: "title" };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { valid: false, error: `Project title cannot exceed ${MAX_TITLE_LENGTH} characters.`, field: "title" };
  }
  if (!type || (type !== "work" && type !== "product")) {
    return { valid: false, error: "Project type must be either 'work' or 'product'.", field: "type" };
  }
  if (category.length < 2) {
    return { valid: false, error: "Project category selection is required.", field: "category" };
  }
  if (tagline.length > MAX_TAGLINE_LENGTH) {
    return { valid: false, error: `Tagline cannot exceed ${MAX_TAGLINE_LENGTH} characters.`, field: "tagline" };
  }
  if (overview.length < 5) {
    return { valid: false, error: "Overview must be at least 5 characters long.", field: "overview" };
  }
  if (overview.length > MAX_NARRATIVE_LENGTH) {
    return { valid: false, error: `Overview cannot exceed ${MAX_NARRATIVE_LENGTH} characters.`, field: "overview" };
  }
  if (challenge.length > MAX_NARRATIVE_LENGTH) {
    return { valid: false, error: `Challenge narrative cannot exceed ${MAX_NARRATIVE_LENGTH} characters.`, field: "challenge" };
  }
  if (solution.length > MAX_NARRATIVE_LENGTH) {
    return { valid: false, error: `Solution narrative cannot exceed ${MAX_NARRATIVE_LENGTH} characters.`, field: "solution" };
  }
  if (outcome.length > MAX_NARRATIVE_LENGTH) {
    return { valid: false, error: `Outcome narrative cannot exceed ${MAX_NARRATIVE_LENGTH} characters.`, field: "outcome" };
  }
  if (!coverImage || (!coverImage.startsWith("http://") && !coverImage.startsWith("https://") && !coverImage.startsWith("data:image/") && !coverImage.startsWith("blob:"))) {
    return { valid: false, error: "A valid cover image is required (URL or uploaded file).", field: "cover_image" };
  }
  if (input.order_index !== undefined && input.order_index !== null) {
    const num = Number(input.order_index);
    if (!Number.isInteger(num) || num < 1 || num > 10000) {
      return { valid: false, error: "Display order must be a whole number between 1 and 10000.", field: "order_index" };
    }
  }

  return { valid: true };
}

