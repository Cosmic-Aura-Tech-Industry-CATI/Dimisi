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
  tagline: string;
  overview: string;
  challenge: string;
  solution: string;
  outcome: string;
  cover_image: string;
  gallery_images: ProjectGalleryImage[];
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
  tagline?: string | undefined;
  overview: string;
  challenge: string;
  solution: string;
  outcome: string;
  cover_image: string;
  gallery_images?: ProjectGalleryImage[] | undefined;
  website_url?: string | undefined;
  client_name?: string | undefined;
  timeline?: string | undefined;
  tech_stack?: string[] | undefined;
  metrics?: ProjectMetric[] | undefined;
  order_index?: number | undefined;
  is_featured?: boolean | undefined;
  is_active?: boolean | undefined;
}

export interface PublicWorkPayload {
  projects: ProjectItem[];
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
 * Validates project input data for both create and update operations.
 */
export function validateProjectInput(input: Partial<ProjectInput>): {
  valid: boolean;
  error?: string;
  field?: string;
} {
  const title = input.title?.trim() || "";
  const type = input.type;
  const category = input.category?.trim() || "";
  const overview = input.overview?.trim() || "";
  const challenge = input.challenge?.trim() || "";
  const solution = input.solution?.trim() || "";
  const outcome = input.outcome?.trim() || "";
  const coverImage = input.cover_image?.trim() || "";

  if (title.length < 2) {
    return { valid: false, error: "Project title must be at least 2 characters long.", field: "title" };
  }
  if (!type || (type !== "work" && type !== "product")) {
    return { valid: false, error: "Project type must be either 'work' or 'product'.", field: "type" };
  }
  if (category.length < 2) {
    return { valid: false, error: "Project category label is required.", field: "category" };
  }
  if (overview.length < 10) {
    return { valid: false, error: "Overview must be at least 10 characters long.", field: "overview" };
  }
  if (challenge.length < 10) {
    return { valid: false, error: "Challenge description must be at least 10 characters long.", field: "challenge" };
  }
  if (solution.length < 10) {
    return { valid: false, error: "Solution description must be at least 10 characters long.", field: "solution" };
  }
  if (outcome.length < 10) {
    return { valid: false, error: "Outcome description must be at least 10 characters long.", field: "outcome" };
  }
  if (!coverImage || (!coverImage.startsWith("http://") && !coverImage.startsWith("https://") && !coverImage.startsWith("data:image/"))) {
    return { valid: false, error: "A valid cover image is required (URL or uploaded file).", field: "cover_image" };
  }

  return { valid: true };
}
