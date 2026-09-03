/** Shared, client-safe types and helpers for DIMISI Dynamic Services & Industries. */

export interface ServiceProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface ServiceBenefit {
  title: string;
  description: string;
  metric?: string | null | undefined;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceGalleryImage {
  url: string;
  caption?: string | null | undefined;
  alt?: string | null | undefined;
}

export interface CompanyService {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  tagline: string;
  hero_image: string;
  related_images: ServiceGalleryImage[];
  
  // 4-point architecture overview
  what_is_it: string;
  who_is_for: string;
  problem_solved: string;
  why_it_matters: string;
  
  // Deliverables, process, benefits & FAQs
  features: string[];
  process_steps: ServiceProcessStep[];
  benefits: ServiceBenefit[];
  faqs: ServiceFaq[];
  
  // Tech & metadata
  tech_stack: string[];
  order_index: number;
  is_featured: boolean;
  is_active: boolean;
  accent_color?: string | null | undefined;
  created_at: string;
  updated_at: string;
}

export interface ServiceInput {
  id?: string | null | undefined;
  title: string;
  slug?: string | null | undefined;
  category: string;
  summary: string;
  tagline: string;
  hero_image: string;
  related_images: ServiceGalleryImage[];
  what_is_it: string;
  who_is_for: string;
  problem_solved: string;
  why_it_matters: string;
  features: string[];
  process_steps: ServiceProcessStep[];
  benefits: ServiceBenefit[];
  faqs: ServiceFaq[];
  tech_stack: string[];
  order_index?: number | null | undefined;
  is_featured?: boolean | null | undefined;
  is_active?: boolean | null | undefined;
  accent_color?: string | null | undefined;
}

export interface IndustrySector {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  badge: string;
  image_url: string;
  solutions: string[];
  accent_glow?: string | null | undefined;
  order_index: number;
}

export interface IndustryInput {
  id?: string | null | undefined;
  name: string;
  slug?: string | null | undefined;
  tagline: string;
  description: string;
  badge: string;
  image_url: string;
  solutions: string[];
  accent_glow?: string | null | undefined;
  order_index?: number | null | undefined;
}

export interface PublicServicesPayload {
  services: CompanyService[];
  industries: IndustrySector[];
  stats: {
    totalServices: number;
    totalIndustries: number;
    uptimeSla: string;
    satisfactionScore: string;
  };
}

export function slugifyService(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateServiceInput(input: ServiceInput): { valid: boolean; error?: string; field?: string } {
  const title = input.title?.trim() || "";
  const summary = input.summary?.trim() || "";
  const heroImage = input.hero_image?.trim() || "";
  const whatIsIt = input.what_is_it?.trim() || summary;

  if (title.length < 3) {
    return { valid: false, error: "Service title must be at least 3 characters long.", field: "title" };
  }
  if (summary.length < 10) {
    return { valid: false, error: "Service summary must be at least 10 characters long.", field: "summary" };
  }
  if (heroImage.length === 0) {
    return { valid: false, error: "Primary service image is required.", field: "hero_image" };
  }
  if (whatIsIt.length < 10) {
    return { valid: false, error: "Overview 'What is it' description must be at least 10 characters long.", field: "what_is_it" };
  }
  return { valid: true };
}
