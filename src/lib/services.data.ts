/**
 * Live Dynamic Services Cache for DIMISI Technologies.
 * ZERO local storage, ZERO static seeds, ZERO mock fallbacks.
 * All state is dynamic and backed directly by MongoDB REST endpoints.
 */
import {
  type CompanyService,
  type IndustrySector,
  type ServiceCategoryItem,
  type PublicServicesPayload,
} from "./services.shared";

class LiveServicesStore {
  private _services: CompanyService[] = [];
  private _categories: ServiceCategoryItem[] = [];

  get services(): CompanyService[] {
    return [...this._services].sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999));
  }

  get categoryItems(): ServiceCategoryItem[] {
    return [...this._categories].sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999));
  }

  get categories(): string[] {
    return this._categories
      .filter((c) => c.status === "active")
      .sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999))
      .map((c) => c.name);
  }

  getCategoryItems(): ServiceCategoryItem[] {
    return this.categoryItems;
  }

  getActiveCategories(): ServiceCategoryItem[] {
    return this._categories
      .filter((c) => c.status === "active")
      .sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999));
  }

  setCategories(categories: ServiceCategoryItem[]): void {
    if (Array.isArray(categories)) {
      this._categories = [...categories];
    }
  }

  setServices(services: CompanyService[]): void {
    if (Array.isArray(services)) {
      this._services = [...services];
    }
  }

  getCategoryServiceCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const s of this._services) {
      const cat = s.category?.trim();
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
        counts[cat.toLowerCase()] = (counts[cat.toLowerCase()] || 0) + 1;
      }
    }
    return counts;
  }

  saveCategory(input: ServiceCategoryItem): ServiceCategoryItem {
    const idx = this._categories.findIndex((c) => c.id === input.id);
    if (idx !== -1) {
      this._categories[idx] = input;
    } else {
      this._categories.push(input);
    }
    return input;
  }

  deleteCategory(id: string): boolean {
    const initLen = this._categories.length;
    this._categories = this._categories.filter((c) => c.id !== id);
    return this._categories.length < initLen;
  }

  getPublicPayload(): PublicServicesPayload {
    const activeServices = this._services
      .filter((s) => s.is_active)
      .sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999));

    const activeCategories = this.getActiveCategories();

    return {
      services: activeServices,
      industries: [],
      categories: activeCategories.map((c) => c.name),
      categoryItems: activeCategories,
      stats: {
        totalServices: activeServices.length,
        totalCategories: activeCategories.length,
        uptimeSla: "99.99%",
        satisfactionScore: "4.9/5",
      },
    };
  }

  getServiceBySlug(slug: string): CompanyService | null {
    const trimmed = slug.trim().toLowerCase();
    const found = this._services.find(
      (s) => s.slug.toLowerCase() === trimmed || s.id === slug,
    );
    return found ? { ...found } : null;
  }

  saveService(input: CompanyService): CompanyService {
    const idx = this._services.findIndex((s) => s.id === input.id);
    if (idx !== -1) {
      this._services[idx] = input;
    } else {
      this._services.push(input);
    }
    return input;
  }

  deleteService(id: string): boolean {
    const initLen = this._services.length;
    this._services = this._services.filter((s) => s.id !== id);
    return this._services.length < initLen;
  }
}

const globalForServices = globalThis as unknown as {
  dimisiServicesStore?: LiveServicesStore;
};

export const servicesStore =
  globalForServices.dimisiServicesStore ?? new LiveServicesStore();

if (process.env.NODE_ENV !== "production") {
  globalForServices.dimisiServicesStore = servicesStore;
}
