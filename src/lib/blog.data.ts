/**
 * In-memory persistence and seed store for DIMISI Blog & Editorial Publication System.
 * Supports full CRUD for blog posts, featured articles, categories, and notice config.
 */

import {
  type BlogPostItem,
  type BlogPostInput,
  type BlogConfig,
  type PublicBlogPayload,
  slugifyBlog,
  validateBlogPostInput,
} from "./blog.shared";

const INITIAL_BLOG_CONFIG: BlogConfig = {
  hero_eyebrow: "Blog",
  hero_heading: "Ideas, Insights & Updates",
  hero_subline: "Thoughts on building software, shipping products, and the technology shaping tomorrow.",
  under_development_notice_active: true,
  under_development_notice_heading: "Publication Lab Under Active Development",
  under_development_notice_text: "Blog section under development. Please visit again after some time.",
};

const DEFAULT_CATEGORIES = [
  "All Posts",
  "Web",
  "Mobile",
  "AI",
  "Cloud",
  "Startups",
  "Technology Trends",
];

const INITIAL_POSTS: BlogPostItem[] = [
  {
    id: "post-owl-protocol",
    slug: "owl-protocol",
    title: "The Owl Protocol: Designing Perception Systems That See in the Dark",
    category: "AI",
    tags: ["Computer Vision", "Perception", "Applied ML", "Robotics"],
    excerpt:
      "Why low-light vision remains one of the hardest problems in applied computer vision, and the multi-spectral sensor fusion stack we engineered to solve it.",
    content: `## The Dark Room Dilemma in Autonomous Vision

Low-light optical perception breaks almost all standard machine learning assumptions. When photon count plummets, sensor noise dominates luminance signals, turning high-resolution edge detectors into stochastic noise amplifiers.

### Multi-Spectral Sensor Fusion
To overcome optical decay, we developed the **Owl Sensor Protocol** — combining raw infrared sensor streams with temporal frame integration:

\`\`\`typescript
interface OwlPerceptionFrame {
  timestampNs: bigint;
  luxLevel: number;
  irChannel: Uint8ClampedArray;
  confidenceScore: number;
}
\`\`\`

### Key Architectural Takeaways
1. **Dynamic Gain Scaling:** Adjust exposure windows adaptively across 120fps intervals.
2. **Edge Quantization:** Run int8 quantized tensor networks directly on mobile hardware.
3. **Failover Safety:** Fallback to acoustic radar when ambient illumination drops below 0.05 lux.`,
    cover_image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    cover_caption: "Neural sensor fusion pipeline running at 120fps.",
    author_name: "Dr. Ira Mehta",
    author_role: "Head of AI Research",
    author_avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    reading_time: "9 min read",
    published_at: "2026-08-15T09:00:00Z",
    is_featured: true,
    status: "published",
    meta_title: "The Owl Protocol: Designing Perception Systems That See in the Dark",
    meta_description:
      "Multi-spectral sensor fusion and real-time computer vision architectures for low-light perception.",
    order_index: 1,
    created_at: "2026-08-10T10:00:00Z",
    updated_at: "2026-08-15T09:00:00Z",
  },
  {
    id: "post-agents-production",
    slug: "agents-in-production",
    title: "Agents in Production: What Actually Breaks After Week Three",
    category: "AI",
    tags: ["AI Agents", "Architecture", "Guardrails", "Reliability"],
    excerpt:
      "Twelve production agent deployments, one honest post-mortem. Memory bloat, runaway tool loops, and the deterministic guardrails that saved our systems.",
    content: `## Beyond the Demo Sandbox

Building autonomous agents in a Jupyter notebook is fundamentally different from operating resilient multi-agent swarms under unpredictable user inputs.

### 1. The Context Window Bloat Trap
As conversation turns accumulate, unbounded chat histories degrade attention weights. We enforce sliding window summarizers with structured key-value state graphs.

### 2. Guardrails & Circuit Breakers
- **Maximum recursion depth:** 5 sub-turns per user action.
- **Budget caps:** Hardware token throttle per tenant.
- **Deterministic verification:** Pre-execution JSON Schema enforcement.`,
    cover_image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
    author_name: "Kabir Rao",
    author_role: "Lead Platform Architect",
    author_avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    reading_time: "12 min read",
    published_at: "2026-08-10T08:00:00Z",
    is_featured: false,
    status: "published",
    order_index: 2,
    created_at: "2026-08-05T12:00:00Z",
    updated_at: "2026-08-10T08:00:00Z",
  },
  {
    id: "post-cinematic-web",
    slug: "cinematic-webgl-performance",
    title: "Shipping Cinematic WebGL Without Destroying Your Lighthouse Score",
    category: "Web",
    tags: ["WebGL", "Three.js", "Performance", "Shaders"],
    excerpt:
      "Budgeting draw calls, deferred canvas rendering, and the exact threshold where adding another particle shader harms mobile conversions.",
    content: `## 60FPS on Mobile Without Burning Batteries

Cinematic websites frequently look breathtaking on M3 Max MacBooks but freeze budget Android devices. Here is how we maintain a 98+ Google Lighthouse score with full WebGL scenes.

### Techniques We Rely On:
- **Canvas Visibility Intersection Observers:** Completely suspend render loops when canvases are outside viewport bounds.
- **Geometry Instancing:** Combine hundreds of individual meshes into a single draw call.
- **Half-Precision Float Textures:** Halve memory bandwidth consumption.`,
    cover_image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    author_name: "Naina Sethi",
    author_role: "Creative Technologist",
    author_avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    reading_time: "7 min read",
    published_at: "2026-08-02T10:00:00Z",
    is_featured: false,
    status: "published",
    order_index: 3,
    created_at: "2026-07-28T09:00:00Z",
    updated_at: "2026-08-02T10:00:00Z",
  },
  {
    id: "post-cloud-gpu-economics",
    slug: "cloud-gpu-economics",
    title: "Cloud GPU Economics for Teams That Are Not Hyperscalers",
    category: "Cloud",
    tags: ["Cloud", "DevOps", "Infrastructure", "Cost Optimization"],
    excerpt:
      "Spot instances, intelligent batching windows, and 4-bit quantization: three architectural levers that reduced our serverless inference bills by 63%.",
    content: `## The Reality of AI Inference Budgets

Running state-of-the-art models 24/7 can quickly exhaust early startup capital. We restructured our cluster routing to optimize GPU saturation.

### The 3 Optimization Pillars:
1. **Dynamic Spot Bidding:** Orchestrating ephemeral GPU nodes across multiple cloud zones.
2. **Batch Queue Aggregation:** Queuing non-urgent background tasks for off-peak computation windows.
3. **Model Quantization:** Shifting from FP16 to AWQ 4-bit with under 0.8% loss in benchmark accuracy.`,
    cover_image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    author_name: "Dr. Ira Mehta",
    author_role: "Head of AI Research",
    author_avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    reading_time: "8 min read",
    published_at: "2026-07-25T11:00:00Z",
    is_featured: false,
    status: "published",
    order_index: 4,
    created_at: "2026-07-20T10:00:00Z",
    updated_at: "2026-07-25T11:00:00Z",
  },
  {
    id: "post-startup-mvp-velocity",
    slug: "shipping-mvp-in-two-weeks",
    title: "Shipping Startups from Scratch: The 14-Day Velocity Playbook",
    category: "Startups",
    tags: ["Startups", "Product Thinking", "Velocity", "Lean"],
    excerpt:
      "Why early stage founders get stuck in architecture rabbit holes and the modular development framework we use to test market validation in 14 days.",
    content: `## Velocity Is Your Only Unfair Advantage

When launching an early-stage product, building for 10 million concurrent users before gaining your first 100 paying customers is a fatal mistake.

### Our Lean Principles:
- Single-schema database architectures with automated migration rollbacks.
- Edge SSR with pre-built component systems for lightning fast iteration.
- Real-time user feedback telemetry integrated directly into customer support streams.`,
    cover_image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    author_name: "Kabir Rao",
    author_role: "Lead Platform Architect",
    author_avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    reading_time: "6 min read",
    published_at: "2026-07-18T08:00:00Z",
    is_featured: false,
    status: "published",
    order_index: 5,
    created_at: "2026-07-12T14:00:00Z",
    updated_at: "2026-07-18T08:00:00Z",
  },
];

