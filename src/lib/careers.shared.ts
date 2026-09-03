/**
 * Shared types, interfaces, slugification, and validation for
 * DIMISI Careers & Recruitment Ecosystem.
 */

export type JobType = "Internship" | "Full-time" | "Part-time" | "Contract" | "Remote";
export type WorkplaceType = "Remote" | "Hybrid" | "On-site";
export type JobStatus = "open" | "closed" | "draft";

export interface JobOpening {
  id: string;
  slug: string;
  title: string;
  department: string; // e.g. "Content & Editorial", "Design & Creative", "Engineering", "Operations"
  type: JobType;
  workplace: WorkplaceType;
  location: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  apply_url: string; // Default: https://www.thekalesh.com/careers
  order_index: number;
  is_featured: boolean;
  status: JobStatus;
  created_at: string;
  updated_at: string;
}

export interface JobInput {
  id?: string | undefined;
  title: string;
  slug?: string | undefined;
  department: string;
  type: JobType;
  workplace?: WorkplaceType | undefined;
  location: string;
  summary: string;
  responsibilities?: string[] | undefined;
  requirements?: string[] | undefined;
  benefits?: string[] | undefined;
  apply_url?: string | undefined;
  order_index?: number | undefined;
  is_featured?: boolean | undefined;
  status?: JobStatus | undefined;
}

export interface HiringProcessStep {
  step: string;
  title: string;
  detail: string;
  duration?: string | undefined;
}

export interface CultureBenefit {
  id: string;
  title: string;
  description: string;
  icon_tag?: string | undefined; // e.g. "globe", "heart", "book", "sun", "laptop", "shield"
}

export interface CareersHeroConfig {
  eyebrow: string;
  heading: string;
  subline: string;
  cta_text: string;
  cta_link: string;
  illustration_caption: string;
}

export interface CareersClosingCtaConfig {
  heading: string;
  subline: string;
  cta_text: string;
  cta_link: string;
}

export interface PublicCareersPayload {
  hero: CareersHeroConfig;
  jobs: JobOpening[];
  hiring_steps: HiringProcessStep[];
  benefits: CultureBenefit[];
  closing_cta: CareersClosingCtaConfig;
  stats: {
    totalOpenings: number;
    departmentsCount: number;
    hiringTimeline: string;
    responseRate: string;
  };
}

/**
 * Creates URL-safe slugs from job titles.
 */
export function slugifyJob(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Validates job input fields.
 */
export function validateJobInput(input: Partial<JobInput>): {
  valid: boolean;
  error?: string;
} {
  if (!input.title || input.title.trim().length < 3) {
    return { valid: false, error: "Job title must be at least 3 characters long." };
  }
  if (!input.department || input.department.trim().length < 2) {
    return { valid: false, error: "Department is required." };
  }
  if (!input.location || input.location.trim().length < 2) {
    return { valid: false, error: "Location is required." };
  }
  if (!input.summary || input.summary.trim().length < 10) {
    return { valid: false, error: "Job summary must be at least 10 characters long." };
  }

  return { valid: true };
}
