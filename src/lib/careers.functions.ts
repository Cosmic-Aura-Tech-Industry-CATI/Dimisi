import { createServerFn } from "@tanstack/react-start";
import { careersStore } from "./careers.server";
import {
  type JobOpening,
  type JobInput,
  type HiringProcessStep,
  type CultureBenefit,
  type CareersHeroConfig,
  type CareersClosingCtaConfig,
  type PublicCareersPayload,
  validateJobInput,
} from "./careers.shared";

/**
 * Public function to fetch active job openings, hiring steps, benefits, hero config, and stats.
 */
export const getPublicCareersData = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicCareersPayload> => {
    return careersStore.getPublicPayload();
  }
);

/**
 * Public function to fetch single job details by slug.
 */
export const getJobBySlug = createServerFn({ method: "GET" })
  .validator((d: { slug: string }) => d)
  .handler(async ({ data }): Promise<JobOpening | null> => {
    if (!data?.slug) return null;
    return careersStore.getJobBySlug(data.slug);
  });

/**
 * Admin function to fetch all jobs (including closed/draft) and configuration settings.
 */
export const getAdminCareersData = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    jobs: JobOpening[];
    hiring_steps: HiringProcessStep[];
    benefits: CultureBenefit[];
    hero: CareersHeroConfig;
    closing_cta: CareersClosingCtaConfig;
    stats: PublicCareersPayload["stats"];
  }> => {
    const payload = careersStore.getPublicPayload();
    const allJobs = careersStore.getAllJobs();
    return {
      jobs: allJobs,
      hiring_steps: payload.hiring_steps,
      benefits: payload.benefits,
      hero: payload.hero,
      closing_cta: payload.closing_cta,
      stats: payload.stats,
    };
  }
);

/**
 * Admin function to create or update a job opening.
 */
export const saveJobFn = createServerFn({ method: "POST" })
  .validator((d: JobInput) => d)
  .handler(async ({ data }): Promise<{ success: boolean; job?: JobOpening; error?: string }> => {
    try {
      const validation = validateJobInput(data);
      if (!validation.valid) {
        return { success: false, error: validation.error || "Validation failed." };
      }
      const saved = careersStore.saveJob(data);
      return { success: true, job: saved };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to save job opening.",
      };
    }
  });

/**
 * Admin function to delete a job opening.
 */
export const deleteJobFn = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!data?.id) return { success: false, error: "Job ID is required." };
      const ok = careersStore.deleteJob(data.id);
      return { success: ok };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete job opening.",
      };
    }
  });

/**
 * Admin function to update the 5-step hiring process.
 */
export const saveHiringStepsFn = createServerFn({ method: "POST" })
  .validator((d: { steps: HiringProcessStep[] }) => d)
  .handler(async ({ data }): Promise<{ success: boolean; steps: HiringProcessStep[] }> => {
    const updated = careersStore.updateHiringSteps(data.steps);
    return { success: true, steps: updated };
  });

/**
 * Admin function to update the culture & benefits list.
 */
export const saveBenefitsFn = createServerFn({ method: "POST" })
  .validator((d: { benefits: CultureBenefit[] }) => d)
  .handler(async ({ data }): Promise<{ success: boolean; benefits: CultureBenefit[] }> => {
    const updated = careersStore.updateBenefits(data.benefits);
    return { success: true, benefits: updated };
  });

/**
 * Admin function to update Hero & Closing CTA configurations.
 */
export const saveCareersHeroFn = createServerFn({ method: "POST" })
  .validator(
    (d: { hero?: Partial<CareersHeroConfig>; closing_cta?: Partial<CareersClosingCtaConfig> }) => d
  )
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    if (data.hero) careersStore.updateHero(data.hero);
    if (data.closing_cta) careersStore.updateClosingCta(data.closing_cta);
    return { success: true };
  });