class MemoryBlogStore {
  private posts: Map<string, BlogPostItem> = new Map();
  private config: BlogConfig = { ...INITIAL_BLOG_CONFIG };
  private categories: string[] = [...DEFAULT_CATEGORIES];

  constructor() {
    INITIAL_POSTS.forEach((p) => this.posts.set(p.id, { ...p }));
  }

  public getPublicPayload(): PublicBlogPayload {
    const list = Array.from(this.posts.values())
      .filter((p) => p.status === "published")
      .sort((a, b) => a.order_index - b.order_index);

    const featured = list.find((p) => p.is_featured) || (list.length > 0 ? list[0] : null);

    return {
      config: { ...this.config },
      featured_post: featured ? { ...featured } : null,
      posts: list,
      categories: [...this.categories],
      stats: {
        totalPosts: list.length,
        totalCategories: this.categories.length - 1, // minus 'All Posts'
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

    // If marked as featured, optionally unfeature other posts
    if (item.is_featured) {
      for (const p of this.posts.values()) {
        if (p.id !== id && p.is_featured) {
          p.is_featured = false;
        }
      }
    }

    this.posts.set(id, item);
    return item;
  }

  public deletePost(id: string): boolean {
    return this.posts.delete(id);
  }

  public updateConfig(partial: Partial<BlogConfig>): BlogConfig {
    this.config = { ...this.config, ...partial };
    return this.config;
  }

  public updateCategories(categories: string[]): string[] {
    this.categories = [...categories];
    return this.categories;
  }
}

// Global persistent instance on server
const globalForBlog = globalThis as unknown as { __dimisi_blog_store__?: MemoryBlogStore };
export const blogStore = globalForBlog.__dimisi_blog_store__ || new MemoryBlogStore();
if (process.env.NODE_ENV !== "production") {
  globalForBlog.__dimisi_blog_store__ = blogStore;
}
