/**
 * Shared types, interfaces, slugification, and validation for
 * DIMISI Careers & Recruitment Ecosystem.
 */

export type JobType = "Internship" | "Full-time" | "Part-time" | "Contract" | "Remote";
export type WorkplaceType = "Remote" | "Hybrid" | "On-site";
export type JobStatus = "open" | "closed" | "draft";

export type ApplicationStatus =
  | "new"
  | "reviewing"
  | "shortlisted"
  | "interview"
  | "rejected"
  | "hired";

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
  apply_url: string;
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

export interface JobApplicationItem {
  id: string;
  job_id: string;
  job_title: string;
  job_department: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
  cover_letter?: string;
  additional_info?: string;
  resume_name: string;
  resume_size: number;
  resume_type: string;
  resume_data_url: string;
  status: ApplicationStatus;
  applied_at: string;
  notes?: string;
}

export interface JobApplicationInput {
  job_id: string;
  job_title: string;
  job_department?: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
  cover_letter?: string;
  additional_info?: string;
  resume_name: string;
  resume_size: number;
  resume_type: string;
  resume_data_url: string;
}

export const APPLICATION_STATUS_META: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  new: {
    label: "New",
    color: "#60a5fa",
    bg: "rgba(96, 165, 250, 0.12)",
    border: "rgba(96, 165, 250, 0.3)",
  },
  reviewing: {
    label: "Reviewing",
    color: "#fbbf24",
    bg: "rgba(251, 191, 36, 0.12)",
    border: "rgba(251, 191, 36, 0.3)",
  },
  shortlisted: {
    label: "Shortlisted",
    color: "#c084fc",
    bg: "rgba(192, 132, 252, 0.12)",
    border: "rgba(192, 132, 252, 0.3)",
  },
  interview: {
    label: "Interview",
    color: "#38bdf8",
    bg: "rgba(56, 189, 248, 0.12)",
    border: "rgba(56, 189, 248, 0.3)",
  },
  rejected: {
    label: "Rejected",
    color: "#f87171",
    bg: "rgba(248, 113, 113, 0.12)",
    border: "rgba(248, 113, 113, 0.3)",
  },
  hired: {
    label: "Hired",
    color: "#34d399",
    bg: "rgba(52, 211, 153, 0.12)",
    border: "rgba(52, 211, 153, 0.3)",
  },
};

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

/**
 * Validates job application input fields.
 */
export function validateJobApplicationInput(input: Partial<JobApplicationInput>): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!input.full_name || input.full_name.trim().length < 2) {
    errors.full_name = "Please enter your full name.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email || !emailRegex.test(input.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!input.phone || input.phone.trim().replace(/\D/g, "").length < 7) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (!input.location || input.location.trim().length < 2) {
    errors.location = "Please enter your current location.";
  }

  if (!input.job_title || input.job_title.trim().length === 0) {
    errors.job_title = "Please select a job position.";
  }

  if (!input.resume_data_url || !input.resume_name) {
    errors.resume = "Please upload your resume (PDF, DOC, or DOCX).";
  } else if (input.resume_size && input.resume_size > 10 * 1024 * 1024) {
    errors.resume = "Resume file size exceeds maximum limit of 10 MB.";
  }

  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
  if (input.portfolio_url && input.portfolio_url.trim().length > 0 && !urlRegex.test(input.portfolio_url.trim())) {
    errors.portfolio_url = "Please enter a valid portfolio URL.";
  }

  if (input.linkedin_url && input.linkedin_url.trim().length > 0 && !urlRegex.test(input.linkedin_url.trim())) {
    errors.linkedin_url = "Please enter a valid LinkedIn URL.";
  }

  if (input.github_url && input.github_url.trim().length > 0 && !urlRegex.test(input.github_url.trim())) {
    errors.github_url = "Please enter a valid GitHub URL.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
