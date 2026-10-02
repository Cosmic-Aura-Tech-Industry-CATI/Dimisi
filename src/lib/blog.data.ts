/**
 * In-memory persistence and seed store for DIMISI Blog & Editorial Publication System.
 * Supports full CRUD for blog posts, featured articles, categories, and notice config.
 */

import {
  type BlogPostItem,
  type BlogPostInput,
  type BlogCategoryItem,
  type BlogCategoryInput,
  type BlogConfig,
  type PublicBlogPayload,
  slugifyBlog,
  slugifyBlogCategory,
  validateBlogPostInput,
  validateBlogCategoryInput,
} from "./blog.shared";

const INITIAL_BLOG_CONFIG: BlogConfig = {
  hero_eyebrow: "Blog",
  hero_heading: "Ideas, Insights & Updates",
  hero_subline: "Thoughts on building software, shipping products, and the technology shaping tomorrow.",
  under_development_notice_active: true,
  under_development_notice_heading: "Publication Lab Under Active Development",
  under_development_notice_text: "Blog section under development. Please visit again after some time.",
};

const INITIAL_CATEGORIES: BlogCategoryItem[] = [];

const INITIAL_POSTS: BlogPostItem[] = [];

const MOCK_IDS_TO_PURGE = new Set([
  "owl-protocol",
  "post-owl-protocol",
  "agents-in-production",
  "post-agents-production",
  "cinematic-webgl-performance",
  "post-cinematic-web",
  "cloud-gpu-economics",
  "post-cloud-gpu-economics",
  "shipping-mvp-in-two-weeks",
  "post-startup-mvp-velocity",
]);

const MOCK_CAT_IDS_TO_PURGE = new Set([
  "cat-ai",
  "cat-cloud",
  "cat-web",
  "cat-mobile",
  "cat-startups",
  "cat-trends",
]);

class MemoryBlogStore {
  private posts: Map<string, BlogPostItem> = new Map();
  private config: BlogConfig = { ...INITIAL_BLOG_CONFIG };
  private categoryItems: Map<string, BlogCategoryItem> = new Map();

