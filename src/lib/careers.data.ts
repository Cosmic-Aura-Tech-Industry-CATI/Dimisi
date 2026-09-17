/**
 * In-memory persistence and seed store for DIMISI Careers & Recruitment Ecosystem.
 * Includes complete CRUD for jobs, hiring steps, benefits, and hero configs.
 */

import {
  type JobOpening,
  type JobInput,
  type JobApplicationItem,
  type JobApplicationInput,
  type ApplicationStatus,
  type HiringProcessStep,
  type CultureBenefit,
  type CareersHeroConfig,
  type CareersClosingCtaConfig,
  type PublicCareersPayload,
  slugifyJob,
  validateJobInput,
  validateJobApplicationInput,
} from "./careers.shared";

const INITIAL_HERO: CareersHeroConfig = {
  eyebrow: "Careers",
  heading: "Build the Future With Us",
  subline: "Join a curious, innovation-focused team where your work ships and your ideas matter.",
  cta_text: "Apply Now",
  cta_link: "#open-positions",
  illustration_caption: "Bhootdev Careers",
};

const INITIAL_CLOSING_CTA: CareersClosingCtaConfig = {
  heading: "Ready to Join Us?",
  subline: "Send us your details and tell us what you'd love to work on.",
  cta_text: "Apply Now",
  cta_link: "#open-positions",
};

const INITIAL_HIRING_STEPS: HiringProcessStep[] = [
  {
    step: "01",
    title: "Application",
    detail: "Submit your profile, portfolio, or past projects. We review real craft, not generic resume buzzwords.",
    duration: "24-48 Hours",
  },
  {
    step: "02",
    title: "Intro Call",
    detail: "A friendly 20-minute video chat to discuss your ambitions, creative vision, and mutual team fit.",
    duration: "20 Minutes",
  },
  {
    step: "03",
    title: "Technical / Portfolio",
    detail: "A deep dive into your design or writing portfolio, or a practical, paid micro-task at your own pace.",
    duration: "3-5 Days",
  },
  {
    step: "04",
    title: "Team Interview",
    detail: "Meet your future peers, learn about current projects, and ask anything about our culture and workflow.",
    duration: "45 Minutes",
  },
  {
    step: "05",
    title: "Offer",
    detail: "Transparent offer letter with competitive stipend/compensation, mentorship roadmap, and clear start date.",
    duration: "48 Hours",
  },
];

const INITIAL_BENEFITS: CultureBenefit[] = [
  {
    id: "ben-1",
    title: "Remote-First",
    description: "Work from anywhere with flexible hours and asynchronous communication respect.",
    icon_tag: "globe",
  },
  {
    id: "ben-2",
    title: "Health & Wellness",
    description: "Support for your physical and mental health with dedicated wellness programs.",
    icon_tag: "heart",
  },
  {
    id: "ben-3",
    title: "Learning Budget",
    description: "Grow continuously with stipends for design courses, tech books, and global conferences.",
    icon_tag: "book",
  },
  {
    id: "ben-4",
    title: "Paid Time Off",
    description: "Generous, recharge-when-you-need-it leave policy to keep you fresh and inspired.",
    icon_tag: "sun",
  },
  {
    id: "ben-5",
    title: "Great Gear",
    description: "The tools, software licenses, and hardware setup you need to do your best work.",
    icon_tag: "laptop",
  },
  {
    id: "ben-6",
    title: "Real Ownership",
    description: "Meaningful projects that ship directly to production with visible impact and attribution.",
    icon_tag: "shield",
  },
];

export const INITIAL_JOBS: JobOpening[] = [];

export const INITIAL_APPLICATIONS: JobApplicationItem[] = [];

class MemoryCareersStore {
  private jobs: Map<string, JobOpening> = new Map();
  private applications: Map<string, JobApplicationItem> = new Map();
  private hiringSteps: HiringProcessStep[] = [...INITIAL_HIRING_STEPS];
  private benefits: CultureBenefit[] = [...INITIAL_BENEFITS];
  private hero: CareersHeroConfig = { ...INITIAL_HERO };
  private closingCta: CareersClosingCtaConfig = { ...INITIAL_CLOSING_CTA };

  constructor() {
    // Initialized empty — live database is the single source of truth
  }

  public setJobs = (jobs: JobOpening[]): void => {
    if (!this.jobs) this.jobs = new Map();
    this.jobs.clear();
    jobs.forEach((j) => this.jobs.set(j.id, { ...j }));
  };

  public setApplications = (applications: JobApplicationItem[]): void => {
    if (!this.applications) this.applications = new Map();
    this.applications.clear();
    applications.forEach((a) => this.applications.set(a.id, { ...a }));
  };

  public getPublicPayload(): PublicCareersPayload {
    const list = Array.from(this.jobs.values())
      .filter((j) => j.status === "open")
      .sort((a, b) => a.order_index - b.order_index);

    const departments = new Set(list.map((j) => j.department));

    return {
      hero: { ...this.hero },
      jobs: list,
      hiring_steps: [...this.hiringSteps],
      benefits: [...this.benefits],
      closing_cta: { ...this.closingCta },
      stats: {
        totalOpenings: list.length,
        departmentsCount: departments.size,
        hiringTimeline: "2-3 Weeks",
        responseRate: "100%",
      },
    };
  }

  public getAllJobs(): JobOpening[] {
    return Array.from(this.jobs.values()).sort((a, b) => a.order_index - b.order_index);
  }

