/**
 * In-memory persistence and seed data store for Our Work & Our Products case studies.
 * Includes complete CRUD operations, real-time status toggles, and seed integrity.
 */

import {
  type ProjectItem,
  type ProjectInput,
  type PublicWorkPayload,
  type WorkCategoryItem,
  type WorkCategoryInput,
  slugifyProject,
  slugifyWorkCategory,
  validateProjectInput,
  validateWorkCategoryInput,
} from "./work.shared";

export const INITIAL_WORK_CATEGORIES: WorkCategoryItem[] = [];

const INITIAL_PROJECTS: ProjectItem[] = [];

class MemoryWorkStore {
  private projects: Map<string, ProjectItem> = new Map(
    INITIAL_PROJECTS.map((p) => [p.id, { ...p }]),
  );
  private categoryItems: Map<string, WorkCategoryItem> = new Map(
    INITIAL_WORK_CATEGORIES.map((c) => [c.id, { ...c }]),
  );

  public setProjects(projects: ProjectItem[]): void {
    if (Array.isArray(projects)) {
      this.projects.clear();
      projects.forEach((proj) => this.projects.set(proj.id, { ...proj }));
    }
  }

  public setCategories(categories: WorkCategoryItem[]): void {
    if (Array.isArray(categories)) {
      this.categoryItems.clear();
      categories.forEach((cat) => this.categoryItems.set(cat.id, { ...cat }));
    }
  }

  public getCategoryItems(): WorkCategoryItem[] {
    return Array.from(this.categoryItems.values()).sort((a, b) => a.order_index - b.order_index);
  }

  public getActiveCategories(): WorkCategoryItem[] {
    return this.getCategoryItems().filter((c) => c.status === "active");
  }

  public getCategoryNames(): string[] {
    const list = this.getActiveCategories().map((c) => c.name);
    return ["All", ...list];
  }

  public getCategoryProjectCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    const projectsList = Array.from(this.projects.values());
    for (const cat of this.categoryItems.values()) {
      const catLower = cat.name.trim().toLowerCase();
      const count = projectsList.filter((p) => {
        const pCat = p.category.trim().toLowerCase();
        return pCat === catLower || pCat.startsWith(catLower) || pCat.includes(catLower);
      }).length;
      counts[cat.name] = count;
      counts[catLower] = count;
    }
    return counts;
  }

  public getCategoryProjectCount(categoryName: string): number {
    const clean = categoryName.trim().toLowerCase();
    return Array.from(this.projects.values()).filter((p) => {
      const pCat = p.category.trim().toLowerCase();
      return pCat === clean || pCat.startsWith(clean) || pCat.includes(clean);
    }).length;
  }

  public saveCategory(input: WorkCategoryInput): WorkCategoryItem {
    const validation = validateWorkCategoryInput(input);
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid category input.");
    }

    const now = new Date().toISOString();
    const id = input.id || `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const slug = input.slug?.trim() || slugifyWorkCategory(input.name);
    const existing = this.categoryItems.get(id);

    const oldName = existing?.name;
    const newName = input.name.trim();

    const item: WorkCategoryItem = {
      id,
      name: newName,
      slug,
      description: input.description?.trim() || (existing ? existing.description : undefined),
      status: input.status ?? (existing ? existing.status : "active"),
      order_index: input.order_index ?? (existing ? existing.order_index : this.categoryItems.size + 1),
      created_at: existing?.created_at || now,
      updated_at: now,
    };

    this.categoryItems.set(id, item);

    // If renamed, cascade rename to projects using this category
    if (oldName && oldName.toLowerCase() !== newName.toLowerCase()) {
      for (const [pId, p] of this.projects.entries()) {
        if (p.category.toLowerCase().includes(oldName.toLowerCase())) {
          const updatedCat = p.category.replace(new RegExp(oldName, "i"), newName);
          this.projects.set(pId, { ...p, category: updatedCat, updated_at: now });
        }
      }
    }

    return item;
  }

  public deleteCategory(id: string): { success: boolean; projectCount: number; category?: WorkCategoryItem } {
    const cat = this.categoryItems.get(id);
    if (!cat) return { success: false, projectCount: 0 };

    const projectCount = this.getCategoryProjectCount(cat.name);
    this.categoryItems.delete(id);
    return { success: true, projectCount, category: cat };
  }

  public getPublicPayload(): PublicWorkPayload {
    const list = Array.from(this.projects.values())
      .filter((p) => p.is_active)
      .sort((a, b) => a.order_index - b.order_index);

    const totalWork = list.filter((p) => p.type === "work").length;
    const totalProducts = list.filter((p) => p.type === "product").length;
    const categories = this.getCategoryNames();
    const categoryItems = this.getCategoryItems();

    return {
      projects: list,
      categories,
      categoryItems,
      stats: {
        totalProjects: list.length,
        totalWork,
        totalProducts,
        satisfactionScore: "99.4%",
        deliveryRate: "100%",
      },
    };
  }

  public getAllProjects(): ProjectItem[] {
    return Array.from(this.projects.values()).sort((a, b) => a.order_index - b.order_index);
  }

  public getProjectBySlug(slugOrId: string): ProjectItem | null {
    const clean = slugOrId.toLowerCase().trim();
    for (const p of this.projects.values()) {
      if ((p.slug.toLowerCase() === clean || p.id.toLowerCase() === clean) && p.is_active) {
        return p;
      }
    }
    return null;
  }

  public getProjectById(id: string): ProjectItem | null {
    return this.projects.get(id) || null;
  }

  public saveProject(input: ProjectInput): ProjectItem {
    const validation = validateProjectInput(input);
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid project data.");
    }

    const now = new Date().toISOString();
    const id = input.id || `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const slug = input.slug?.trim() || slugifyProject(input.title);

    const existing = this.projects.get(id);

    const item: ProjectItem = {
      id,
      slug,
      title: input.title.trim(),
      type: input.type,
      category: input.category.trim(),
      tagline: input.tagline?.trim() || input.overview.slice(0, 80),
      overview: input.overview.trim(),
      challenge: input.challenge.trim(),
      solution: input.solution.trim(),
      outcome: input.outcome.trim(),
      cover_image: input.cover_image.trim(),
      gallery_images: input.gallery_images || [],
      website_url: input.website_url?.trim() || undefined,
      client_name: input.client_name?.trim() || undefined,
      timeline: input.timeline?.trim() || undefined,
      tech_stack: input.tech_stack || [],
      metrics: input.metrics || [],
      order_index: input.order_index ?? (existing ? existing.order_index : this.projects.size + 1),
      is_featured: input.is_featured ?? (existing ? existing.is_featured : false),
      is_active: input.is_active ?? (existing ? existing.is_active : true),
      created_at: existing ? existing.created_at : now,
      updated_at: now,
    };

    this.projects.set(id, item);
    return item;
  }

  public deleteProject(id: string): boolean {
    return this.projects.delete(id);
  }
}

// Global persistent instance on server
const globalForWork = globalThis as unknown as { __dimisi_work_store__?: MemoryWorkStore };
export const workStore = globalForWork.__dimisi_work_store__ || new MemoryWorkStore();
if (process.env.NODE_ENV !== "production") {
  globalForWork.__dimisi_work_store__ = workStore;
}