  constructor() {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage(): void {
    this.categoryItems.clear();
    INITIAL_CATEGORIES.forEach((c) => this.categoryItems.set(c.id, { ...c }));

    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const storedPosts = localStorage.getItem("dimisi_blog_posts");
        if (storedPosts) {
          const parsed = JSON.parse(storedPosts);
          if (Array.isArray(parsed)) {
            this.posts.clear();
            parsed.forEach((p: BlogPostItem) => {
              if (
                p &&
                p.id &&
                !MOCK_IDS_TO_PURGE.has(p.id) &&
                !MOCK_IDS_TO_PURGE.has(p.slug)
              ) {
                this.posts.set(p.id, p);
              }
            });
            // Overwrite storage to purge legacy mock items immediately
            this.persistToStorage();
          }
        }

        const storedCats = localStorage.getItem("dimisi_blog_categories");
        if (storedCats) {
          const parsed = JSON.parse(storedCats);
          if (Array.isArray(parsed)) {
            this.categoryItems.clear();
            parsed.forEach((c: BlogCategoryItem) => {
              if (c && c.id && !MOCK_CAT_IDS_TO_PURGE.has(c.id)) {
                this.categoryItems.set(c.id, c);
              }
            });
            this.persistToStorage();
          }
        }

        const storedConfig = localStorage.getItem("dimisi_blog_config");
        if (storedConfig) {
          const parsed = JSON.parse(storedConfig);
          if (parsed && typeof parsed === "object") {
            this.config = { ...this.config, ...parsed };
          }
        }
      } catch {}
    }
  }

  private persistToStorage(): void {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        localStorage.setItem(
          "dimisi_blog_posts",
          JSON.stringify(Array.from(this.posts.values()))
        );
        localStorage.setItem(
          "dimisi_blog_categories",
          JSON.stringify(Array.from(this.categoryItems.values()))
        );
        localStorage.setItem("dimisi_blog_config", JSON.stringify(this.config));
      } catch {}
    }
  }

  public getCategoryItems(): BlogCategoryItem[] {
    return Array.from(this.categoryItems.values()).sort((a, b) => a.order_index - b.order_index);
  }

  public getActiveCategories(): BlogCategoryItem[] {
    return this.getCategoryItems().filter((c) => c.status === "active");
  }

  public getCategoryNames(): string[] {
    const active = this.getActiveCategories().map((c) => c.name);
    return ["All Posts", ...active];
  }

  public getCategoryPostCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const p of this.posts.values()) {
      const cat = p.category.trim();
      counts[cat] = (counts[cat] || 0) + 1;
      counts[cat.toLowerCase()] = (counts[cat.toLowerCase()] || 0) + 1;
    }
    return counts;
  }

  public getCategoryPostCount(categoryName: string): number {
    let count = 0;
    const target = categoryName.trim().toLowerCase();
    for (const p of this.posts.values()) {
      if (p.category.trim().toLowerCase() === target) {
        count++;
      }
    }
    return count;
  }

  public saveCategory(input: BlogCategoryInput): BlogCategoryItem {
    const validation = validateBlogCategoryInput(input);
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid category input.");
    }

    const now = new Date().toISOString();
    const id = input.id || `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const slug = input.slug?.trim() || slugifyBlogCategory(input.name);
    const existing = this.categoryItems.get(id);

    const oldName = existing?.name;
    const newName = input.name.trim();

    const item: BlogCategoryItem = {
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

    // If renamed, update posts that used old category name
    if (oldName && oldName.toLowerCase() !== newName.toLowerCase()) {
      for (const [pId, p] of this.posts.entries()) {
        if (p.category.toLowerCase() === oldName.toLowerCase()) {
          this.posts.set(pId, { ...p, category: newName, updated_at: now });
        }
      }
    }

    this.persistToStorage();
    return item;
  }

  public deleteCategory(id: string): { success: boolean; postCount: number; category?: BlogCategoryItem } {
    const cat = this.categoryItems.get(id);
    if (!cat) return { success: false, postCount: 0 };

    const postCount = this.getCategoryPostCount(cat.name);
    this.categoryItems.delete(id);
    this.persistToStorage();
    return { success: true, postCount, category: cat };
  }

  public getPublicPayload(): PublicBlogPayload {
    const list = Array.from(this.posts.values())
      .filter((p) => p.status === "published")
      .sort((a, b) => a.order_index - b.order_index);

    const featured = list.find((p) => p.is_featured) || (list.length > 0 ? list[0] : null);
    const catNames = this.getCategoryNames();
    const catItems = this.getCategoryItems();

    return {
      config: { ...this.config },
      featured_post: featured ? { ...featured } : null,
      posts: list,
      categories: catNames,
      categoryItems: catItems,
      stats: {
        totalPosts: list.length,
        totalCategories: catNames.length - 1, // minus 'All Posts'
        avgReadingTime: "8 min",
        latestPublishedDate: list.length > 0 ? list[0].published_at : new Date().toISOString(),
      },
    };
  }

  public getAllPosts(): BlogPostItem[] {
    return Array.from(this.posts.values()).sort((a, b) => a.order_index - b.order_index);
  }

  public getPostBySlug(slug: string): BlogPostItem | null {
    const clean = slug.toLowerCase().trim();
    for (const p of this.posts.values()) {
      if (p.slug.toLowerCase() === clean && p.status === "published") {
        return p;
      }
    }
    return null;
  }

  public getPostById(id: string): BlogPostItem | null {
    return this.posts.get(id) || null;
  }

  public savePost(input: BlogPostInput): BlogPostItem {
    const validation = validateBlogPostInput(input);
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid blog post input.");
    }

    const now = new Date().toISOString();
    const id = input.id || `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const slug = input.slug?.trim() || slugifyBlog(input.title);

    const existing = this.posts.get(id);

    const item: BlogPostItem = {
      id,
      slug,
      title: input.title.trim(),
      category: input.category.trim(),
      tags: input.tags || (existing ? existing.tags : []),
      excerpt: input.excerpt.trim(),
      content: input.content.trim(),
      cover_image: input.cover_image.trim(),
      cover_caption: input.cover_caption || (existing ? existing.cover_caption : undefined),
      cover_alt: input.cover_alt || (existing ? existing.cover_alt : undefined),
      cover_credit: input.cover_credit || (existing ? existing.cover_credit : undefined),
      author_name: input.author_name?.trim() || (existing ? existing.author_name : "DIMISI Editorial"),
      author_role: input.author_role?.trim() || (existing ? existing.author_role : "Engineering Team"),
      author_avatar:
        input.author_avatar ||
        (existing
          ? existing.author_avatar
          : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"),
      reading_time: input.reading_time || (existing ? existing.reading_time : "6 min read"),
      published_at: input.published_at || (existing ? existing.published_at : now),
      is_featured: input.is_featured ?? (existing ? existing.is_featured : false),
      status: input.status ?? (existing ? existing.status : "published"),
      meta_title: input.meta_title || (existing ? existing.meta_title : undefined),
      meta_description: input.meta_description || (existing ? existing.meta_description : undefined),
      og_image: input.og_image || (existing ? existing.og_image : undefined),
      order_index: input.order_index ?? (existing ? existing.order_index : this.posts.size + 1),
      created_at: existing ? existing.created_at : now,
      updated_at: now,
    };

    // If marked as featured, unfeature other posts
    if (item.is_featured) {
      for (const p of this.posts.values()) {
        if (p.id !== id && p.is_featured) {
          p.is_featured = false;
        }
      }
    }

    this.posts.set(id, item);
    this.persistToStorage();
    return item;
  }

  public deletePost(id: string): boolean {
    const res = this.posts.delete(id);
    this.persistToStorage();
    return res;
  }

  public updateConfig(partial: Partial<BlogConfig>): BlogConfig {
    this.config = { ...this.config, ...partial };
    this.persistToStorage();
    return this.config;
  }

  public updateCategories(categories: string[]): string[] {
    // Sync provided string names as category items
    const existingItems = Array.from(this.categoryItems.values());
    const existingByName = new Map(existingItems.map((c) => [c.name.toLowerCase(), c]));
    
    categories.forEach((name, idx) => {
      if (name === "All Posts") return;
      const lower = name.toLowerCase();
      if (existingByName.has(lower)) {
        const item = existingByName.get(lower)!;
        item.order_index = idx + 1;
        item.status = "active";
        this.categoryItems.set(item.id, item);
      } else {
        const id = `cat-${Date.now()}-${idx}`;
        this.categoryItems.set(id, {
          id,
          name,
          slug: slugifyBlogCategory(name),
          status: "active",
          order_index: idx + 1,
          created_at: new Date().toISOString(),
        });
      }
    });

    this.persistToStorage();
    return this.getCategoryNames();
  }
}

// Global persistent instance on server
const globalForBlog = globalThis as unknown as { __dimisi_blog_store__?: MemoryBlogStore };
export const blogStore = globalForBlog.__dimisi_blog_store__ || new MemoryBlogStore();
if (process.env.NODE_ENV !== "production") {
  globalForBlog.__dimisi_blog_store__ = blogStore;
}
