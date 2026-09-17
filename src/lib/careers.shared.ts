/**
 * Shared types, interfaces, slugification, and validation for
 * DIMISI Careers & Recruitment Ecosystem.
 */
import type { DepartmentItem } from "../services/department.service";

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
  portfolio_url?: string | undefined;
  linkedin_url?: string | undefined;
  github_url?: string | undefined;
  cover_letter?: string | undefined;
  additional_info?: string | undefined;
  resume_name: string;
  resume_size: number;
  resume_type: string;
  resume_data_url: string;
  status: ApplicationStatus;
  applied_at: string;
  notes?: string | undefined;
}

export interface JobApplicationInput {
  job_id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  portfolio_url?: string | undefined;
  linkedin_url?: string | undefined;
  github_url?: string | undefined;
  cover_letter?: string | undefined;
  additional_info?: string | undefined;
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

// --- BACKEND API DTOs ---

export interface BackendJobDoc {
  _id: string;
  title: string;
  slug?: string;
  department: string | { _id: string; name: string; code?: string };
  type: "remote" | "full_time" | "part_time" | "internship" | "contract" | string;
  workplace: "office" | "remote" | "hybrid" | string;
  location: string;
  summary: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  applyUrl?: string;
  orderIndex: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendJobListResponse {
  status: string;
  results?: number;
  data?: {
    jobs: BackendJobDoc[];
  };
}

export interface BackendJobSingleResponse {
  status: string;
  message?: string;
  data?: {
    job: BackendJobDoc;
  };
}

export interface BackendApplicationDoc {
  _id: string;
  jobId?: string | { _id: string; title: string; department?: any };
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  coverLetter?: string;
  additionalInfo?: string;
  resumeUrl?: string;
  resumePublicId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendApplicationListResponse {
  status: string;
  results?: number;
  data?: {
    applications: BackendApplicationDoc[];
  };
}

export interface BackendApplicationSingleResponse {
  status: string;
  message?: string;
  data?: {
    application: BackendApplicationDoc;
  };
}

/**
 * Check if a string is a 24-character hexadecimal MongoDB ObjectId
 */
export function isMongoId(id?: string | null): boolean {
  return typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id.trim());
}

/**
 * Normalizes backend job doc to frontend JobOpening model.
 */
export function normalizeBackendJob(
  doc: BackendJobDoc | null | undefined,
  departments?: DepartmentItem[],
): JobOpening {
  if (!doc) {
    return {
      id: "job-" + Date.now().toString(36),
      slug: "untitled-role",
      title: "Untitled Role",
      department: "General",
      type: "Full-time",
      workplace: "Remote",
      location: "Remote",
      summary: "",
      responsibilities: [],
      requirements: [],
      benefits: [],
      apply_url: "",
      order_index: 1,
      is_featured: false,
      status: "open",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // 1. Resolve Department
  let deptName = "General";
  if (typeof doc.department === "object" && doc.department !== null && (doc.department as any).name) {
    deptName = (doc.department as any).name;
  } else if (typeof doc.department === "string") {
    const rawDept = doc.department.trim();
    if (departments && departments.length > 0) {
      const match = departments.find(
        (d) =>
          d.id === rawDept ||
          d.name.toLowerCase() === rawDept.toLowerCase() ||
          (d.code && d.code.toLowerCase() === rawDept.toLowerCase()),
      );
      if (match) deptName = match.name;
      else deptName = rawDept;
    } else {
      deptName = rawDept;
    }
  }

  // 2. Map Type
  let type: JobType = "Full-time";
  const rawType = String(doc.type || "").toLowerCase().replace(/[-_ ]/g, "");
  if (rawType.includes("intern")) type = "Internship";
  else if (rawType.includes("part")) type = "Part-time";
  else if (rawType.includes("contract")) type = "Contract";
  else if (rawType === "remote") type = "Remote";
  else type = "Full-time";

  // 3. Map Workplace
  let workplace: WorkplaceType = "Remote";
  const rawWp = String(doc.workplace || "").toLowerCase();
  if (rawWp === "office" || rawWp === "on-site" || rawWp === "onsite") workplace = "On-site";
  else if (rawWp === "hybrid") workplace = "Hybrid";
  else workplace = "Remote";

  // 4. Map Status
  const status: JobStatus = doc.isActive !== false ? "open" : "closed";

  const id = String(doc._id);
  const title = doc.title || "Untitled Role";
  const slug = doc.slug || slugifyJob(title);

  return {
    id,
    slug,
    title,
    department: deptName,
    type,
    workplace,
    location: doc.location || "Remote",
    summary: doc.summary || "",
    responsibilities: Array.isArray(doc.responsibilities) ? doc.responsibilities : [],
    requirements: Array.isArray(doc.requirements) ? doc.requirements : [],
    benefits: Array.isArray(doc.benefits) ? doc.benefits : [],
    apply_url: doc.applyUrl || "",
    order_index: typeof doc.orderIndex === "number" ? doc.orderIndex : 1,
    is_featured: Boolean(doc.isFeatured),
    status,
    created_at: doc.createdAt || new Date().toISOString(),
    updated_at: doc.updatedAt || new Date().toISOString(),
  };
}

/**
 * Normalizes backend application document to frontend JobApplicationItem.
 */
export function normalizeBackendApplication(
  doc: BackendApplicationDoc | null | undefined,
  jobs?: JobOpening[],
): JobApplicationItem {
  if (!doc) {
    return {
      id: "app-" + Date.now().toString(36),
      job_id: "general",
      job_title: "General Application",
      job_department: "General",
      full_name: "Anonymous",
      email: "unknown@example.com",
      phone: "",
      location: "",
      resume_name: "Resume.pdf",
      resume_size: 0,
      resume_type: "application/pdf",
      resume_data_url: "",
      status: "new",
      applied_at: new Date().toISOString(),
    };
  }

  const rawDoc = doc as any;
  const appId = String(rawDoc._id || rawDoc.id || "app-" + Date.now().toString(36));

  let jobId = "general";
  let jobTitle = "General Application";
  let jobDept = "General";

  const rawJob = rawDoc.jobId || rawDoc.job_id;
  if (typeof rawJob === "object" && rawJob !== null) {
    jobId = String(rawJob._id || rawJob.id || "general");
    if (rawJob.title) jobTitle = rawJob.title;
    if (rawJob.department) {
      jobDept = typeof rawJob.department === "object" ? rawJob.department.name || "General" : String(rawJob.department);
    }
  } else if (typeof rawJob === "string") {
    jobId = rawJob;
    if (jobs && jobs.length > 0) {
      const match = jobs.find((j) => j.id === jobId || j.slug === jobId);
      if (match) {
        jobTitle = match.title;
        jobDept = match.department;
      }
    }
  }

  // Map status
  let status: ApplicationStatus = "new";
  const rawStatus = String(rawDoc.status || "").toLowerCase();
  if (rawStatus === "reviewing") status = "reviewing";
  else if (rawStatus === "shortlisted") status = "shortlisted";
  else if (rawStatus === "interview") status = "interview";
  else if (rawStatus === "rejected") status = "rejected";
  else if (rawStatus === "accepted" || rawStatus === "hired") status = "hired";
  else status = "new";

  const resumeUrl = rawDoc.resumeUrl || rawDoc.resume_data_url || "";
  const resumeName = resumeUrl.split("/").pop() || rawDoc.resume_name || "Resume.pdf";

  return {
    id: appId,
    job_id: jobId,
    job_title: jobTitle,
    job_department: jobDept,
    full_name: rawDoc.fullName || rawDoc.full_name || "Anonymous Applicant",
    email: rawDoc.email || "",
    phone: rawDoc.phone || "",
    location: rawDoc.location || "",
    portfolio_url: rawDoc.portfolioUrl || rawDoc.portfolio_url || undefined,
    linkedin_url: rawDoc.linkedinUrl || rawDoc.linkedin_url || undefined,
    github_url: rawDoc.githubUrl || rawDoc.github_url || undefined,
    cover_letter: rawDoc.coverLetter || rawDoc.cover_letter || undefined,
    additional_info: rawDoc.additionalInfo || rawDoc.additional_info || undefined,
    resume_name: resumeName,
    resume_size: typeof rawDoc.resume_size === "number" ? rawDoc.resume_size : 0,
    resume_type: resumeUrl.toLowerCase().endsWith(".pdf") ? "application/pdf" : rawDoc.resume_type || "application/octet-stream",
    resume_data_url: resumeUrl,
    status,
    applied_at: rawDoc.createdAt || rawDoc.applied_at || new Date().toISOString(),
    notes: rawDoc.notes || undefined,
  };
}

/**
 * Resolves a valid MongoDB ObjectId department string for backend job payload.
 */
export function resolveDepartmentId(
  deptInput: string | undefined | null,
  departments?: DepartmentItem[],
): string {
  if (!deptInput) {
    if (departments && departments.length > 0 && isMongoId(departments[0].id)) {
      return departments[0].id;
    }
    return "65f1a2b3c4d5e6f7a8b9c001";
  }

  const trimmed = deptInput.trim();
  if (isMongoId(trimmed)) return trimmed;

  if (departments && departments.length > 0) {
    const match = departments.find(
      (d) =>
        d.id === trimmed ||
        d.name.toLowerCase() === trimmed.toLowerCase() ||
        (d.code && d.code.toLowerCase() === trimmed.toLowerCase()),
    );
    if (match && isMongoId(match.id)) {
      return match.id;
    }
  }

  return trimmed;
}

/**
 * Serializes frontend JobInput into exact backend schema payload.
 */
export function serializeJobInputToBackend(
  input: JobInput,
  departments?: DepartmentItem[],
): Record<string, any> {
  // Map Type
  let type = "full_time";
  const rawType = (input.type || "").toLowerCase().replace(/[-_ ]/g, "");
  if (rawType.includes("intern")) type = "internship";
  else if (rawType.includes("part")) type = "part_time";
  else if (rawType.includes("contract")) type = "contract";
  else if (rawType === "remote") type = "remote";
  else type = "full_time";

  // Map Workplace
  let workplace = "remote";
  const rawWp = (input.workplace || "").toLowerCase();
  if (rawWp === "on-site" || rawWp === "office" || rawWp === "onsite") workplace = "office";
  else if (rawWp === "hybrid") workplace = "hybrid";
  else workplace = "remote";

  const departmentId = resolveDepartmentId(input.department, departments);

  const payload: Record<string, any> = {
    title: input.title.trim(),
    department: departmentId,
    type,
    workplace,
    location: (input.location || "Remote").trim(),
    summary: (input.summary || "").trim(),
    responsibilities: Array.isArray(input.responsibilities) ? input.responsibilities.filter(Boolean) : [],
    requirements: Array.isArray(input.requirements) ? input.requirements.filter(Boolean) : [],
    benefits: Array.isArray(input.benefits) ? input.benefits.filter(Boolean) : [],
    orderIndex: Number(input.order_index ?? 1),
    isFeatured: Boolean(input.is_featured),
    isActive: input.status !== "closed" && input.status !== "draft",
  };

  if (input.apply_url && input.apply_url.trim().length > 0) {
    payload.applyUrl = input.apply_url.trim();
  }

  return payload;
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

  if (!input.job_id || input.job_id.trim().length === 0) {
    errors.job_id = "Please select a job position.";
  }

  if (!input.resume_data_url || input.resume_data_url.trim().length === 0) {
    errors.resume = "Please upload your resume (PDF, DOC, or DOCX).";
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
