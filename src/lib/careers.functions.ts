/**
 * DIMISI Technologies — Client-Side Careers Functions
 * Pure client-side implementation backed by in-memory and local data.
 */
import { careersStore } from "./careers.data";
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

export async function getPublicCareersData(): Promise<PublicCareersPayload> {
  return careersStore.getPublicPayload();
}

export async function getJobBySlug({
  data,
}: {
  data: { slug: string };
}): Promise<JobOpening | null> {
  if (!data?.slug) return null;
  return careersStore.getJobBySlug(data.slug);
}

export async function getAdminCareersData(): Promise<{
  jobs: JobOpening[];
  hiring_steps: HiringProcessStep[];
  benefits: CultureBenefit[];
  hero: CareersHeroConfig;
  closing_cta: CareersClosingCtaConfig;
  stats: PublicCareersPayload["stats"];
}> {
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

export async function saveJobFn({
  data,
}: {
  data: JobInput;
}): Promise<{ success: boolean; job?: JobOpening; error?: string }> {
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
}

export async function deleteJobFn({
  data,
}: {
  data: { id: string };
}): Promise<{ success: boolean; error?: string }> {
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
}

export async function saveHiringStepsFn({
  data,
}: {
  data: { steps: HiringProcessStep[] };
}): Promise<{ success: boolean; steps: HiringProcessStep[] }> {
  const updated = careersStore.updateHiringSteps(data.steps);
  return { success: true, steps: updated };
}

export async function saveBenefitsFn({
  data,
}: {
  data: { benefits: CultureBenefit[] };
}): Promise<{ success: boolean; benefits: CultureBenefit[] }> {
  const updated = careersStore.updateBenefits(data.benefits);
  return { success: true, benefits: updated };
}

export async function saveCareersHeroFn({
  data,
}: {
  data: { hero?: Partial<CareersHeroConfig>; closing_cta?: Partial<CareersClosingCtaConfig> };
}): Promise<{ success: boolean }> {
  if (data.hero) careersStore.updateHero(data.hero);
  if (data.closing_cta) careersStore.updateClosingCta(data.closing_cta);
  return { success: true };
}