  public getJobBySlug(slug: string): JobOpening | null {
    const clean = slug.toLowerCase().trim();
    for (const j of this.jobs.values()) {
      if (j.slug.toLowerCase() === clean && j.status === "open") {
        return j;
      }
    }
    return null;
  }

  public getJobById(id: string): JobOpening | null {
    return this.jobs.get(id) || null;
  }

  public saveJob(input: JobInput): JobOpening {
    const validation = validateJobInput(input);
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid job input.");
    }

    const now = new Date().toISOString();
    const id = input.id || `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const slug = input.slug?.trim() || slugifyJob(input.title);

    const existing = this.jobs.get(id);

    const item: JobOpening = {
      id,
      slug,
      title: input.title.trim(),
      department: input.department.trim(),
      type: input.type,
      workplace: input.workplace || (existing ? existing.workplace : "Remote"),
      location: input.location.trim(),
      summary: input.summary.trim(),
      responsibilities: input.responsibilities || (existing ? existing.responsibilities : []),
      requirements: input.requirements || (existing ? existing.requirements : []),
      benefits: input.benefits || (existing ? existing.benefits : []),
      apply_url: input.apply_url?.trim() || "",
      order_index: input.order_index ?? (existing ? existing.order_index : this.jobs.size + 1),
      is_featured: input.is_featured ?? (existing ? existing.is_featured : false),
      status: input.status ?? (existing ? existing.status : "open"),
      created_at: existing ? existing.created_at : now,
      updated_at: now,
    };

    this.jobs.set(id, item);
    return item;
  }

  public deleteJob(id: string): boolean {
    return this.jobs.delete(id);
  }

  // --- JOB APPLICATIONS ---
  public submitApplication(input: JobApplicationInput): JobApplicationItem {
    const validation = validateJobApplicationInput(input);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0] || "Invalid application input.";
      throw new Error(firstError);
    }

    const now = new Date().toISOString();
    const id = `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const job = this.getJobById(input.job_id) || this.getJobBySlug(input.job_id);
    const jobTitle = job ? job.title : "General Application";
    const jobDept = job ? job.department : "General";

    const application: JobApplicationItem = {
      id,
      job_id: input.job_id || "general-inquiry",
      job_title: jobTitle,
      job_department: jobDept,
      full_name: input.full_name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      location: input.location.trim(),
      portfolio_url: input.portfolio_url?.trim() || undefined,
      linkedin_url: input.linkedin_url?.trim() || undefined,
      github_url: input.github_url?.trim() || undefined,
      cover_letter: input.cover_letter?.trim() || undefined,
      additional_info: input.additional_info?.trim() || undefined,
      resume_name: "Resume.pdf",
      resume_size: 0,
      resume_type: "application/pdf",
      resume_data_url: input.resume_data_url,
      status: "new",
      applied_at: now,
    };

    this.applications.set(id, application);
    return application;
  }

  public getAllApplications(): JobApplicationItem[] {
    return Array.from(this.applications.values()).sort(
      (a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
    );
  }

  public getApplicationById(id: string): JobApplicationItem | null {
    return this.applications.get(id) || null;
  }

  public updateApplicationStatus(
    id: string,
    status: ApplicationStatus,
    notes?: string
  ): JobApplicationItem | null {
    const app = this.applications.get(id);
    if (!app) return null;

    const updated: JobApplicationItem = {
      ...app,
      status,
      notes: notes !== undefined ? notes : app.notes,
    };

    this.applications.set(id, updated);
    return updated;
  }

  public deleteApplication(id: string): boolean {
    return this.applications.delete(id);
  }

  // --- RECRUITMENT STEPS & BENEFITS ---
  public updateHiringSteps(steps: HiringProcessStep[]): HiringProcessStep[] {
    this.hiringSteps = [...steps];
    return this.hiringSteps;
  }

  public updateBenefits(benefits: CultureBenefit[]): CultureBenefit[] {
    this.benefits = [...benefits];
    return this.benefits;
  }

  public updateHero(hero: Partial<CareersHeroConfig>): CareersHeroConfig {
    this.hero = { ...this.hero, ...hero };
    return this.hero;
  }

  public updateClosingCta(cta: Partial<CareersClosingCtaConfig>): CareersClosingCtaConfig {
    this.closingCta = { ...this.closingCta, ...cta };
    return this.closingCta;
  }
}

// Global persistent instance on server / runtime
const globalForCareers = globalThis as unknown as {
  __dimisi_careers_store__?: MemoryCareersStore;
};

// Check if existing cached instance is valid and has callable setJobs
const existingStore = globalForCareers.__dimisi_careers_store__;
const isValidStore =
  existingStore &&
  typeof existingStore.setJobs === "function" &&
  typeof existingStore.setApplications === "function";

export const careersStore: MemoryCareersStore = isValidStore
  ? existingStore
  : new MemoryCareersStore();

// Fallback runtime safety guard
if (typeof (careersStore as any).setJobs !== "function") {
  (careersStore as any).setJobs = function (jobs: JobOpening[]): void {
    if (!this.jobs) this.jobs = new Map();
    this.jobs.clear();
    jobs.forEach((j: JobOpening) => this.jobs.set(j.id, { ...j }));
  };
}

if (typeof (careersStore as any).setApplications !== "function") {
  (careersStore as any).setApplications = function (applications: JobApplicationItem[]): void {
    if (!this.applications) this.applications = new Map();
    this.applications.clear();
    applications.forEach((a: JobApplicationItem) => this.applications.set(a.id, { ...a }));
  };
}

globalForCareers.__dimisi_careers_store__ = careersStore;
