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

const INITIAL_JOBS: JobOpening[] = [
  {
    id: "job-content-writer-intern",
    slug: "content-writer-intern",
    title: "Content Writer Intern",
    department: "Content & Editorial",
    type: "Internship",
    workplace: "Remote",
    location: "Remote / Noida",
    summary:
      "Research, write, and craft compelling narratives, tech articles, case studies, and engaging social content across DIMISI and Kalesh platforms.",
    responsibilities: [
      "Draft high-impact technical blog posts, project case studies, and product launch announcements.",
      "Write engaging viral copy and conversational prompts for the Kalesh social ecosystem.",
      "Collaborate with engineering and UI/UX designers to translate complex architectures into clear documentation.",
      "Optimize website content for search visibility, conversion, and brand voice consistency.",
    ],
    requirements: [
      "Exceptional English written communication with a keen eye for storytelling and clarity.",
      "Curiosity about modern web development, artificial intelligence, and startup culture.",
      "Demonstrated writing portfolio (articles, newsletters, blogs, or social threads).",
      "Ability to work independently in a fast-paced, remote-friendly team.",
    ],
    benefits: [
      "Monthly competitive internship stipend with performance bonuses.",
      "Direct mentorship from founding engineers and product leads.",
      "Fast-track conversion to full-time Associate Content Strategist.",
      "Flexible working hours and 100% remote flexibility.",
    ],
    apply_url: "",
    order_index: 1,
    is_featured: true,
    status: "open",
    created_at: "2026-08-20T10:00:00Z",
    updated_at: "2026-08-27T08:00:00Z",
  },
  {
    id: "job-graphic-designer-intern",
    slug: "graphic-designer-intern",
    title: "Graphic Designer Intern",
    department: "Design & Creative",
    type: "Internship",
    workplace: "Remote",
    location: "Remote / Noida",
    summary:
      "Design visual assets, marketing graphics, 3D social plates, interface mockups, and brand identities for client projects and internal ventures.",
    responsibilities: [
      "Create striking social media visual banners, promotional graphics, and brand illustrations.",
      "Assist in crafting UI mockups, iconography sets, and digital art for web applications.",
      "Produce engaging motion graphics and short micro-animations for product announcements.",
      "Maintain design system coherence across typography, colors, and obsidian dark mode themes.",
    ],
    requirements: [
      "Proficiency in Figma, Adobe Creative Suite (Photoshop, Illustrator), or modern 3D design tools.",
      "Strong aesthetic sensibility for typography, composition, and dark cyber glass aesthetics.",
      "Portfolio showcasing graphic design, branding, illustration, or UI experimentation.",
      "Eagerness to receive creative feedback and iterate quickly.",
    ],
    benefits: [
      "Monthly competitive internship stipend with creative software tool subscriptions.",
      "Direct guidance from Senior Art Directors and Product Designers.",
      "Full ownership of visual campaigns featured on high-traffic websites.",
      "Potential pre-placement offer (PPO) based on internship performance.",
    ],
    apply_url: "",
    order_index: 2,
    is_featured: true,
    status: "open",
    created_at: "2026-08-21T10:00:00Z",
    updated_at: "2026-08-27T08:00:00Z",
  },
];

const INITIAL_APPLICATIONS: JobApplicationItem[] = [
  {
    id: "app-101",
    job_id: "job-graphic-designer-intern",
    job_title: "Graphic Designer Intern",
    job_department: "Design & Creative",
    full_name: "Aarav Sharma",
    email: "aarav.sharma.design@gmail.com",
    phone: "+91 98765 43210",
    location: "Noida, Uttar Pradesh",
    portfolio_url: "https://behance.net/aaravsharma-design",
    linkedin_url: "https://linkedin.com/in/aarav-sharma-ux",
    github_url: "https://github.com/aarav-designs",
    cover_letter: "I specialize in obsidian dark-mode interface mockups, 3D visual assets, and high-conversion social creatives. I have worked extensively with Figma, Blender, and modern vector design systems.",
    additional_info: "Available to start immediately for a full-time or remote internship.",
    resume_name: "Aarav_Sharma_Design_Resume.pdf",
    resume_size: 2450000,
    resume_type: "application/pdf",
    resume_data_url: "data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxIAo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9MZW5ndGggMTIKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoyMCA3NTAgVGRKCihoaXJpbmcgZGVtbyByZXN1bWUpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE4IDAwMDAwIG4gCjAwMDAwMDAwNjcgMDAwMDAgbiAKMDAwMDAwMDExNCAwMDAwMCBuIAowMDAwMDAwMTcwIDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNQovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMjI0CiUlRU9GCg==",
    status: "new",
    applied_at: "2026-09-11T10:30:00.000Z",
    notes: "Strong portfolio in Figma and dark cyberpunk aesthetics. Shortlisted for screening call.",
  },
  {
    id: "app-102",
    job_id: "job-content-writer-intern",
    job_title: "Content Writer Intern",
    job_department: "Content & Editorial",
    full_name: "Priya Nair",
    email: "priya.nair.writer@outlook.com",
    phone: "+91 91234 56789",
    location: "Bengaluru / Remote",
    portfolio_url: "https://medium.com/@priya.nair.tech",
    linkedin_url: "https://linkedin.com/in/priya-nair-editorial",
    github_url: "",
    cover_letter: "I write technical long-form articles, developer case studies, and engaging community copy. Passionate about AI agents and distributed cloud architecture.",
    additional_info: "Can commit 35+ hours weekly with flexible hours.",
    resume_name: "Priya_Nair_Content_CV.pdf",
    resume_size: 1820000,
    resume_type: "application/pdf",
    resume_data_url: "data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxIAo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9MZW5ndGggMTIKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoyMCA3NTAgVGRKCihoaXJpbmcgZGVtbyByZXN1bWUpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE4IDAwMDAwIG4gCjAwMDAwMDAwNjcgMDAwMDAgbiAKMDAwMDAwMDExNCAwMDAwMCBuIAowMDAwMDAwMTcwIDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNQovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMjI0CiUlRU9GCg==",
    status: "reviewing",
    applied_at: "2026-09-10T14:15:00.000Z",
    notes: "Great sample work in technical editorial. Scheduled for interview round.",
  },
];

class MemoryCareersStore {
  private jobs: Map<string, JobOpening> = new Map();
  private applications: Map<string, JobApplicationItem> = new Map();
  private hiringSteps: HiringProcessStep[] = [...INITIAL_HIRING_STEPS];
  private benefits: CultureBenefit[] = [...INITIAL_BENEFITS];
  private hero: CareersHeroConfig = { ...INITIAL_HERO };
  private closingCta: CareersClosingCtaConfig = { ...INITIAL_CLOSING_CTA };

  constructor() {
    INITIAL_JOBS.forEach((j) => this.jobs.set(j.id, { ...j }));
    INITIAL_APPLICATIONS.forEach((a) => this.applications.set(a.id, { ...a }));
  }

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

    const application: JobApplicationItem = {
      id,
      job_id: input.job_id || "general",
      job_title: input.job_title.trim(),
      job_department: input.job_department?.trim() || "General",
      full_name: input.full_name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      location: input.location.trim(),
      portfolio_url: input.portfolio_url?.trim() || undefined,
      linkedin_url: input.linkedin_url?.trim() || undefined,
      github_url: input.github_url?.trim() || undefined,
      cover_letter: input.cover_letter?.trim() || undefined,
      additional_info: input.additional_info?.trim() || undefined,
      resume_name: input.resume_name,
      resume_size: input.resume_size,
      resume_type: input.resume_type,
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

// Global persistent instance on server
const globalForCareers = globalThis as unknown as { __dimisi_careers_store__?: MemoryCareersStore };
export const careersStore = globalForCareers.__dimisi_careers_store__ || new MemoryCareersStore();
if (process.env.NODE_ENV !== "production") {
  globalForCareers.__dimisi_careers_store__ = careersStore;
}
